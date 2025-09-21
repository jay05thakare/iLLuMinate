#!/bin/bash
# Simple script to start AI service with virtual environment

cd "$(dirname "$0")"
source venv/bin/activate
python -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
