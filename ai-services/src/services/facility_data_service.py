"""
Facility Data Service
Comprehensive data fetching for facility AI analysis
"""

import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
import httpx
from ..config.settings import get_settings
from ..utils.logger import get_logger

logger = get_logger(__name__)


class FacilityDataService:
    """
    Service for fetching comprehensive facility data for AI analysis
    """
    
    def __init__(self):
        """Initialize the facility data service"""
        self.settings = get_settings()
        self.backend_url = self.settings.backend_api_url
        self.api_key = self.settings.backend_api_key
        
    async def get_comprehensive_facility_data(self, facility_id: str) -> Dict[str, Any]:
        """
        Fetch all relevant facility data for AI recommendations
        
        Args:
            facility_id: ID of the facility to analyze
            
        Returns:
            Dict containing comprehensive facility data
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                # Base headers for API calls
                headers = {
                    "X-API-Key": self.api_key,
                    "Content-Type": "application/json"
                }
                
                logger.info(f"Fetching comprehensive facility data for {facility_id} from AI analysis endpoint")
                
                # Use the comprehensive AI analysis endpoint that returns all data in one call
                response = await client.get(
                    f"{self.backend_url}/api/facilities/{facility_id}/ai-analysis",
                    headers=headers
                )
                response.raise_for_status()
                data = response.json()
                
                if not data.get('success'):
                    error_msg = data.get('message', 'Unknown error from backend')
                    logger.error(f"Backend returned error for facility {facility_id}: {error_msg}")
                    raise ValueError(f"Backend error: {error_msg}")
                
                # The AI analysis endpoint returns comprehensive data
                facility_data = data.get('data', {})
                
                # Add timestamp and ensure all expected fields exist
                comprehensive_data = {
                    "facility": facility_data.get("facility", {}),
                    "facility_resources": facility_data.get("facility_resources", []),
                    "recent_emissions": facility_data.get("recent_emissions", []),
                    "recent_production": facility_data.get("recent_production", []),
                    "targets": facility_data.get("targets", []),
                    "available_emission_factors": facility_data.get("available_emission_factors", []),
                    "data_timestamp": datetime.utcnow().isoformat() + "Z"
                }
                
                logger.info(f"Successfully fetched comprehensive facility data for {facility_id}")
                return comprehensive_data
                
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                logger.warning(f"Facility {facility_id} not found")
                raise ValueError(f"Facility with ID {facility_id} not found")
            else:
                logger.error(f"HTTP error fetching facility data: {e}")
                raise ValueError(f"Error fetching facility data: {e}")
        except Exception as e:
            logger.error(f"Error fetching comprehensive facility data: {e}")
            raise
    
    async def _fetch_facility_basic_info(self, client: httpx.AsyncClient, headers: Dict, facility_id: str) -> Dict:
        """Fetch basic facility information"""
        try:
            response = await client.get(
                f"{self.backend_url}/api/facilities/{facility_id}/ai-analysis",
                headers=headers
            )
            response.raise_for_status()
            data = response.json()
            
            if data.get('success'):
                return data.get('data', {}).get('facility', {})
            else:
                logger.warning(f"API returned success=false for facility {facility_id}")
                return {}
                
        except Exception as e:
            logger.error(f"Error fetching facility basic info: {e}")
            return {}
    
    async def _fetch_facility_resources(self, client: httpx.AsyncClient, headers: Dict, facility_id: str) -> List[Dict]:
        """Fetch facility resources with consumption data"""
        try:
            response = await client.get(
                f"{self.backend_url}/api/facilities/{facility_id}/resources/ai",
                headers=headers
            )
            response.raise_for_status()
            data = response.json()
            
            if data.get('success'):
                return data.get('data', {}).get('resources', [])
            else:
                logger.warning(f"API returned success=false for facility resources {facility_id}")
                return []
                
        except Exception as e:
            logger.error(f"Error fetching facility resources: {e}")
            return []
    
    async def _fetch_facility_emissions(self, client: httpx.AsyncClient, headers: Dict, facility_id: str) -> List[Dict]:
        """Fetch recent emission data"""
        try:
            # Get last 12 months of emission data
            response = await client.get(
                f"{self.backend_url}/api/emissions/data/{facility_id}",
                headers=headers,
                params={"limit": 12}
            )
            response.raise_for_status()
            data = response.json()
            
            if data.get('success'):
                return data.get('data', {}).get('emissionData', [])
            else:
                logger.warning(f"API returned success=false for emission data {facility_id}")
                return []
                
        except Exception as e:
            logger.error(f"Error fetching emission data: {e}")
            return []
    
    async def _fetch_facility_targets(self, client: httpx.AsyncClient, headers: Dict, facility_id: str) -> List[Dict]:
        """Fetch facility sustainability targets"""
        try:
            response = await client.get(
                f"{self.backend_url}/api/targets",
                headers=headers,
                params={"facilityId": facility_id}
            )
            response.raise_for_status()
            data = response.json()
            
            if data.get('success'):
                return data.get('data', {}).get('targets', [])
            else:
                logger.warning(f"API returned success=false for targets {facility_id}")
                return []
                
        except Exception as e:
            logger.error(f"Error fetching facility targets: {e}")
            return []
    
    async def _fetch_facility_production(self, client: httpx.AsyncClient, headers: Dict, facility_id: str) -> List[Dict]:
        """Fetch recent production data"""
        try:
            response = await client.get(
                f"{self.backend_url}/api/production/{facility_id}",
                headers=headers,
                params={"limit": 12}
            )
            response.raise_for_status()
            data = response.json()
            
            if data.get('success'):
                return data.get('data', {}).get('productionData', [])
            else:
                logger.warning(f"API returned success=false for production data {facility_id}")
                return []
                
        except Exception as e:
            logger.error(f"Error fetching production data: {e}")
            return []
    
    async def _fetch_available_emission_factors(self, client: httpx.AsyncClient, headers: Dict) -> List[Dict]:
        """Fetch available emission factors for alternative resource recommendations"""
        try:
            response = await client.get(
                f"{self.backend_url}/api/emissions/factors",
                headers=headers,
                params={"limit": 100}  # Get top 100 emission factors
            )
            response.raise_for_status()
            data = response.json()
            
            if data.get('success'):
                return data.get('data', {}).get('factors', [])
            else:
                logger.warning("API returned success=false for emission factors")
                return []
                
        except Exception as e:
            logger.error(f"Error fetching emission factors: {e}")
            return []


# Import asyncio here to avoid circular imports
import asyncio
from datetime import datetime


# Global service instance
facility_data_service = FacilityDataService()


async def get_facility_data_service() -> FacilityDataService:
    """
    Get Facility Data service instance
    
    Returns:
        FacilityDataService: Service instance
    """
    return facility_data_service
