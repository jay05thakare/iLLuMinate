"""
Backend Integration Service for communicating with Node.js API
"""

import json
import asyncio
from datetime import datetime
from typing import Dict, List, Optional, Any
from urllib.parse import urljoin

import httpx
from httpx import AsyncClient, HTTPStatusError, RequestError

from ..config.settings import get_settings
from ..utils.logger import get_logger

logger = get_logger(__name__)
settings = get_settings()


class BackendService:
    """
    Service for integrating with the Node.js backend API
    """
    
    def __init__(self):
        """Initialize backend service"""
        self.base_url = settings.backend_api_url
        self.timeout = settings.backend_api_timeout
        self.client = None
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize HTTP client"""
        try:
            self.client = AsyncClient(
                base_url=self.base_url,
                timeout=httpx.Timeout(self.timeout),
                headers={
                    "Content-Type": "application/json",
                    "User-Agent": "iLLuMinate-AI-Service/1.0.0"
                }
            )
            logger.info(f"Backend service initialized for {self.base_url}")
            
        except Exception as e:
            logger.error(f"Failed to initialize backend client: {e}")
            self.client = None
    
    async def health_check(self) -> Dict[str, Any]:
        """
        Check backend API health
        
        Returns:
            Dict containing health status
        """
        try:
            if not self.client:
                return {"status": "error", "message": "Client not initialized"}
            
            response = await self.client.get("/api/health")
            response.raise_for_status()
            
            data = response.json()
            logger.debug("Backend health check successful")
            
            return {
                "status": "healthy",
                "backend_response": data,
                "response_time_ms": response.elapsed.total_seconds() * 1000,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
            
        except HTTPStatusError as e:
            logger.warning(f"Backend health check failed with status {e.response.status_code}")
            return {
                "status": "unhealthy",
                "error": f"HTTP {e.response.status_code}",
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
        except RequestError as e:
            logger.error(f"Backend health check failed: {e}")
            return {
                "status": "unreachable",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
        except Exception as e:
            logger.error(f"Unexpected error in health check: {e}")
            return {
                "status": "error",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
    
    async def get_facility(self, facility_id: str, organization_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Get facility information from backend
        
        Args:
            facility_id: Facility ID
            organization_id: Optional organization ID for context
            
        Returns:
            Facility data or None
        """
        try:
            if not self.client:
                logger.warning("Backend client not available")
                return None
            
            url = f"/api/facilities/{facility_id}"
            params = {}
            if organization_id:
                params["organization_id"] = organization_id
            
            response = await self.client.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get("success"):
                logger.debug(f"Retrieved facility data for {facility_id}")
                return data.get("data")
            else:
                logger.warning(f"Backend returned unsuccessful response for facility {facility_id}")
                return None
                
        except HTTPStatusError as e:
            if e.response.status_code == 404:
                logger.info(f"Facility {facility_id} not found")
            else:
                logger.error(f"HTTP error getting facility {facility_id}: {e.response.status_code}")
            return None
        except RequestError as e:
            logger.error(f"Request error getting facility {facility_id}: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error getting facility {facility_id}: {e}")
            return None
    
    async def get_emission_data(
        self, 
        facility_id: str, 
        months: int = 12,
        organization_id: Optional[str] = None
    ) -> Optional[List[Dict[str, Any]]]:
        """
        Get emission data for a facility
        
        Args:
            facility_id: Facility ID
            months: Number of recent months to retrieve
            organization_id: Optional organization ID
            
        Returns:
            List of emission data or None
        """
        try:
            if not self.client:
                logger.warning("Backend client not available")
                return None
            
            url = f"/api/emissions/facility/{facility_id}"
            params = {"months": months}
            if organization_id:
                params["organization_id"] = organization_id
            
            response = await self.client.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get("success"):
                logger.debug(f"Retrieved emission data for facility {facility_id}")
                return data.get("data", [])
            else:
                logger.warning(f"Backend returned unsuccessful response for emission data {facility_id}")
                return None
                
        except HTTPStatusError as e:
            logger.error(f"HTTP error getting emission data for {facility_id}: {e.response.status_code}")
            return None
        except RequestError as e:
            logger.error(f"Request error getting emission data for {facility_id}: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error getting emission data for {facility_id}: {e}")
            return None
    
    async def get_production_data(
        self, 
        facility_id: str, 
        months: int = 12,
        organization_id: Optional[str] = None
    ) -> Optional[List[Dict[str, Any]]]:
        """
        Get production data for a facility
        
        Args:
            facility_id: Facility ID
            months: Number of recent months to retrieve
            organization_id: Optional organization ID
            
        Returns:
            List of production data or None
        """
        try:
            if not self.client:
                logger.warning("Backend client not available")
                return None
            
            url = f"/api/production/facility/{facility_id}"
            params = {"months": months}
            if organization_id:
                params["organization_id"] = organization_id
            
            response = await self.client.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get("success"):
                logger.debug(f"Retrieved production data for facility {facility_id}")
                return data.get("data", [])
            else:
                logger.warning(f"Backend returned unsuccessful response for production data {facility_id}")
                return None
                
        except HTTPStatusError as e:
            logger.error(f"HTTP error getting production data for {facility_id}: {e.response.status_code}")
            return None
        except RequestError as e:
            logger.error(f"Request error getting production data for {facility_id}: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error getting production data for {facility_id}: {e}")
            return None
    
    async def get_facility_context(
        self, 
        facility_id: str, 
        organization_id: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Get comprehensive facility context for AI
        
        Args:
            facility_id: Facility ID
            organization_id: Optional organization ID
            
        Returns:
            Facility context data or None
        """
        try:
            # Get facility basic info
            facility_info = await self.get_facility(facility_id, organization_id)
            if not facility_info:
                return None
            
            # Get recent emission and production data in parallel
            emission_task = self.get_emission_data(facility_id, months=6, organization_id=organization_id)
            production_task = self.get_production_data(facility_id, months=6, organization_id=organization_id)
            
            emission_data, production_data = await asyncio.gather(
                emission_task, production_task, return_exceptions=True
            )
            
            # Handle any exceptions
            if isinstance(emission_data, Exception):
                logger.warning(f"Failed to get emission data: {emission_data}")
                emission_data = []
            
            if isinstance(production_data, Exception):
                logger.warning(f"Failed to get production data: {production_data}")
                production_data = []
            
            # Calculate summary metrics
            context = {
                "facility": facility_info,
                "recent_emissions": emission_data or [],
                "recent_production": production_data or [],
                "summary": self._calculate_facility_summary(facility_info, emission_data or [], production_data or [])
            }
            
            logger.info(f"Generated facility context for {facility_id}")
            return context
            
        except Exception as e:
            logger.error(f"Error getting facility context for {facility_id}: {e}")
            return None
    
    def _calculate_facility_summary(
        self, 
        facility_info: Dict[str, Any], 
        emission_data: List[Dict[str, Any]], 
        production_data: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Calculate summary metrics for facility context
        
        Args:
            facility_info: Basic facility information
            emission_data: Recent emission data
            production_data: Recent production data
            
        Returns:
            Summary metrics
        """
        try:
            summary = {
                "name": facility_info.get("name", "Unknown"),
                "location": facility_info.get("location", {}),
                "total_emissions_last_month": 0,
                "total_production_last_month": 0,
                "emission_intensity": 0,
                "energy_intensity": 0,
                "data_availability": {
                    "emission_months": len(emission_data),
                    "production_months": len(production_data)
                }
            }
            
            # Calculate recent totals
            if emission_data:
                latest_emissions = emission_data[0] if emission_data else {}
                summary["total_emissions_last_month"] = latest_emissions.get("total_emissions", 0)
                summary["energy_intensity"] = latest_emissions.get("total_energy", 0)
            
            if production_data:
                latest_production = production_data[0] if production_data else {}
                summary["total_production_last_month"] = latest_production.get("cement_production", 0)
            
            # Calculate emission intensity (kgCO2e/ton cement)
            if summary["total_production_last_month"] > 0:
                summary["emission_intensity"] = summary["total_emissions_last_month"] / summary["total_production_last_month"]
                
                # Calculate energy intensity (MJ/ton cement)
                if summary["energy_intensity"] > 0:
                    summary["energy_intensity"] = summary["energy_intensity"] / summary["total_production_last_month"]
            
            return summary
            
        except Exception as e:
            logger.error(f"Error calculating facility summary: {e}")
            return {
                "name": facility_info.get("name", "Unknown"),
                "error": "Failed to calculate metrics"
            }
    
    async def save_chat_history(
        self, 
        organization_id: str,
        user_id: str,
        facility_id: Optional[str],
        session_id: str,
        message: str,
        response: str
    ) -> bool:
        """
        Save chat history to backend database
        
        Args:
            organization_id: Organization ID
            user_id: User ID
            facility_id: Optional facility ID
            session_id: Chat session ID
            message: User message
            response: AI response
            
        Returns:
            Success status
        """
        try:
            if not self.client:
                logger.warning("Backend client not available for saving chat history")
                return False
            
            payload = {
                "organization_id": organization_id,
                "user_id": user_id,
                "facility_id": facility_id,
                "session_id": session_id,
                "message": message,
                "response": response,
                "message_type": "chat_session"
            }
            
            response = await self.client.post("/api/chat/history", json=payload)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get("success"):
                logger.debug(f"Saved chat history for session {session_id}")
                return True
            else:
                logger.warning(f"Failed to save chat history: {data.get('message', 'Unknown error')}")
                return False
                
        except HTTPStatusError as e:
            logger.error(f"HTTP error saving chat history: {e.response.status_code}")
            return False
        except RequestError as e:
            logger.error(f"Request error saving chat history: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error saving chat history: {e}")
            return False
    
    async def close(self):
        """Close the HTTP client"""
        if self.client:
            await self.client.aclose()
            logger.info("Backend service client closed")


# Global service instance
backend_service = BackendService()


async def get_backend_service() -> BackendService:
    """
    Get backend service instance
    
    Returns:
        BackendService: Service instance
    """
    return backend_service
