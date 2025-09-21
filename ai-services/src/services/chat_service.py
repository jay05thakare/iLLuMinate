"""
Chat Service for managing chat sessions and history
"""

import json
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from uuid import uuid4
import logging

from ..utils.logger import get_logger

logger = get_logger(__name__)


class ChatSession:
    """Represents a chat session"""
    
    def __init__(self, session_id: str, user_id: Optional[str] = None, facility_id: Optional[str] = None, organization_id: Optional[str] = None):
        self.session_id = session_id
        self.user_id = user_id
        self.facility_id = facility_id
        self.organization_id = organization_id
        self.created_at = datetime.utcnow()
        self.last_activity = datetime.utcnow()
        self.messages: List[Dict[str, Any]] = []
        self.metadata: Dict[str, Any] = {}
    
    def add_message(self, role: str, content: str, metadata: Optional[Dict] = None):
        """Add a message to the session"""
        message = {
            "id": str(uuid4()),
            "role": role,  # 'user' or 'assistant'
            "content": content,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "metadata": metadata or {}
        }
        self.messages.append(message)
        self.last_activity = datetime.utcnow()
        
        # Keep only last 50 messages to prevent memory issues
        if len(self.messages) > 50:
            self.messages = self.messages[-50:]
    
    def get_recent_messages(self, count: int = 10) -> List[Dict[str, Any]]:
        """Get recent messages"""
        return self.messages[-count:] if len(self.messages) > count else self.messages
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert session to dictionary"""
        return {
            "session_id": self.session_id,
            "user_id": self.user_id,
            "facility_id": self.facility_id,
            "organization_id": self.organization_id,
            "created_at": self.created_at.isoformat() + "Z",
            "last_activity": self.last_activity.isoformat() + "Z",
            "message_count": len(self.messages),
            "messages": self.messages,
            "metadata": self.metadata
        }


class ChatService:
    """
    Service for managing chat sessions and history
    """
    
    def __init__(self):
        """Initialize chat service"""
        self.sessions: Dict[str, ChatSession] = {}
        self.session_timeout = timedelta(hours=24)  # Session expires after 24 hours
        self._cleanup_task = None
        self._cleanup_started = False
    
    def _ensure_cleanup_task(self):
        """Ensure background cleanup task is running"""
        if not self._cleanup_started:
            try:
                # Only start if we're in an async context
                loop = asyncio.get_running_loop()
                if not self._cleanup_task or self._cleanup_task.done():
                    self._cleanup_task = asyncio.create_task(self._cleanup_expired_sessions())
                self._cleanup_started = True
            except RuntimeError:
                # No event loop running, cleanup will be started when service is used
                pass
    
    async def _cleanup_expired_sessions(self):
        """Background task to cleanup expired sessions"""
        while True:
            try:
                await asyncio.sleep(3600)  # Run every hour
                await self.cleanup_expired_sessions()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in cleanup task: {e}")
    
    async def cleanup_expired_sessions(self):
        """Remove expired sessions"""
        try:
            current_time = datetime.utcnow()
            expired_sessions = []
            
            for session_id, session in self.sessions.items():
                if current_time - session.last_activity > self.session_timeout:
                    expired_sessions.append(session_id)
            
            for session_id in expired_sessions:
                del self.sessions[session_id]
                logger.info(f"Cleaned up expired session: {session_id}")
            
            if expired_sessions:
                logger.info(f"Cleaned up {len(expired_sessions)} expired sessions")
                
        except Exception as e:
            logger.error(f"Error cleaning up expired sessions: {e}")
    
    async def create_session(
        self, 
        user_id: Optional[str] = None, 
        facility_id: Optional[str] = None,
        organization_id: Optional[str] = None
    ) -> str:
        """
        Create a new chat session
        
        Args:
            user_id: Optional user ID
            facility_id: Optional facility ID
            organization_id: Optional organization ID
            
        Returns:
            str: Session ID
        """
        self._ensure_cleanup_task()
        
        session_id = str(uuid4())
        session = ChatSession(session_id, user_id, facility_id, organization_id)
        self.sessions[session_id] = session
        
        logger.info(f"Created new chat session: {session_id}")
        return session_id
    
    async def get_session(self, session_id: str) -> Optional[ChatSession]:
        """
        Get chat session by ID
        
        Args:
            session_id: Session ID
            
        Returns:
            ChatSession or None
        """
        session = self.sessions.get(session_id)
        if session:
            # Update last activity
            session.last_activity = datetime.utcnow()
        return session
    
    async def add_message(
        self, 
        session_id: str, 
        role: str, 
        content: str, 
        metadata: Optional[Dict] = None
    ) -> bool:
        """
        Add message to session
        
        Args:
            session_id: Session ID
            role: Message role ('user' or 'assistant')
            content: Message content
            metadata: Optional metadata
            
        Returns:
            bool: Success status
        """
        try:
            session = await self.get_session(session_id)
            if not session:
                logger.warning(f"Session not found: {session_id}")
                return False
            
            session.add_message(role, content, metadata)
            logger.debug(f"Added message to session {session_id}: {role}")
            return True
            
        except Exception as e:
            logger.error(f"Error adding message to session {session_id}: {e}")
            return False
    
    async def get_chat_history(
        self, 
        session_id: str, 
        count: Optional[int] = None
    ) -> Optional[List[Dict[str, Any]]]:
        """
        Get chat history for session (tries database first, then memory)
        
        Args:
            session_id: Session ID
            count: Optional number of recent messages to return
            
        Returns:
            List of messages or None
        """
        try:
            # Try to get chat history from database first
            try:
                from ..services.backend_service import BackendService
                from ..config.settings import get_settings
                
                # Use httpx to call the backend API directly
                import httpx
                settings = get_settings()
                
                async with httpx.AsyncClient() as client:
                    response = await client.get(
                        f"{settings.backend_api_url}/api/chat/history/{session_id}",
                        headers={
                            "X-API-Key": settings.backend_api_key,
                            "Content-Type": "application/json"
                        },
                        params={"limit": count or 50}
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        if data.get("success") and data.get("data", {}).get("messages"):
                            messages = data["data"]["messages"]
                            logger.debug(f"Retrieved {len(messages)} messages from database for session {session_id}")
                            return messages
                        
            except Exception as db_error:
                logger.debug(f"Database chat history retrieval failed: {db_error}")
                # Fall through to memory-based retrieval
                
            # Fallback to in-memory session data
            session = await self.get_session(session_id)
            if not session:
                return None
            
            if count:
                return session.get_recent_messages(count)
            return session.messages
            
        except Exception as e:
            logger.error(f"Error getting chat history for session {session_id}: {e}")
            return None
    
    async def get_session_info(self, session_id: str) -> Optional[Dict[str, Any]]:
        """
        Get session information
        
        Args:
            session_id: Session ID
            
        Returns:
            Session info or None
        """
        try:
            session = await self.get_session(session_id)
            if not session:
                return None
            
            return session.to_dict()
            
        except Exception as e:
            logger.error(f"Error getting session info for {session_id}: {e}")
            return None
    
    async def delete_session(self, session_id: str) -> bool:
        """
        Delete a chat session
        
        Args:
            session_id: Session ID
            
        Returns:
            bool: Success status
        """
        try:
            if session_id in self.sessions:
                del self.sessions[session_id]
                logger.info(f"Deleted session: {session_id}")
                return True
            return False
            
        except Exception as e:
            logger.error(f"Error deleting session {session_id}: {e}")
            return False
    
    async def list_sessions(
        self, 
        user_id: Optional[str] = None, 
        facility_id: Optional[str] = None,
        organization_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        List chat sessions
        
        Args:
            user_id: Optional filter by user ID
            facility_id: Optional filter by facility ID
            organization_id: Optional filter by organization ID
            
        Returns:
            List of session info
        """
        try:
            sessions = []
            
            for session in self.sessions.values():
                # Apply filters
                if user_id and session.user_id != user_id:
                    continue
                if facility_id and session.facility_id != facility_id:
                    continue
                if organization_id and session.organization_id != organization_id:
                    continue
                
                sessions.append({
                    "session_id": session.session_id,
                    "user_id": session.user_id,
                    "facility_id": session.facility_id,
                    "organization_id": session.organization_id,
                    "created_at": session.created_at.isoformat() + "Z",
                    "last_activity": session.last_activity.isoformat() + "Z",
                    "message_count": len(session.messages)
                })
            
            # Sort by last activity (most recent first)
            sessions.sort(key=lambda x: x["last_activity"], reverse=True)
            return sessions
            
        except Exception as e:
            logger.error(f"Error listing sessions: {e}")
            return []
    
    async def get_session_stats(self) -> Dict[str, Any]:
        """
        Get chat service statistics
        
        Returns:
            Statistics dictionary
        """
        try:
            current_time = datetime.utcnow()
            active_sessions = 0
            total_messages = 0
            
            for session in self.sessions.values():
                total_messages += len(session.messages)
                if current_time - session.last_activity < timedelta(hours=1):
                    active_sessions += 1
            
            return {
                "total_sessions": len(self.sessions),
                "active_sessions": active_sessions,
                "total_messages": total_messages,
                "timestamp": current_time.isoformat() + "Z"
            }
            
        except Exception as e:
            logger.error(f"Error getting session stats: {e}")
            return {
                "total_sessions": 0,
                "active_sessions": 0,
                "total_messages": 0,
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "error": str(e)
            }


# Global service instance
chat_service = ChatService()


async def get_chat_service() -> ChatService:
    """
    Get chat service instance
    
    Returns:
        ChatService: Service instance
    """
    return chat_service
