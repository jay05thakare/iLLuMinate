"""
iLLuMinate AI Services
Main FastAPI application for AI-powered features
"""

import os
import logging
from datetime import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel
import uvicorn

from .config.settings import get_settings
from .utils.logger import setup_logger
from .routers import health, recommendations, chat
from .middleware.auth_middleware import AuthMiddleware
from .middleware.error_handler import ErrorHandlerMiddleware

# Initialize settings and logger
settings = get_settings()
logger = setup_logger()

class HealthResponse(BaseModel):
    """Health check response model"""
    status: str
    timestamp: str
    version: str
    environment: str
    services: dict

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan context manager
    Handles startup and shutdown events
    """
    # Startup
    logger.info("🤖 Starting iLLuMinate AI Services...")
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"Version: {settings.version}")
    
    # Initialize database connections, ML models, etc.
    try:
        # TODO: Initialize AI models, database connections
        logger.info("AI services initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize AI services: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down iLLuMinate AI Services...")
    # Cleanup resources

def create_app() -> FastAPI:
    """
    Create and configure FastAPI application
    
    Returns:
        FastAPI: Configured FastAPI application
    """
    
    app = FastAPI(
        title="iLLuMinate AI Services",
        description="AI-powered features for cement industry sustainability management",
        version=settings.version,
        docs_url="/docs" if settings.environment == "development" else None,
        redoc_url="/redoc" if settings.environment == "development" else None,
        openapi_url="/openapi.json" if settings.environment == "development" else None,
        lifespan=lifespan
    )
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )
    
    # Add custom middleware
    app.add_middleware(AuthMiddleware)
    app.add_middleware(ErrorHandlerMiddleware)
    
    # Include routers
    app.include_router(health.router, prefix="/health", tags=["health"])
    app.include_router(recommendations.router, prefix="/api/recommendations", tags=["recommendations"])
    app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
    
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        """Handle validation errors"""
        return JSONResponse(
            status_code=422,
            content={
                "success": False,
                "error": {
                    "message": "Validation failed",
                    "code": "VALIDATION_ERROR",
                    "details": exc.errors(),
                    "timestamp": datetime.utcnow().isoformat() + "Z"
                }
            }
        )
    
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        """Handle HTTP exceptions"""
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "error": {
                    "message": exc.detail,
                    "code": "HTTP_ERROR",
                    "timestamp": datetime.utcnow().isoformat() + "Z"
                }
            }
        )
    
    @app.get("/", response_model=dict)
    async def root():
        """Root endpoint"""
        return {
            "message": "iLLuMinate AI Services",
            "version": settings.version,
            "status": "running",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "documentation": "/docs" if settings.environment == "development" else None
        }
    
    return app

# Create the app instance
app = create_app()

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.port,
        reload=settings.environment == "development",
        log_level=settings.log_level.lower()
    )

