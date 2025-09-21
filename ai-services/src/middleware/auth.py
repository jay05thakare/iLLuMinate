"""
Authentication middleware for AI services
"""

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from fastapi import HTTPException, Depends

from ..utils.logger import get_logger

logger = get_logger(__name__)


class AuthMiddleware(BaseHTTPMiddleware):
    """
    Authentication middleware
    Validates JWT tokens for protected endpoints
    """
    
    def __init__(self, app):
        super().__init__(app)
        # Endpoints that don't require authentication
        self.public_endpoints = {
            "/",
            "/docs",
            "/redoc",
            "/openapi.json",
            "/health",
            "/health/",
            "/health/ready",
            "/health/live"
        }
    
    async def dispatch(self, request: Request, call_next):
        """
        Process the request and check authentication
        
        Args:
            request: HTTP request
            call_next: Next middleware in chain
            
        Returns:
            Response: HTTP response
        """
        
        # Skip authentication for public endpoints
        if request.url.path in self.public_endpoints:
            response = await call_next(request)
            return response
        
        # TODO: Implement JWT token validation
        # For Phase 1, we'll skip authentication
        logger.debug(f"Processing request to {request.url.path}")
        
        # Add placeholder user context
        request.state.user = {
            "id": "placeholder-user-id",
            "organization_id": "placeholder-org-id",
            "role": "user"
        }
        
        response = await call_next(request)
        return response


def api_key_auth(request: Request) -> str:
    """
    API key authentication dependency for FastAPI endpoints
    
    Args:
        request: HTTP request (optional, can be injected by FastAPI)
        
    Returns:
        str: API key if valid
        
    Raises:
        HTTPException: If API key is missing or invalid
    """
    # For Phase 1, we'll accept any API key or allow requests without one
    # In production, this should validate against a real API key store
    
    # Check for API key in headers
    api_key = None
    if request:
        api_key = request.headers.get("X-API-Key") or request.headers.get("Authorization")
        
        # If Authorization header, extract the key part
        if api_key and api_key.startswith("Bearer "):
            api_key = api_key[7:]  # Remove "Bearer " prefix
    
    # For development, accept any API key or no key
    logger.debug(f"API key auth check: {'provided' if api_key else 'not provided'}")
    
    # Return the key or a placeholder
    return api_key or "development-key"


def get_current_user(request: Request) -> dict:
    """
    Get current user dependency for FastAPI endpoints
    
    Args:
        request: HTTP request
        
    Returns:
        dict: User information
        
    Raises:
        HTTPException: If user authentication fails
    """
    # For Phase 1, return a placeholder user
    # In production, this should validate JWT tokens and return real user data
    
    # Check if user was set by middleware
    if hasattr(request.state, 'user') and request.state.user:
        return request.state.user
    
    # Return default user for development
    logger.debug("Using placeholder user for development")
    return {
        "id": "dev-user-id",
        "organization_id": "dev-org-id", 
        "role": "user",
        "email": "dev@example.com"
    }

