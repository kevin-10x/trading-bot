# Setting Up External Services for Vercel Deployment

This guide walks you through setting up PlanetScale (MySQL) and Upstash (Redis) for production deployment.

## 1. PlanetScale Setup (MySQL Database)

PlanetScale provides a serverless MySQL database that integrates perfectly with Vercel.

### Step 1: Create PlanetScale Account
1. Go to https://planetscale.com
2. Sign up with GitHub (recommended)
3. Create a new organization or use default

### Step 2: Create Database
1. Click "Create a new database"
2. Name it: `trading_bot`
3. Select region closest to your users
4. Select plan: **Hobby (free)** or **Scaler Pro** for production
5. Click "Create database"

### Step 3: Get Connection String
1. Click on your database
2. Click "Branches" tab
3. Click "main" branch
4. Click "Connect" button
5. Choose "Node.js" from dropdown
6. Copy the connection string that looks like:
   ```
   mysql://[username]:[password]@[host]/trading_bot
   ```

### Step 4: Test Connection Locally
```bash
# Set the DATABASE_URL
export DATABASE_URL="mysql://your-username:your-password@your-host/trading_bot"

# Run migrations
npm run db:push

# Check if it worked
npm run db:generate  # Should not complain about missing tables
```

### Step 5: Add to Vercel
1. Go to your Vercel Project: https://vercel.com/dashboard
2. Go to Settings → Environment Variables
3. Add new variable:
   - **Name**: `DATABASE_URL`
   - **Value**: Paste the PlanetScale connection string
   - **Environments**: Production, Preview, Development
4. Click "Save"

### PlanetScale Best Practices

#### Connection Pooling (IMPORTANT!)
PlanetScale's free tier has connection limits. Use connection pooling:

1. In PlanetScale dashboard, click "Settings" → "Connection limits"
2. Enable "Connection pooling"
3. Set to 10 connections
4. Copy the **proxy** connection string instead

Example proxy URL:
```
mysql://[username]:[password]@[host]:3306/trading_bot?schema=trading_bot
```

#### Backups
1. Go to your database → "Backups"
2. Enable automatic backups (24-hour retention on free tier)
3. Create manual backups before major deployments

#### Monitoring
1. View query statistics: Database → "Analytics"
2. Check slow queries to optimize
3. Monitor storage usage

---

## 2. Upstash Setup (Redis Cache)

Upstash provides serverless Redis with REST API support.

### Step 1: Create Upstash Account
1. Go to https://upstash.com
2. Sign up with GitHub (recommended)
3. Create a new organization or use default

### Step 2: Create Redis Database
1. Click "Create database"
2. Name: `trading_bot_cache`
3. Region: Select closest to Vercel (us-east, eu-west, etc.)
4. Type: **Serverless** (recommended for Vercel)
5. Click "Create"

### Step 3: Get Connection String
1. Click on your database
2. Go to "Details" tab
3. Find connection details:
   - **Redis URL**: `redis://default:[password]@[host]:[port]`
   - **REST URL**: For HTTP access

### Step 4: Connection Method Options

**Option A: Direct Redis Connection (Recommended)**
```bash
REDIS_URL=redis://default:your-password@your-host:12345
```

**Option B: REST API (If Direct Fails)**
```bash
# For Vercel edge functions
UPSTASH_REDIS_REST_URL=https://your-host.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

### Step 5: Test Connection Locally
```bash
# Set the REDIS_URL
export REDIS_URL="redis://default:your-password@your-host:12345"

# Test with Redis CLI
redis-cli -u $REDIS_URL ping
# Should return: PONG
```

### Step 6: Add to Vercel
1. Go to your Vercel Project Settings
2. Go to Environment Variables
3. Add new variable:
   - **Name**: `REDIS_URL`
   - **Value**: Paste the Upstash Redis URL
   - **Environments**: Production, Preview, Development
4. Click "Save"

### Upstash Best Practices

#### Rate Limiting
- Free tier: 10,000 commands/day
- Scaler tier: Pay as you go

#### Eviction Policy
1. Go to "Configuration" tab
2. Set **Eviction Policy** to `allkeys-lru` (recommended for cache)
3. Set **Max Memory**: Based on plan

#### Monitoring
1. View "Stats" for command count
2. Check "Request Latency" 
3. Monitor storage usage

---

## 3. Migrate Environment Variables to Vercel

### Get All Required Variables

Create a `.env.production` file locally with:

```env
# Core
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=mysql://[username]:[password]@[host]/trading_bot

# Cache
REDIS_URL=redis://default:[password]@[host]:12345

# Auth & Security
JWT_SECRET=generate-a-strong-secret-key-here
APP_ID=your-app-id
APP_SECRET=your-app-secret

# KIMI Integration (if using)
KIMI_AUTH_URL=https://your-kimi-auth-url
KIMI_OPEN_URL=https://your-kimi-open-url
OWNER_UNION_ID=your-owner-id (optional)

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# External APIs
TELEGRAM_BOT_TOKEN=your-telegram-token
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key

# MT5 Webhook
MT5_WEBHOOK_SECRET=generate-a-strong-secret-key
```

### Add to Vercel Dashboard

#### Method 1: Manual (Recommended for Secrets)
1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - Name
   - Value
   - Check: Production, Preview, Development
5. Click "Save"

#### Method 2: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Link project (if not already linked)
vercel link

# Pull environment variables from Vercel
vercel env pull

# This creates .env.local with all production vars
```

#### Method 3: Upload .env File
```bash
# Log in to Vercel
vercel login

# Deploy and link
vercel link

# Environment variables are automatically synced
```

### Verify All Variables Are Set
```bash
# List all environment variables in Vercel
vercel env list

# Should show:
# Production    DATABASE_URL              ●●●●●●●●●●
# Production    REDIS_URL                 ●●●●●●●●●●
# etc.
```

---

## 4. Database Migrations

### Before First Deployment

```bash
# Make sure DATABASE_URL is set
export DATABASE_URL="mysql://..."

# Push schema to database
npm run db:push

# This will:
# - Connect to PlanetScale
# - Create all tables
# - Apply any migrations
```

### Verify Migration Success
```bash
# Check if tables were created
npm run db:generate

# Should output: ✔ No migration conflicts
```

### In Case of Conflicts
```bash
# Introspect database
npm run db:generate

# This updates your schema based on database state
# Then commit the changes
git add db/
git commit -m "chore: update db schema after PlanetScale setup"
```

---

## 5. Deploy to Vercel

### Final Pre-Deployment Checklist

```bash
# ✓ Type check
npm run check

# ✓ Lint
npm run lint

# ✓ Build locally
npm run build

# ✓ Test
npm run test
```

### Deploy

#### Option 1: Using Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Select your GitHub repo `trading-bot`
4. Click "Import"
5. Configure:
   - **Framework**: Vite (should auto-detect)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/public`
   - **Root Directory**: ./
6. Click "Environment Variables" → "Add"
   - Add all variables from step 3
7. Click "Deploy"

#### Option 2: Using Vercel CLI
```bash
# Install CLI
npm i -g vercel

# Link your project
vercel link

# Deploy to production
vercel deploy --prod

# Vercel will:
# - Use environment variables you set
# - Run build command
# - Deploy to production
```

#### Option 3: GitHub Integration
1. Connect Vercel to GitHub: https://vercel.com/new
2. Select your `trading-bot` repo
3. Click "Import"
4. Set environment variables in Vercel UI
5. Click "Deploy"
6. Future deployments: Push to `main` branch → Auto-deploys

### Monitor Deployment

```bash
# View live logs
vercel logs

# View function logs
vercel logs --functions

# Check deployment status
vercel inspect
```

---

## 6. Post-Deployment Setup

### Webhook Configuration

If using MT5 webhook:

1. Get your Vercel deployment URL from dashboard
2. Configure MT5 to send webhooks to:
   ```
   https://your-project.vercel.app/api/webhook/mt5
   ```
3. Use `MT5_WEBHOOK_SECRET` for validation

### Telegram Bot Webhook (Optional)

If using Telegram:

1. Set webhook in Telegram:
   ```bash
   curl -X POST https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook \
     -d url=https://your-project.vercel.app/api/webhook/telegram
   ```

### Monitoring Setup

```bash
# Set up error tracking (Sentry)
npm install @sentry/node

# Add to api/boot.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

---

## 7. Troubleshooting

### Connection Errors

**"Cannot connect to database"**
```bash
# Test connection string locally
export DATABASE_URL="your-connection-string"
npm run db:push

# If it works locally but fails in Vercel:
# - Check IP whitelist in PlanetScale
# - Vercel IPs should be automatically whitelisted
# - Try redeploying
```

**"Redis connection timeout"**
```bash
# Test Redis connection
redis-cli -u $REDIS_URL ping

# If fails:
# - Check Upstash database is running
# - Check firewall/network settings
# - Switch to REST API method
```

### Deployment Fails

**"Missing environment variable"**
```bash
# Check all required variables are set
vercel env list

# Add missing variables
vercel env add VARIABLE_NAME
vercel env add VARIABLE_VALUE
```

**"Build fails"**
```bash
# Run local build to debug
npm run build

# Check for type errors
npm run check

# Check for lint errors
npm run lint
```

---

## 8. Rollback Procedure

If deployment has issues:

### Option 1: Revert to Previous Deployment
```bash
vercel rollback
```

### Option 2: Manual Rollback
1. Go to Vercel Dashboard
2. Click Deployments
3. Find previous stable deployment
4. Click → Menu → "Promote to Production"

### Option 3: Revert Database Changes
```bash
# If migrations caused issues
npm run db:migrate -- --revert
```

---

## 9. Scaling & Optimization

### PlanetScale Scaling
- Free tier: 10GB storage
- Scaler Pro: 100GB+ storage
- Auto-scaling with pay-as-you-go

### Upstash Scaling
- Free tier: 10,000 commands/day
- Scaler tier: Pay per command
- Auto-scales with usage

### Vercel Optimization
- Automatic scaling
- Edge caching for static assets
- Function optimization
- Monitor usage in dashboard

---

## Quick Reference

### Connection Strings Format

**PlanetScale MySQL**
```
mysql://username:password@host/database
```

**Upstash Redis**
```
redis://default:password@host:port
```

### Key Environment Variables

| Variable | Required | Value |
|----------|----------|-------|
| `DATABASE_URL` | ✅ | PlanetScale connection |
| `REDIS_URL` | ✅ | Upstash connection |
| `JWT_SECRET` | ✅ | Strong random key |
| `NODE_ENV` | ✅ | `production` |
| `TELEGRAM_BOT_TOKEN` | ❌ | Your token |
| `ALPHA_VANTAGE_API_KEY` | ❌ | Your key |
| `MT5_WEBHOOK_SECRET` | ❌ | Your secret |

---

## Support

- **PlanetScale Docs**: https://planetscale.com/docs
- **Upstash Docs**: https://upstash.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Drizzle ORM**: https://orm.drizzle.team

---

## Security Checklist

- [ ] Never commit `.env` file or secrets to git
- [ ] Rotate `JWT_SECRET` regularly
- [ ] Use strong passwords for database
- [ ] Enable IP whitelist where available
- [ ] Monitor PlanetScale for unauthorized access
- [ ] Set up Upstash alerts for quota limits
- [ ] Enable automatic backups
- [ ] Test disaster recovery procedures
- [ ] Document all credentials securely
- [ ] Set up error tracking (Sentry)
