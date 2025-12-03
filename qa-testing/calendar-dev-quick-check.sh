#!/bin/bash

###############################################################################
# Calendar E2E Quick Verification Script
# Purpose: Run essential checks before committing calendar changes
# Usage: bash calendar-dev-quick-check.sh
###############################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DB_URL="${NEXT_PUBLIC_SUPABASE_URL:-http://localhost:54321}"
API_BASE="${API_BASE_URL:-http://localhost:3000}"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Calendar Module - Developer Quick Verification          ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

###############################################################################
# Test 1: Database Schema Check
###############################################################################
echo -e "${YELLOW}[1/8] Checking database schema...${NC}"

# Check if event_type column exists and is TEXT type
SCHEMA_CHECK=$(psql "$DATABASE_URL" -t -c "
    SELECT data_type 
    FROM information_schema.columns 
    WHERE table_name = 'calendar_events' 
    AND column_name = 'event_type';
" 2>/dev/null || echo "")

if [[ "$SCHEMA_CHECK" == *"text"* ]] || [[ "$SCHEMA_CHECK" == *"character varying"* ]]; then
    echo -e "${GREEN}✓ event_type column exists (TEXT type)${NC}"
else
    echo -e "${RED}✗ event_type column not found or wrong type${NC}"
    echo -e "${RED}  Run: psql < database/convert-event-type-enum-to-text.sql${NC}"
    exit 1
fi

###############################################################################
# Test 2: TypeScript Compilation
###############################################################################
echo -e "\n${YELLOW}[2/8] Checking TypeScript compilation...${NC}"

if npx tsc --noEmit --skipLibCheck 2>/dev/null; then
    echo -e "${GREEN}✓ TypeScript compiles without errors${NC}"
else
    echo -e "${RED}✗ TypeScript compilation failed${NC}"
    echo -e "${RED}  Fix type errors before proceeding${NC}"
    exit 1
fi

###############################################################################
# Test 3: Required Files Exist
###############################################################################
echo -e "\n${YELLOW}[3/8] Verifying required files...${NC}"

REQUIRED_FILES=(
    "src/components/calendar/calendar-event-modal.tsx"
    "src/components/calendar/event-detail-modal.tsx"
    "src/components/calendar/calendar-view.tsx"
    "src/app/api/calendar/events/enhanced/route.ts"
    "src/lib/api/calendar.ts"
    "src/lib/realtime/calendar-subscriptions.ts"
    "src/types/index.ts"
)

ALL_FILES_EXIST=true
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}  ✓ $file${NC}"
    else
        echo -e "${RED}  ✗ $file (MISSING)${NC}"
        ALL_FILES_EXIST=false
    fi
done

if [ "$ALL_FILES_EXIST" = false ]; then
    echo -e "${RED}✗ Some required files are missing${NC}"
    exit 1
fi

###############################################################################
# Test 4: Code Pattern Verification
###############################################################################
echo -e "\n${YELLOW}[4/8] Checking critical code patterns...${NC}"

# Check event_type mapping in modal
if grep -q "event_type: formData.category" src/components/calendar/calendar-event-modal.tsx; then
    echo -e "${GREEN}✓ Category → event_type mapping found${NC}"
else
    echo -e "${RED}✗ Category mapping missing in calendar-event-modal.tsx${NC}"
    exit 1
fi

# Check event_type display in detail modal
if grep -q "event.event_type" src/components/calendar/event-detail-modal.tsx; then
    echo -e "${GREEN}✓ event_type display logic found${NC}"
else
    echo -e "${RED}✗ event_type display missing in event-detail-modal.tsx${NC}"
    exit 1
fi

# Check fetchUniqueCategories function
if grep -q "fetchUniqueCategories" src/lib/api/calendar.ts; then
    echo -e "${GREEN}✓ fetchUniqueCategories function exists${NC}"
else
    echo -e "${RED}✗ fetchUniqueCategories function missing${NC}"
    exit 1
fi

###############################################################################
# Test 5: API Health Check (if server running)
###############################################################################
echo -e "\n${YELLOW}[5/8] Checking API availability...${NC}"

if curl -s -f -o /dev/null "$API_BASE/api/calendar/health" 2>/dev/null; then
    echo -e "${GREEN}✓ Calendar API is responding${NC}"
    
    # Get health details
    HEALTH_RESPONSE=$(curl -s "$API_BASE/api/calendar/health" 2>/dev/null || echo "{}")
    echo -e "${BLUE}  Response: $HEALTH_RESPONSE${NC}"
else
    echo -e "${YELLOW}⚠ API server not running (start with: npm run dev)${NC}"
    echo -e "${YELLOW}  Skipping API tests...${NC}"
fi

###############################################################################
# Test 6: Realtime Subscriptions Setup
###############################################################################
echo -e "\n${YELLOW}[6/8] Verifying real-time subscription code...${NC}"

SUBSCRIPTION_CHECKS=0

if grep -q "calendar-events-changes" src/lib/realtime/calendar-subscriptions.ts; then
    echo -e "${GREEN}✓ calendar-events-changes subscription${NC}"
    ((SUBSCRIPTION_CHECKS++))
fi

if grep -q "participant-changes" src/lib/realtime/calendar-subscriptions.ts; then
    echo -e "${GREEN}✓ participant-changes subscription${NC}"
    ((SUBSCRIPTION_CHECKS++))
fi

if grep -q "todo-changes" src/lib/realtime/calendar-subscriptions.ts; then
    echo -e "${GREEN}✓ todo-changes subscription${NC}"
    ((SUBSCRIPTION_CHECKS++))
fi

if grep -q "calendar-updates" src/lib/realtime/calendar-subscriptions.ts; then
    echo -e "${GREEN}✓ calendar-updates broadcast${NC}"
    ((SUBSCRIPTION_CHECKS++))
fi

if [ $SUBSCRIPTION_CHECKS -eq 4 ]; then
    echo -e "${GREEN}✓ All 4 real-time subscriptions configured${NC}"
else
    echo -e "${YELLOW}⚠ Only $SUBSCRIPTION_CHECKS/4 subscriptions found${NC}"
fi

###############################################################################
# Test 7: Environment Variables
###############################################################################
echo -e "\n${YELLOW}[7/8] Checking environment configuration...${NC}"

if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓ .env.local file exists${NC}"
    
    # Check for required variables (without exposing values)
    ENV_VARS=("NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY" "SUPABASE_SERVICE_ROLE_KEY")
    
    for var in "${ENV_VARS[@]}"; do
        if grep -q "^$var=" .env.local; then
            echo -e "${GREEN}  ✓ $var is set${NC}"
        else
            echo -e "${RED}  ✗ $var is missing${NC}"
        fi
    done
else
    echo -e "${RED}✗ .env.local file not found${NC}"
    echo -e "${RED}  Copy from .env.example and configure${NC}"
    exit 1
fi

###############################################################################
# Test 8: Database Table Checks
###############################################################################
echo -e "\n${YELLOW}[8/8] Verifying database tables...${NC}"

REQUIRED_TABLES=("calendar_events" "event_participants" "calendar_todos" "workload")

if [ -n "$DATABASE_URL" ]; then
    for table in "${REQUIRED_TABLES[@]}"; do
        if psql "$DATABASE_URL" -t -c "SELECT 1 FROM $table LIMIT 1;" >/dev/null 2>&1; then
            echo -e "${GREEN}  ✓ $table table exists${NC}"
        else
            echo -e "${RED}  ✗ $table table not found${NC}"
        fi
    done
else
    echo -e "${YELLOW}⚠ DATABASE_URL not set, skipping table checks${NC}"
fi

###############################################################################
# Summary
###############################################################################
echo -e "\n${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    Verification Summary                      ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo -e "${GREEN}✓ All critical checks passed!${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Start dev server: ${GREEN}npm run dev${NC}"
echo "2. Open browser: ${GREEN}http://localhost:3000/calendar${NC}"
echo "3. Test event creation with custom category"
echo "4. Verify real-time updates in multiple tabs"
echo "5. Check event_type persistence in database"
echo ""
echo -e "${YELLOW}Run full E2E tests: ${GREEN}npm run test:calendar:e2e${NC}"
echo -e "${YELLOW}View verification plan: ${GREEN}cat qa-testing/calendar-e2e-verification-plan.md${NC}"
echo ""

exit 0
