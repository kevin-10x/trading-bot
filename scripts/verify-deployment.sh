#!/bin/bash

# Trading Bot - Deployment Verification Script
# Checks if everything is properly configured for Vercel deployment

set -e

echo "🔍 Trading Bot - Deployment Verification"
echo "========================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Counters
PASSED=0
FAILED=0

print_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED++))
}

print_fail() {
    echo -e "${RED}✗${NC} $1"
    ((FAILED++))
}

print_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

echo "Checking required files..."
echo ""

# Check required files
if [ -f "vercel.json" ]; then
    print_pass "vercel.json exists"
else
    print_fail "vercel.json missing"
fi

if [ -f ".vercelignore" ]; then
    print_pass ".vercelignore exists"
else
    print_fail ".vercelignore missing"
fi

if [ -f "api/vercel.json" ]; then
    print_pass "api/vercel.json exists"
else
    print_fail "api/vercel.json missing"
fi

if [ -f "DEPLOYMENT.md" ]; then
    print_pass "DEPLOYMENT.md exists"
else
    print_fail "DEPLOYMENT.md missing"
fi

echo ""
echo "Checking build configuration..."
echo ""

# Check package.json scripts
if grep -q '"build":' package.json; then
    print_pass "Build script defined"
else
    print_fail "Build script not found"
fi

if grep -q '"start":' package.json; then
    print_pass "Start script defined"
else
    print_fail "Start script not found"
fi

echo ""
echo "Checking environment configuration..."
echo ""

# Check environment variables
if [ -n "$NODE_ENV" ]; then
    if [ "$NODE_ENV" = "production" ]; then
        print_pass "NODE_ENV is set to production"
    else
        print_warn "NODE_ENV is set to $NODE_ENV (should be production)"
    fi
else
    print_warn "NODE_ENV not set locally (OK for Vercel)"
fi

if [ -n "$DATABASE_URL" ]; then
    if [[ $DATABASE_URL == mysql://* ]]; then
        print_pass "DATABASE_URL is configured (MySQL)"
    else
        print_fail "DATABASE_URL format incorrect"
    fi
else
    print_warn "DATABASE_URL not set locally (must be set in Vercel)"
fi

if [ -n "$REDIS_URL" ]; then
    if [[ $REDIS_URL == redis://* ]]; then
        print_pass "REDIS_URL is configured (Redis)"
    else
        print_fail "REDIS_URL format incorrect"
    fi
else
    print_warn "REDIS_URL not set locally (must be set in Vercel)"
fi

if [ -n "$JWT_SECRET" ]; then
    if [ ${#JWT_SECRET} -ge 32 ]; then
        print_pass "JWT_SECRET is set and strong"
    else
        print_warn "JWT_SECRET is weak (should be 32+ characters)"
    fi
else
    print_warn "JWT_SECRET not set locally (must be set in Vercel)"
fi

echo ""
echo "Checking TypeScript configuration..."
echo ""

# Check tsconfig files
if [ -f "tsconfig.json" ]; then
    print_pass "tsconfig.json exists"
else
    print_fail "tsconfig.json missing"
fi

if [ -f "tsconfig.app.json" ]; then
    print_pass "tsconfig.app.json exists"
else
    print_fail "tsconfig.app.json missing"
fi

if [ -f "tsconfig.server.json" ]; then
    print_pass "tsconfig.server.json exists"
else
    print_fail "tsconfig.server.json missing"
fi

echo ""
echo "Checking build output..."
echo ""

# Check if build passes
if npm run build > /dev/null 2>&1; then
    print_pass "Build succeeds"
else
    print_fail "Build fails - fix errors before deploying"
fi

if [ -d "dist" ]; then
    print_pass "dist directory exists"
else
    print_fail "dist directory missing"
fi

if [ -d "dist/public" ]; then
    print_pass "dist/public directory exists"
else
    print_fail "dist/public directory missing"
fi

echo ""
echo "Checking type safety..."
echo ""

# Type checking
if npm run check > /dev/null 2>&1; then
    print_pass "Type checking passes"
else
    print_fail "Type checking fails"
fi

echo ""
echo "Checking code quality..."
echo ""

# Linting
if npm run lint > /dev/null 2>&1; then
    print_pass "Linting passes"
else
    print_warn "Linting has warnings (review before deploying)"
fi

echo ""
echo "Checking dependencies..."
echo ""

# Check node_modules
if [ -d "node_modules" ]; then
    print_pass "Dependencies installed"
else
    print_fail "Dependencies not installed (run: npm install)"
fi

echo ""
echo "Checking database setup..."
echo ""

# Check Drizzle configuration
if [ -f "drizzle.config.ts" ]; then
    print_pass "drizzle.config.ts exists"
else
    print_fail "drizzle.config.ts missing"
fi

if [ -d "db" ]; then
    print_pass "db directory exists"
else
    print_fail "db directory missing"
fi

echo ""
echo "Checking Vercel configuration..."
echo ""

# Check Vercel CLI
if command -v vercel &> /dev/null; then
    print_pass "Vercel CLI installed"
else
    print_warn "Vercel CLI not installed (run: npm i -g vercel)"
fi

# Check if linked to Vercel
if [ -d ".vercel" ]; then
    print_pass "Project linked to Vercel"
else
    print_warn "Project not linked to Vercel (run: vercel link)"
fi

echo ""
echo "========================================"
echo ""

echo "Results:"
echo -e "  ${GREEN}Passed: $PASSED${NC}"
echo -e "  ${RED}Failed: $FAILED${NC}"

echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ Ready for deployment!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Set environment variables in Vercel:"
    echo "     vercel env add DATABASE_URL"
    echo "     vercel env add REDIS_URL"
    echo "     vercel env add JWT_SECRET"
    echo "     (Add all required variables)"
    echo ""
    echo "  2. Deploy to production:"
    echo "     vercel deploy --prod"
    echo ""
    exit 0
else
    echo -e "${RED}✗ Fix the above issues before deploying${NC}"
    echo ""
    exit 1
fi
