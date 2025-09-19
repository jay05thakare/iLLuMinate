"""
Error handling middleware for AI services
"""

import traceback
from datetime import datetime
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from ..utils.logger import get_logger

logger = get_logger(__name__)


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """
    Global error handling middleware
    Catches and formats unhandled exceptions
    """
    
    async def dispatch(self, request: Request, call_next):
        """
        Process the request and handle any unhandled exceptions
        
        Args:
            request: HTTP request
            call_next: Next middleware in chain
            
        Returns:
            Response: HTTP response
        """
        
        try:
            response = await call_next(request)
            return response
            
        except Exception as exc:
            # Log the error
            error_details = {
                "error": str(exc),
                "path": request.url.path,
                "method": request.method,
                "headers": dict(request.headers),
                "user_agent": request.headers.get("user-agent"),
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
            
            logger.error(f"Unhandled exception: {exc}", extra=error_details)
            logger.debug(f"Stack trace: {traceback.format_exc()}")
            
            # Return formatted error response
            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "error": {
                        "message": "Internal server error",
                        "code": "INTERNAL_ERROR",
                        "timestamp": datetime.utcnow().isoformat() + "Z"
                    }
                }
            )

