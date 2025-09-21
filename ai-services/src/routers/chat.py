"""
Cement GPT Chat API endpoints
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query, Depends, Request
from pydantic import BaseModel, Field

from ..utils.logger import get_logger
from ..cement_gpt import get_cement_gpt_service, CementGPTService
from ..services.chat_service import get_chat_service, ChatService
from ..services.cement_agent import get_cement_agent, CementAgent
from ..middleware.auth_middleware import get_current_user, get_current_organization_id

router = APIRouter()
logger = get_logger(__name__)


class ChatRequest(BaseModel):
    """Chat request model"""
    message: str = Field(..., description="User's message to Cement GPT", min_length=1, max_length=2000)
    facility_id: Optional[str] = Field(None, description="Optional facility ID for context")
    session_id: Optional[str] = Field(None, description="Optional session ID for continuing conversation")
    # Note: user_id and organization_id are now extracted from JWT token in auth middleware


class ChatResponse(BaseModel):
    """Chat response model"""
    response: str = Field(..., description="AI response")
    session_id: str = Field(..., description="Session ID for conversation tracking")
    timestamp: str = Field(..., description="Response timestamp")
    model: str = Field(..., description="AI model used")
    usage: Dict[str, Any] = Field(default_factory=dict, description="Token usage information")
    facility_context: bool = Field(False, description="Whether facility context was used")
    agent_analysis: Optional[Dict[str, Any]] = Field(None, description="Agent decision analysis")


class SessionCreateRequest(BaseModel):
    """Session creation request model"""
    facility_id: Optional[str] = Field(None, description="Optional facility ID for context")
    # Note: user_id and organization_id are now extracted from JWT token in auth middleware


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
    chat_request: ChatRequest,
    http_request: Request,
    gpt_service: CementGPTService = Depends(get_cement_gpt_service),
    chat_service: ChatService = Depends(get_chat_service),
    agent: CementAgent = Depends(get_cement_agent)
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
        # Extract user context from JWT token via auth middleware
        current_user = get_current_user(http_request)
        current_org_id = get_current_organization_id(http_request)
        
        user_id = current_user.get("id") if current_user else None
        organization_id = current_org_id or (current_user.get("organization_id") if current_user else None)
        
        logger.info(f"Processing chat request: {chat_request.message[:100]}...")
        logger.info(f"User context: user_id={user_id}, org_id={organization_id}")
        
        # Get or create session
        session_id = chat_request.session_id
        if not session_id:
            session_id = await chat_service.create_session(
                user_id=user_id,
                facility_id=chat_request.facility_id,
                organization_id=organization_id
            )
        
        # Get session for context
        session = await chat_service.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Add user message to history
        await chat_service.add_message(
            session_id=session_id,
            role="user",
            content=chat_request.message
        )
        
        # Get chat history for context
        chat_history = await chat_service.get_chat_history(session_id, count=10)
        
        # Use intelligent agent to analyze question and fetch required context
        logger.info("Using intelligent agent to analyze question and determine data requirements")
        agent_context = await agent.get_intelligent_context(
            question=chat_request.message,
            facility_id=chat_request.facility_id,
            organization_id=organization_id
        )
        
        # Extract facility data for the GPT service
        facility_data = agent_context.get("context", {})
        agent_analysis = agent_context.get("analysis", {})
        agent_decision = agent_context.get("agent_decision", {})
        
        logger.info(f"Agent decision: requires_data={agent_decision.get('requires_data', False)}, "
                   f"confidence={agent_analysis.get('confidence', 0)}, "
                   f"question_type={agent_analysis.get('question_type', 'unknown')}")
        
        # Generate AI response with intelligent context
        ai_result = await gpt_service.generate_response(
            user_message=chat_request.message,
            facility_data=facility_data if agent_decision.get('requires_data', False) else None,
            chat_history=chat_history
        )
        
        # Add agent information to the response
        ai_result["agent_analysis"] = {
            "question_type": agent_analysis.get("question_type"),
            "data_requirements": agent_analysis.get("data_requirements", []),
            "confidence": agent_analysis.get("confidence", 0),
            "reasoning": agent_analysis.get("reasoning", ""),
            "requires_data": agent_decision.get("requires_data", False),
            "data_types_fetched": agent_decision.get("data_types_fetched", []),
            "context_type": facility_data.get("context_type", "general")
        }
        
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
        
        # Save chat history to database (asynchronously, don't fail if it doesn't work)
        try:
            from ..services.backend_service import BackendService
            backend_service = BackendService()
            await backend_service.save_chat_history(
                organization_id=organization_id,
                user_id=user_id,
                facility_id=chat_request.facility_id,
                session_id=session_id,
                message=chat_request.message,
                response=ai_result["response"]
            )
            logger.debug(f"Successfully saved chat history to database for session {session_id}")
        except Exception as e:
            logger.warning(f"Failed to save chat history to database: {e}")
            # Don't fail the request if database save fails
        
        # Prepare response
        response_data = {
            "success": True,
            "data": {
                "response": ai_result["response"],
                "session_id": session_id,
                "timestamp": ai_result["timestamp"],
                "model": ai_result.get("model", "unknown"),
                "usage": ai_result.get("usage", {}),
                "facility_context": agent_decision.get("requires_data", False),
                "demo_mode": ai_result.get("demo_mode", False),
                "agent_analysis": ai_result.get("agent_analysis", {})
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
    session_request: SessionCreateRequest,
    http_request: Request,
    chat_service: ChatService = Depends(get_chat_service)
):
    """
    Create a new chat session
    
    Args:
        session_request: Session creation request
        http_request: HTTP request to extract user context from JWT
        chat_service: Chat service dependency
        
    Returns:
        dict: Session information
    """
    try:
        # Extract user context from JWT token via auth middleware
        current_user = get_current_user(http_request)
        current_org_id = get_current_organization_id(http_request)
        
        user_id = current_user.get("id") if current_user else None
        organization_id = current_org_id or (current_user.get("organization_id") if current_user else None)
        
        logger.info(f"Creating chat session for user_id={user_id}, org_id={organization_id}")
        
        session_id = await chat_service.create_session(
            user_id=user_id,
            facility_id=session_request.facility_id,
            organization_id=organization_id
        )
        
        session_info = await chat_service.get_session_info(session_id)
        
        return {
            "success": True,
            "data": {
                "session_id": session_id,
                "created_at": session_info["created_at"],
                "user_id": user_id,
                "facility_id": session_request.facility_id
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