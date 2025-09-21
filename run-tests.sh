#!/bin/bash

# Alternative Fuels Optimizer Test Runner
# This script runs all tests for the Alternative Fuels Optimizer feature

echo "🧪 Alternative Fuels Optimizer Test Suite"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    case $2 in
        "error")
            echo -e "${RED}❌ $1${NC}"
            ;;
        "success")
            echo -e "${GREEN}✅ $1${NC}"
            ;;
        "info")
            echo -e "${BLUE}ℹ️  $1${NC}"
            ;;
        "warning")
            echo -e "${YELLOW}⚠️  $1${NC}"
            ;;
        *)
            echo "$1"
            ;;
    esac
}

# Check if backend is running
print_status "Checking if backend is running..." "info"
if curl -f -s http://localhost:3000/health > /dev/null 2>&1; then
    print_status "Backend is running" "success"
else
    print_status "Backend is not running. Please start it with: cd backend && npm start" "error"
    exit 1
fi

# Check if AI service is running (optional)
print_status "Checking if AI service is running..." "info"
if curl -f -s http://localhost:8000/ > /dev/null 2>&1; then
    print_status "AI service is running" "success"
else
    print_status "AI service is not running (optional for these tests)" "warning"
fi

echo ""
print_status "Running backend API tests..." "info"

# Run backend integration tests
if [ -f "backend/tests/alternativeFuels.test.js" ]; then
    cd backend
    npm test -- --testPathPattern=alternativeFuels.test.js
    backend_tests_exit_code=$?
    cd ..
    
    if [ $backend_tests_exit_code -eq 0 ]; then
        print_status "Backend tests passed" "success"
    else
        print_status "Backend tests failed" "error"
    fi
else
    print_status "Backend tests not found, skipping..." "warning"
fi

echo ""
print_status "Running comprehensive end-to-end tests..." "info"

# Run the comprehensive E2E test script
node test-alternative-fuels.js
e2e_tests_exit_code=$?

if [ $e2e_tests_exit_code -eq 0 ]; then
    print_status "End-to-end tests passed" "success"
else
    print_status "End-to-end tests failed" "error"
fi

echo ""
print_status "Running frontend unit tests..." "info"

# Run frontend tests
if [ -d "frontend/src/components/ai/__tests__" ]; then
    cd frontend
    npm test -- --testPathPattern=AlternativeFuelsOptimizer.test.jsx --watchAll=false
    frontend_tests_exit_code=$?
    cd ..
    
    if [ $frontend_tests_exit_code -eq 0 ]; then
        print_status "Frontend tests passed" "success"
    else
        print_status "Frontend tests failed" "error"
    fi
else
    print_status "Frontend tests not found, skipping..." "warning"
fi

echo ""
echo "=========================================="

# Summary
if [ $backend_tests_exit_code -eq 0 ] && [ $e2e_tests_exit_code -eq 0 ] && [ $frontend_tests_exit_code -eq 0 ]; then
    print_status "🎉 ALL TESTS PASSED! Alternative Fuels Optimizer is working perfectly!" "success"
    exit 0
else
    print_status "❌ Some tests failed. Please review the output above." "error"
    exit 1
fi
