"""
Logging utilities for AI services
"""

import logging
import sys
from typing import Optional

from ..config.settings import get_settings

settings = get_settings()


def setup_logger(name: Optional[str] = None) -> logging.Logger:
    """
    Setup and configure logger
    
    Args:
        name: Logger name (defaults to root logger)
        
    Returns:
        logging.Logger: Configured logger instance
    """
    
    logger = logging.getLogger(name)
    
    # Set log level
    log_level = getattr(logging, settings.log_level.upper(), logging.INFO)
    logger.setLevel(log_level)
    
    # Create formatter
    formatter = logging.Formatter(settings.log_format)
    
    # Create console handler
    if not logger.handlers:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(log_level)
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)
        
        # Prevent duplicate logs
        logger.propagate = False
    
    return logger


def get_logger(name: str) -> logging.Logger:
    """
    Get logger instance with specified name
    
    Args:
        name: Logger name
        
    Returns:
        logging.Logger: Logger instance
    """
    return setup_logger(name)
