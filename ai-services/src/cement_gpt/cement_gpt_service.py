"""
Cement GPT Service
Specialized AI assistant for cement industry using OpenAI
"""

import logging
from datetime import datetime
from typing import Dict, List, Optional, Any

from ..services.openai_client import get_openai_client, OpenAIClient
from ..utils.logger import get_logger
from .prompts import CementPrompts

logger = get_logger(__name__)


class CementGPTService:
    """
    Service for handling Cement GPT interactions
    """
    
    def __init__(self):
        """Initialize the CementGPT service"""
        self.prompts = CementPrompts()
        self._openai_client = None
        
    async def _get_openai_client(self) -> OpenAIClient:
        """Get OpenAI client instance"""
        if not self._openai_client:
            self._openai_client = await get_openai_client()
        return self._openai_client

    async def generate_response(
        self, 
        user_message: str, 
        facility_data: Optional[Dict] = None,
        chat_history: Optional[List[Dict]] = None
    ) -> Dict[str, Any]:
        """
        Generate response from Cement GPT
        
        Args:
            user_message: User's message
            facility_data: Optional facility-specific data
            chat_history: Optional chat history for context
            
        Returns:
            Dict containing response data
        """
        try:
            openai_client = await self._get_openai_client()
            
            # If OpenAI is not available, return demo response
            if not openai_client.is_available():
                return await self._generate_demo_response(user_message)
            
            # Build conversation messages using prompts
            messages = self.prompts.build_conversation_messages(
                user_message=user_message,
                facility_data=facility_data,
                chat_history=chat_history
            )
            
            # Generate response using OpenAI client
            result = await openai_client.chat_completion(messages)
            
            logger.info(f"Generated Cement GPT response for message: {user_message[:50]}...")
            
            return result
            
        except Exception as e:
            logger.error(f"Error generating Cement GPT response: {e}")
            return await self._generate_error_response(str(e))
    
    async def _generate_demo_response(self, user_message: str) -> Dict[str, Any]:
        """
        Generate demo response when OpenAI is not available
        
        Args:
            user_message: User's message
            
        Returns:
            Demo response
        """
        demo_response = self.prompts.get_demo_response(user_message)
        
        return {
            "response": demo_response,
            "model": "demo-mode",
            "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "demo_mode": True,
            "success": True
        }
    
    async def _generate_error_response(self, error_message: str) -> Dict[str, Any]:
        """
        Generate error response
        
        Args:
            error_message: Error message
            
        Returns:
            Error response
        """
        return {
            "response": "I apologize, but I'm experiencing technical difficulties. Please try again later or contact support if the issue persists.",
            "error": error_message,
            "model": "error",
            "usage": {},
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "success": False
        }
    
    async def validate_api_connection(self) -> bool:
        """
        Validate OpenAI API connection
        
        Returns:
            bool: True if API connection is valid
        """
        try:
            openai_client = await self._get_openai_client()
            
            if not openai_client.is_available():
                return False
                
            return await openai_client.validate_api_key()
            
        except Exception as e:
            logger.error(f"API connection validation failed: {e}")
            return False
    
    async def get_model_info(self) -> Dict[str, Any]:
        """
        Get information about the current model
        
        Returns:
            Model information
        """
        try:
            openai_client = await self._get_openai_client()
            model_info = openai_client.get_model_info()
            
            # Add cement-specific information
            model_info.update({
                "service_type": "Cement GPT",
                "specialization": "Cement Manufacturing & Sustainability",
                "prompt_length": len(self.prompts.get_base_system_prompt()),
                "demo_responses_available": len(self.prompts.get_demo_responses())
            })
            
            return model_info
            
        except Exception as e:
            logger.error(f"Error getting model info: {e}")
            return {
                "service_type": "Cement GPT",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
    
    async def get_system_prompt(self, facility_data: Optional[Dict] = None) -> str:
        """
        Get the current system prompt
        
        Args:
            facility_data: Optional facility data for context
            
        Returns:
            Complete system prompt
        """
        return self.prompts.get_complete_system_prompt(facility_data)
    
    async def update_facility_context(self, facility_data: Dict) -> Dict[str, Any]:
        """
        Update facility context for future responses
        
        Args:
            facility_data: Facility data to use as context
            
        Returns:
            Confirmation of context update
        """
        try:
            # Validate facility data structure
            if not isinstance(facility_data, dict):
                raise ValueError("Facility data must be a dictionary")
            
            # Test the context generation
            context = self.prompts.get_facility_context(facility_data)
            
            return {
                "success": True,
                "message": "Facility context updated successfully",
                "context_preview": context[:200] + "..." if len(context) > 200 else context,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
            
        except Exception as e:
            logger.error(f"Error updating facility context: {e}")
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }


# Global service instance
cement_gpt_service = CementGPTService()


async def get_cement_gpt_service() -> CementGPTService:
    """
    Get CementGPT service instance
    
    Returns:
        CementGPTService: Service instance
    """
    return cement_gpt_service
