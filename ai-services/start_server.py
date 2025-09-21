#!/usr/bin/env python3
"""
Startup script for AI services with debugging
"""

import sys
import os
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

print("🚀 Starting iLLuMinate AI Services...")
print(f"Python version: {sys.version}")
print(f"Current directory: {os.getcwd()}")
print(f"PYTHONPATH: {sys.path}")

try:
    print("\n📋 Importing modules...")
    from src.main import app
    print("✅ Successfully imported main app")
    
    from src.cement_gpt import CementGPTService
    print("✅ Successfully imported CementGPTService")
    
    from src.services.chat_service import ChatService  
    print("✅ Successfully imported ChatService")
    
    from src.config.settings import get_settings
    settings = get_settings()
    print(f"✅ Settings loaded - Environment: {settings.environment}")
    
    print("\n🔧 Testing service initialization...")
    
    # Test service initialization
    gpt_service = CementGPTService()
    print("✅ CementGPTService initialized")
    
    chat_service = ChatService()
    print("✅ ChatService initialized")
    
    print("\n🌐 Starting FastAPI server...")
    
    import uvicorn
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=settings.port,
        reload=True,
        log_level="info"
    )
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
