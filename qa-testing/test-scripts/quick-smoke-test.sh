#!/bin/bash

# Quick Smoke Test for Calendar Module
# Run: chmod +x quick-smoke-test.sh && ./quick-smoke-test.sh

echo "🔥 CALENDAR MODULE - QUICK SMOKE TEST"
echo "======================================"
echo ""

BASE_URL="${BASE_URL:-http://localhost:3000}"
PASSED=0
FAILED=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

function test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Testing: $name ... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" -eq "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (Status: $response)"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} (Expected: $expected_status, Got: $response)"
        ((FAILED++))
    fi
}

echo "Base URL: $BASE_URL"
echo ""

# Test 1: Calendar page loads
test_endpoint "Calendar Page" "$BASE_URL/calendar" 200

# Test 2: API - Get events
test_endpoint "GET /api/calendar/events" "$BASE_URL/api/calendar/events" 200

# Test 3: API - Get calendar-linked workload
test_endpoint "GET /api/workload/calendar-linked" "$BASE_URL/api/workload/calendar-linked" 200

# Test 4: API - Auto-complete logs
test_endpoint "GET /api/calendar/auto-complete" "$BASE_URL/api/calendar/auto-complete" 200

# Test 5: Dashboard page (should contain TodoList)
test_endpoint "Dashboard Page" "$BASE_URL/dashboard" 200

# Test 6: Team Tasks page
test_endpoint "Team Tasks Page" "$BASE_URL/workload/team" 200

echo ""
echo "======================================"
echo "SMOKE TEST SUMMARY"
echo "======================================"
echo -e "Total Tests: $((PASSED + FAILED))"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All smoke tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Check logs above.${NC}"
    exit 1
fi
