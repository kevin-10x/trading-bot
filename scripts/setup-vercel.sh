#!/bin/bash

# Trading Bot Vercel Deployment Setup Script
# This script helps set up external services and prepare for Vercel deployment

set -e

echo "🚀 Trading Bot - Vercel Deployment Setup"
echo "========================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

print_step() {
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}$1${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Check prerequisites
print_step "Step 1: Checking Prerequisites"

if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi
print_success "Node.js is installed ($(node -v))"

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi
print_success "npm is installed ($(npm -v))"

if ! command -v git &> /dev/null; then
    print_error "git is not installed"
    exit 1
fi
print_success "git is installed ($(git -v | head -1))"

# Check for Vercel CLI
if ! command -v vercel &> /dev/null; then
    print_info "Installing Vercel CLI..."
    npm i -g vercel
    print_success "Vercel CLI installed"
else
    print_success "Vercel CLI is installed"
fi

# Build and type check
print_step "Step 2: Running Pre-Deployment Checks"

print_info "Running type check..."
if npm run check 2>/dev/null; then
    print_success "Type check passed"
else
    print_error "Type check failed. Fix errors before deploying."
    exit 1
fi

print_info "Running linter..."
if npm run lint 2>/dev/null; then
    print_success "Linting passed"
else
    print_error "Linting failed. Fix errors before deploying."
    exit 1
fi

print_info "Building application..."
if npm run build 2>/dev/null; then
    print_success "Build successful"
else
    print_error "Build failed. Fix errors before deploying."
    exit 1
fi

# Database setup
print_step "Step 3: Database Configuration"

if [ -z "$DATABASE_URL" ]; then
    print_error "DATABASE_URL is not set"
    print_info "To set it, run: export DATABASE_URL=\"mysql://user:pass@host/db\""
    print_info "Get your connection string from: https://planetscale.com"
    read -p "Enter your PlanetScale DATABASE_URL (or skip): " db_url
    if [ -n "$db_url" ]; then
        export DATABASE_URL="$db_url"
        print_success "DATABASE_URL set"
    fi
else
    print_success "DATABASE_URL is configured"
fi

if [ -n "$DATABASE_URL" ]; then
    print_info "Running database migrations..."
    if npm run db:push 2>/dev/null; then
        print_success "Database migrations applied"
    else
        print_error "Database migration failed"
        print_info "Make sure DATABASE_URL is correct and PlanetScale is running"
    fi
else
    print_info "Skipping database setup (no DATABASE_URL)"
fi

# Redis setup
print_step "Step 4: Redis Configuration"

if [ -z "$REDIS_URL" ]; then
    print_info "REDIS_URL is not set"
    print_info "Get your connection string from: https://upstash.com"
    read -p "Enter your Upstash REDIS_URL (or skip): " redis_url
    if [ -n "$redis_url" ]; then
        export REDIS_URL="$redis_url"
        print_success "REDIS_URL set"
    fi
else
    print_success "REDIS_URL is configured"
fi

# Vercel linking
print_step "Step 5: Linking to Vercel"

if [ -d ".vercel" ]; then
    print_success "Already linked to Vercel"
else
    print_info "Linking your project to Vercel..."
    vercel link --yes || print_error "Failed to link to Vercel"
fi

# Environment variables
print_step "Step 6: Vercel Environment Variables"

print_info "Pulling environment variables from Vercel..."
vercel env pull || print_info "No environment variables set yet"

print_info ""
print_info "Important: Set these environment variables in Vercel Dashboard:"
print_info "  → Go to: https://vercel.com/dashboard"
print_info "  → Select your project"
print_info "  → Settings → Environment Variables"
print_info ""
echo "Required variables:"
echo "  • DATABASE_URL (from PlanetScale)"
echo "  • REDIS_URL (from Upstash)"
echo "  • JWT_SECRET (generate random)"
echo "  • NODE_ENV=production"
echo "  • APP_ID, APP_SECRET, KIMI_AUTH_URL, KIMI_OPEN_URL"
echo ""
echo "Optional variables:"
echo "  • TELEGRAM_BOT_TOKEN"
echo "  • ALPHA_VANTAGE_API_KEY"
echo "  • MT5_WEBHOOK_SECRET"
echo ""

read -p "Have you set all environment variables in Vercel? (y/n): " env_confirmed

if [ "$env_confirmed" != "y" ]; then
    print_info "Please set environment variables and run this script again"
    exit 1
fi

# Final deployment
print_step "Step 7: Deploy to Vercel"

read -p "Ready to deploy to production? (y/n): " deploy_confirmed

if [ "$deploy_confirmed" = "y" ]; then
    print_info "Deploying to production..."
    vercel deploy --prod
    print_success "Deployment complete!"
    print_info "Your app is live at: https://your-project.vercel.app"
else
    print_info "Deployment cancelled"
    exit 0
fi

print_step "Setup Complete!"
echo ""
echo "Next steps:"
echo "  1. Monitor your deployment: vercel logs"
echo "  2. Check the app: https://vercel.com/dashboard"
echo "  3. For MT5 webhooks, configure: https://your-project.vercel.app/api/webhook/mt5"
echo "  4. Set up error tracking in Sentry (optional)"
echo ""
print_success "Happy trading! 🚀"
