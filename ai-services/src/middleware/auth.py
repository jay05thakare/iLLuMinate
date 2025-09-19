"""
Authentication middleware for AI services
"""

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from fastapi import HTTPException

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

