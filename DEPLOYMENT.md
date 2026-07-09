# Deployment Guide

## Architecture Overview

This is a **full-stack application** with:
- React frontend (Vite)
- Node.js backend (Hono + tRPC)
- MySQL database
- Redis cache

## Vercel Deployment Considerations

### ⚠️ Important Limitations

Vercel is **serverless** and has constraints that differ from traditional hosting:

1. **Execution Timeout**: 10-30 seconds per request (configurable)
2. **Stateless**: Each request runs in an isolated environment
3. **No Persistent Services**: MySQL and Redis must be external
4. **Cold Starts**: First request after deployment may take longer

### Recommended Architecture

For production deployment on Vercel:

```
┌─────────────────────────────────────────────┐
│             Vercel (Frontend + API)         │
│  ┌─────────────────┐  ┌──────────────────┐  │
│  │  Next.js/Vite   │  │  Serverless Fn   │  │
│  │   (Frontend)    │  │  (Backend API)   │  │
│  └─────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────┘
           │                      │
           │                      │
     ┌──────────────┐    ┌────────────────┐
     │ S3/CDN       │    │ Database       │
     │ (Static)     │    │ (MySQL)        │
     └──────────────┘    │ (Managed)      │
                         │ (Atlas/PlanetScale)  │
                         │                │
                         │ Cache          │
                         │ (Redis)        │
                         │ (Upstash)      │
                         └────────────────┘
```

### External Services Required

1. **Database**: 
   - ✅ PlanetScale (MySQL)
   - ✅ MongoDB Atlas
   - ✅ AWS RDS
   
2. **Cache**:
   - ✅ Upstash (Redis)
   - ✅ Redis Cloud

3. **File Storage**:
   - ✅ AWS S3
   - ✅ Cloudinary
   - ✅ Vercel Blob Storage

## Environment Variables

Set these in Vercel Project Settings → Environment Variables:

```env
NODE_ENV=production
DATABASE_URL=mysql://user:pass@host/database
JWT_SECRET=your-secret-key
TELEGRAM_BOT_TOKEN=your-token
ALPHA_VANTAGE_API_KEY=your-api-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
REDIS_URL=redis://host:port
MT5_WEBHOOK_SECRET=your-webhook-secret
APP_ID=your-app-id
APP_SECRET=your-app-secret
KIMI_AUTH_URL=your-kimi-auth-url
KIMI_OPEN_URL=your-kimi-open-url
OWNER_UNION_ID=your-owner-union-id (optional)
```

## Deployment Steps

### Option 1: Docker Deployment (Recommended for Full Server)

Use **Railway**, **Render**, or **Fly.io** instead of Vercel:

```bash
# Deploy with Railway
railway link
railway up --detach
```

**Pros**: Full Node.js server support, persistent connections, WebSocket support
**Cons**: More expensive, more infrastructure management

### Option 2: Vercel (API Only + Managed Database)

1. **Prepare environment**:
   ```bash
   npm run build
   ```

2. **Set up external database**:
   - Use PlanetScale for MySQL: https://planetscale.com
   - Update DATABASE_URL in Vercel

3. **Set up external cache** (optional):
   - Use Upstash for Redis: https://upstash.com
   - Update REDIS_URL in Vercel

4. **Deploy**:
   ```bash
   vercel deploy --prod
   ```

## Database Migrations on Vercel

**IMPORTANT**: Database migrations need manual execution:

```bash
# Locally before deployment
npm run db:push

# Or manually via Vercel Environment Console
npm run db:migrate
```

### Safety Checklist Before Deployment

- [ ] All environment variables are set in Vercel Project Settings
- [ ] Database connection tested and accessible from Vercel
- [ ] Redis connection tested (if required)
- [ ] Database migrations have been run
- [ ] JWT_SECRET is strong and secure
- [ ] API endpoints have proper timeout handling (< 30 seconds)
- [ ] WebSocket features have fallback (REST polling)
- [ ] File uploads use S3 or managed storage
- [ ] Error logging configured (Sentry, LogRocket, etc.)
- [ ] All required KIMI env vars are set
- [ ] MT5_WEBHOOK_SECRET is configured
- [ ] Build completes without warnings
- [ ] Type checking passes: `npm run check`

## Troubleshooting

### Cold Starts
- First request after deployment may timeout
- **Solution**: Use warming functions or edge caching

### Database Connection Errors
- Connection pool exhaustion
- **Solution**: Use connection pooling (PlanetScale Proxy)

### Memory Issues
- Vercel function memory: 128MB - 3GB
- **Solution**: Optimize dependencies, lazy-load modules

### Timeout Errors
- API calls exceed 30 seconds
- **Solution**: Implement async jobs (Bull/Bee-Queue with external Redis)

### Environment Variable Missing Errors
- Check that all variables are set in Vercel Project Settings
- **Solution**: 
  ```bash
  vercel env pull  # Pull remote env to local
  vercel env list  # List all env vars
  ```

## Local Development vs Production

### Development
```bash
npm run dev
```

### Production Local Test
```bash
npm run build
npm start
```

## Monitoring

Set up monitoring for production:
- **Errors**: Sentry
- **Logs**: Vercel Analytics
- **Performance**: New Relic or DataDog
- **Uptime**: Pingdom or UptimeRobot

## Rollback Procedure

If deployment fails:

1. Revert database migrations:
   ```bash
   npm run db:migrate -- --revert
   ```

2. In Vercel Dashboard:
   - Go to Deployments
   - Select previous stable deployment
   - Click "Promote to Production"

3. Verify environment variables match previous state

## Pre-Deployment Build Validation

Run these checks before deploying:

```bash
# Type check
npm run check

# Lint
npm run lint

# Build
npm run build

# Test
npm run test
```

## Best Practices for Safe Redeployment

### 1. Version Control
- Always tag releases: `git tag -a v1.0.0 -m "Version 1.0.0"`
- Keep main branch deployable
- Use feature branches for changes

### 2. Database Safety
- **Never delete migrations** - only add new ones
- Test migrations locally first
- Create backups before running migrations
- Use blue-green deployments for major changes

### 3. Environment Safety
- Use separate Vercel projects for staging/production
- Never commit secrets to git
- Rotate secrets regularly
- Document all environment variables

### 4. Deployment Safety
- Deploy during low-traffic periods
- Monitor error rates during rollout
- Have a rollback plan ready
- Use gradual rollouts (canary deployments)

### 5. Code Review
- Require PR reviews before merge to main
- Run full test suite in CI
- Check for breaking changes
- Document migration steps

## Staging Environment Setup

Create a separate staging deployment:

```bash
# Link to staging project
vercel link --project trading-bot-staging

# Deploy to staging
vercel deploy

# Promote to production once tested
vercel promote
```

## Debugging Failed Deployments

### Check Vercel Logs
```bash
vercel logs  # View live logs
```

### Check Build Output
- Go to Vercel Dashboard
- Select deployment
- Click "View Function Logs"

### Local Reproduction
```bash
# Install Vercel CLI
npm i -g vercel

# Run locally with Vercel settings
vercel dev
```

## Performance Optimization

- Enable caching headers in vercel.json
- Use Vercel Edge Functions for lightweight operations
- Minimize cold starts with function size optimization
- Use CDN for static assets

## Support & Resources

- Vercel Docs: https://vercel.com/docs
- Node.js on Vercel: https://vercel.com/docs/nodejs/overview
- Environment Variables: https://vercel.com/docs/environment-variables
- Troubleshooting: https://vercel.com/docs/troubleshoot
