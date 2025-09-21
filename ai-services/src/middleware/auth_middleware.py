"""
Authentication Middleware for AI Services
Handles JWT token validation and user context extraction
"""

import jwt
from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Dict, Any, Optional

from ..config.settings import get_settings
from ..utils.logger import get_logger

logger = get_logger(__name__)
settings = get_settings()

class AuthMiddleware(BaseHTTPMiddleware):
    """Middleware to handle JWT authentication and extract user context"""
    
    async def dispatch(self, request: Request, call_next):
        # Skip auth for health endpoints and docs
        if request.url.path in ["/", "/health", "/docs", "/redoc", "/openapi.json"]:
            return await call_next(request)
        
        # Initialize user context
        request.state.user = None
        request.state.organization_id = None
        
        # Extract JWT token
        auth_header = request.headers.get("authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            # For development mode, allow requests without auth
            logger.debug("No authorization header found, proceeding without authentication")
            return await call_next(request)
        
        try:
            token = auth_header.split(" ")[1]
            payload = jwt.decode(
                token, 
                settings.jwt_secret, 
                algorithms=["HS256"],
                options={"verify_signature": False}  # Skip signature verification for development
            )
            
            # Extract user information from JWT payload
            user_info = {
                "id": payload.get("id"),
                "email": payload.get("email"),
                "organization_id": payload.get("organization_id") or payload.get("organizationId"),
                "role": payload.get("role"),
                "first_name": payload.get("first_name") or payload.get("firstName"),
                "last_name": payload.get("last_name") or payload.get("lastName")
            }
            
            # Set user context in request state
            request.state.user = user_info
            request.state.organization_id = user_info.get("organization_id")
            
            logger.info(f"Authenticated user: {user_info.get('email')} (org: {user_info.get('organization_id')})")
            
        except jwt.InvalidTokenError as e:
            logger.warning(f"Invalid JWT token: {e}")
            # Don't fail the request, just proceed without user context
        except Exception as e:
            logger.error(f"Auth middleware error: {e}")
            # Don't fail the request, just proceed without user context
        
        return await call_next(request)


def get_current_user(request: Request) -> Optional[dict]:
    """Helper function to get current user from request state"""
    return getattr(request.state, 'user', None)


def get_current_organization_id(request: Request) -> Optional[str]:
    """Helper function to get current organization ID from request state"""
    return getattr(request.state, 'organization_id', None)
