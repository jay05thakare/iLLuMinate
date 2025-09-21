"""
Generic OpenAI API Client
Handles low-level OpenAI API interactions
"""

import logging
from datetime import datetime
from typing import Dict, List, Optional, Any

from openai import AsyncOpenAI

from ..config.settings import get_settings
from ..utils.logger import get_logger

logger = get_logger(__name__)
settings = get_settings()


class OpenAIClient:
    """
    Generic OpenAI API client for chat completions
    """
    
    def __init__(self):
        """Initialize OpenAI client"""
        self.client = None
        self.model = "gpt-4"  # Force GPT-4 usage
        self.max_tokens = 4000  # Increase tokens for GPT-4
        self.temperature = settings.openai_temperature
        self._initialize_client()
        
    def _initialize_client(self):
        """Initialize OpenAI client"""
        try:
            if not settings.openai_api_key or settings.openai_api_key == "your_openai_api_key_here":
                logger.warning("OpenAI API key not provided. Client will run in unavailable mode.")
                return
                
            self.client = AsyncOpenAI(
                api_key=settings.openai_api_key
            )
            logger.info("OpenAI client initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize OpenAI client: {e}")
            self.client = None

    async def chat_completion(
        self, 
        messages: List[Dict[str, str]], 
        model: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Create a chat completion using OpenAI API
        
        Args:
            messages: List of message dictionaries
            model: Optional model override
            max_tokens: Optional max tokens override
            temperature: Optional temperature override
            **kwargs: Additional OpenAI parameters
            
        Returns:
            Dict containing response data
        """
        if not self.client:
            raise Exception("OpenAI client not available")
        
        try:
            response = await self.client.chat.completions.create(
                model=model or self.model,
                messages=messages,
                max_tokens=max_tokens or self.max_tokens,
                temperature=temperature or self.temperature,
                presence_penalty=kwargs.get('presence_penalty', 0.1),
                frequency_penalty=kwargs.get('frequency_penalty', 0.1),
                **{k: v for k, v in kwargs.items() if k not in ['presence_penalty', 'frequency_penalty']}
            )
            
            ai_response = response.choices[0].message.content.strip()
            
            # Extract usage information
            usage = {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens
            } if response.usage else {}
            
            return {
                "response": ai_response,
                "model": model or self.model,
                "usage": usage,
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "success": True
            }
            
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            raise Exception(f"OpenAI API call failed: {str(e)}")
    
    async def validate_api_key(self) -> bool:
        """
        Validate OpenAI API key
        
        Returns:
            bool: True if API key is valid
        """
        try:
            if not self.client:
                return False
                
            # Test with a simple request
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": "test"}],
                max_tokens=5
            )
            return True
            
        except Exception as e:
            logger.error(f"API key validation failed: {e}")
            return False
    
    def is_available(self) -> bool:
        """
        Check if OpenAI client is available
        
        Returns:
            bool: True if client is initialized and ready
        """
        return self.client is not None
    
    def get_model_info(self) -> Dict[str, Any]:
        """
        Get information about the current model configuration
        
        Returns:
            Model configuration information
        """
        return {
            "model": self.model,
            "max_tokens": self.max_tokens,
            "temperature": self.temperature,
            "api_available": self.is_available(),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }


# Global client instance
openai_client = OpenAIClient()


async def get_openai_client() -> OpenAIClient:
    """
    Get OpenAI client instance
    
    Returns:
        OpenAIClient: Client instance
    """
    return openai_client
