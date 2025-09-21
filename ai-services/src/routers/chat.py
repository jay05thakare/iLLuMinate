"""
Cement GPT Chat API endpoints
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel, Field

from ..utils.logger import get_logger
from ..cement_gpt import get_cement_gpt_service, CementGPTService
from ..services.chat_service import get_chat_service, ChatService

router = APIRouter()
logger = get_logger(__name__)


class ChatRequest(BaseModel):
    """Chat request model"""
    message: str = Field(..., description="User's message to Cement GPT", min_length=1, max_length=2000)
    facility_id: Optional[str] = Field(None, description="Optional facility ID for context")
    session_id: Optional[str] = Field(None, description="Optional session ID for continuing conversation")
    user_id: Optional[str] = Field(None, description="Optional user ID")


class ChatResponse(BaseModel):
    """Chat response model"""
    response: str = Field(..., description="AI response")
    session_id: str = Field(..., description="Session ID for conversation tracking")
    timestamp: str = Field(..., description="Response timestamp")
    model: str = Field(..., description="AI model used")
    usage: Dict[str, Any] = Field(default_factory=dict, description="Token usage information")
    facility_context: bool = Field(False, description="Whether facility context was used")


class SessionCreateRequest(BaseModel):
    """Session creation request model"""
    user_id: Optional[str] = Field(None, description="Optional user ID")
    facility_id: Optional[str] = Field(None, description="Optional facility ID for context")


class SessionResponse(BaseModel):
    """Session response model"""
    session_id: str = Field(..., description="Session ID")
    created_at: str = Field(..., description="Session creation timestamp")
    user_id: Optional[str] = Field(None, description="User ID")
    facility_id: Optional[str] = Field(None, description="Facility ID")


class ChatHistoryResponse(BaseModel):
    """Chat history response model"""
    session_id: str = Field(..., description="Session ID")
    messages: List[Dict[str, Any]] = Field(..., description="Chat messages")
    message_count: int = Field(..., description="Total number of messages")
    created_at: str = Field(..., description="Session creation timestamp")
    last_activity: str = Field(..., description="Last activity timestamp")


@router.post("/cement-gpt", response_model=Dict[str, Any])
async def chat_with_cement_gpt(
    request: ChatRequest,
    gpt_service: CementGPTService = Depends(get_cement_gpt_service),
    chat_service: ChatService = Depends(get_chat_service)
):
    """
    Chat with Cement GPT
    
    Args:
        request: Chat request containing message and optional context
        gpt_service: CementGPT service dependency
        chat_service: Chat service dependency
        
    Returns:
        dict: Chat response with AI-generated content
    """
    try:
        logger.info(f"Processing chat request: {request.message[:100]}...")
        
        # Get or create session
        session_id = request.session_id
        if not session_id:
            session_id = await chat_service.create_session(
                user_id=request.user_id,
                facility_id=request.facility_id
            )
        
        # Get session for context
        session = await chat_service.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Add user message to history
        await chat_service.add_message(
            session_id=session_id,
            role="user",
            content=request.message
        )
        
        # Get chat history for context
        chat_history = await chat_service.get_chat_history(session_id, count=10)
        
        # TODO: Get facility data from backend API if facility_id provided
        facility_data = None
        if request.facility_id:
            # This will be implemented when we integrate with backend
            pass
        
        # Generate AI response
        ai_result = await gpt_service.generate_response(
            user_message=request.message,
            facility_data=facility_data,
            chat_history=chat_history
        )
        
        # Add AI response to history
        await chat_service.add_message(
            session_id=session_id,
            role="assistant",
            content=ai_result["response"],
            metadata={
                "model": ai_result.get("model"),
                "usage": ai_result.get("usage", {})
            }
        )
        
        # Prepare response
        response_data = {
            "success": True,
            "data": {
                "response": ai_result["response"],
                "session_id": session_id,
                "timestamp": ai_result["timestamp"],
                "model": ai_result.get("model", "unknown"),
                "usage": ai_result.get("usage", {}),
                "facility_context": facility_data is not None,
                "demo_mode": ai_result.get("demo_mode", False)
            },
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
        logger.info(f"Generated response for session {session_id}")
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error while processing chat request"
        )


@router.post("/sessions", response_model=Dict[str, Any])
async def create_chat_session(
    request: SessionCreateRequest,
    chat_service: ChatService = Depends(get_chat_service)
):
    """
    Create a new chat session
    
    Args:
        request: Session creation request
        chat_service: Chat service dependency
        
    Returns:
        dict: Session information
    """
    try:
        session_id = await chat_service.create_session(
            user_id=request.user_id,
            facility_id=request.facility_id
        )
        
        session_info = await chat_service.get_session_info(session_id)
        
        return {
            "success": True,
            "data": {
                "session_id": session_id,
                "created_at": session_info["created_at"],
                "user_id": request.user_id,
                "facility_id": request.facility_id
            },
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
    except Exception as e:
        logger.error(f"Error creating session: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to create chat session"
        )


@router.get("/sessions/{session_id}/history", response_model=Dict[str, Any])
async def get_chat_history(
    session_id: str,
    count: Optional[int] = Query(None, description="Number of recent messages to return"),
    chat_service: ChatService = Depends(get_chat_service)
):
    """
    Get chat history for a session
    
    Args:
        session_id: Chat session ID
        count: Optional number of recent messages to return
        chat_service: Chat service dependency
        
    Returns:
        dict: Chat history
    """
    try:
        session_info = await chat_service.get_session_info(session_id)
        if not session_info:
            raise HTTPException(status_code=404, detail="Session not found")
        
        history = await chat_service.get_chat_history(session_id, count)
        
        return {
            "success": True,
            "data": {
                "session_id": session_id,
                "messages": history or [],
                "message_count": len(history) if history else 0,
                "created_at": session_info["created_at"],
                "last_activity": session_info["last_activity"],
                "user_id": session_info.get("user_id"),
                "facility_id": session_info.get("facility_id")
            },
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting chat history for session {session_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve chat history"
        )


@router.get("/sessions", response_model=Dict[str, Any])
async def list_chat_sessions(
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    facility_id: Optional[str] = Query(None, description="Filter by facility ID"),
    chat_service: ChatService = Depends(get_chat_service)
):
    """
    List chat sessions
    
    Args:
        user_id: Optional filter by user ID
        facility_id: Optional filter by facility ID
        chat_service: Chat service dependency
        
    Returns:
        dict: List of sessions
    """
    try:
        sessions = await chat_service.list_sessions(
            user_id=user_id,
            facility_id=facility_id
        )
        
        return {
            "success": True,
            "data": {
                "sessions": sessions,
                "count": len(sessions)
            },
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
    except Exception as e:
        logger.error(f"Error listing sessions: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to list chat sessions"
        )


@router.delete("/sessions/{session_id}", response_model=Dict[str, Any])
async def delete_chat_session(
    session_id: str,
    chat_service: ChatService = Depends(get_chat_service)
):
    """
    Delete a chat session
    
    Args:
        session_id: Session ID to delete
        chat_service: Chat service dependency
        
    Returns:
        dict: Deletion confirmation
    """
    try:
        success = await chat_service.delete_session(session_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return {
            "success": True,
            "message": "Session deleted successfully",
            "data": {
                "session_id": session_id
            },
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting session {session_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to delete chat session"
        )


@router.get("/stats", response_model=Dict[str, Any])
async def get_chat_stats(
    chat_service: ChatService = Depends(get_chat_service)
):
    """
    Get chat service statistics
    
    Args:
        chat_service: Chat service dependency
        
    Returns:
        dict: Chat statistics
    """
    try:
        stats = await chat_service.get_session_stats()
        
        return {
            "success": True,
            "data": stats,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
    except Exception as e:
        logger.error(f"Error getting chat stats: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve chat statistics"
        )


@router.get("/model-info", response_model=Dict[str, Any])
async def get_model_info(
    gpt_service: CementGPTService = Depends(get_cement_gpt_service)
):
    """
    Get information about the AI model
    
    Args:
        gpt_service: CementGPT service dependency
        
    Returns:
        dict: Model information
    """
    try:
        model_info = await gpt_service.get_model_info()
        
        return {
            "success": True,
            "data": model_info,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
    except Exception as e:
        logger.error(f"Error getting model info: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve model information"
        )