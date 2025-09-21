#!/usr/bin/env python3
"""
Test script for Cement GPT functionality
"""

import asyncio
import json
import os
import sys
from pathlib import Path

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent / "src"))

from src.cement_gpt import CementGPTService
from src.services.chat_service import ChatService
from src.config.settings import get_settings


async def test_cement_gpt():
    """Test Cement GPT functionality"""
    
    print("🤖 Testing Cement GPT Service")
    print("=" * 50)
    
    # Initialize services
    print("Initializing services...")
    gpt_service = CementGPTService()
    chat_service = ChatService()
    settings = get_settings()
    
    # Check API key configuration
    print(f"OpenAI API Key configured: {'Yes' if settings.openai_api_key else 'No (Demo mode)'}")
    print(f"Model: {settings.openai_model}")
    print(f"Max tokens: {settings.openai_max_tokens}")
    print()
    
    # Test model info
    print("📊 Getting model information...")
    model_info = await gpt_service.get_model_info()
    print(json.dumps(model_info, indent=2))
    print()
    
    # Test session creation
    print("📝 Creating chat session...")
    session_id = await chat_service.create_session(
        user_id="test_user",
        facility_id="test_facility"
    )
    print(f"Session ID: {session_id}")
    print()
    
    # Test chat interactions
    test_questions = [
        "Hello, what can you help me with?",
        "What are the main sources of emissions in cement manufacturing?",
        "How can we reduce CO2 emissions in cement production?",
        "What are alternative fuels used in cement industry?",
        "Explain the difference between Scope 1 and Scope 2 emissions"
    ]
    
    print("💬 Testing chat interactions...")
    print("-" * 30)
    
    for i, question in enumerate(test_questions, 1):
        print(f"\n[Question {i}]: {question}")
        
        # Add user message to session
        await chat_service.add_message(session_id, "user", question)
        
        # Get chat history for context
        chat_history = await chat_service.get_chat_history(session_id, count=10)
        
        # Generate AI response
        try:
            ai_result = await gpt_service.generate_response(
                user_message=question,
                facility_data=None,
                chat_history=chat_history
            )
            
            # Add AI response to session
            await chat_service.add_message(
                session_id=session_id,
                role="assistant",
                content=ai_result["response"],
                metadata={
                    "model": ai_result.get("model"),
                    "usage": ai_result.get("usage", {})
                }
            )
            
            print(f"[Response]: {ai_result['response']}")
            
            if ai_result.get("usage"):
                usage = ai_result["usage"]
                print(f"[Usage]: {usage.get('total_tokens', 0)} tokens (prompt: {usage.get('prompt_tokens', 0)}, completion: {usage.get('completion_tokens', 0)})")
            
            if ai_result.get("demo_mode"):
                print("[Note]: Running in demo mode")
                
        except Exception as e:
            print(f"[Error]: {e}")
        
        print("-" * 50)
    
    # Test session management
    print("\n🗂️ Testing session management...")
    session_info = await chat_service.get_session_info(session_id)
    print(f"Session info: {json.dumps(session_info, indent=2, default=str)}")
    
    # Get session stats
    stats = await chat_service.get_session_stats()
    print(f"Chat stats: {json.dumps(stats, indent=2)}")
    
    print("\n✅ Test completed successfully!")


async def test_api_key_validation():
    """Test OpenAI API key validation"""
    print("\n🔑 Testing API key validation...")
    
    gpt_service = CementGPTService()
    
    if gpt_service.client:
        try:
            is_valid = await gpt_service.validate_api_key()
            print(f"API key validation result: {'Valid' if is_valid else 'Invalid'}")
        except Exception as e:
            print(f"API key validation error: {e}")
    else:
        print("No OpenAI client available (demo mode)")


def print_usage():
    """Print usage instructions"""
    print("""
🚀 Cement GPT Test Script Usage:

Prerequisites:
1. Install dependencies: pip install -r requirements.txt
2. Configure OpenAI API key in environment variables:
   export OPENAI_API_KEY=your_api_key_here

Running the test:
   python test_cement_gpt.py

What this test does:
- Initializes Cement GPT service
- Creates a chat session
- Tests multiple cement industry questions
- Demonstrates conversation context
- Shows token usage (if OpenAI API is available)

Note: If no OpenAI API key is provided, the service runs in demo mode.
""")


async def main():
    """Main test function"""
    
    # Check if help is requested
    if len(sys.argv) > 1 and sys.argv[1] in ["--help", "-h", "help"]:
        print_usage()
        return
    
    try:
        await test_cement_gpt()
        await test_api_key_validation()
        
    except KeyboardInterrupt:
        print("\n\n⏹️ Test interrupted by user")
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    print("🏗️ iLLuMinate Cement GPT Test")
    print("Cement Industry AI Assistant")
    print("=" * 50)
    
    # Run the test
    asyncio.run(main())
