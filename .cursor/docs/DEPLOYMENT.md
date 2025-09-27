# Vercel Deployment Guide

This guide covers deploying the ChitFund application to Vercel with Prisma database integration.

## Prerequisites

1. **Database Setup**: You need a PostgreSQL database. Recommended providers:
   - [Neon](https://neon.tech/) - Serverless PostgreSQL
   - [Supabase](https://supabase.com/) - PostgreSQL with additional features
   - [PlanetScale](https://planetscale.com/) - MySQL (requires schema changes)
   - [Railway](https://railway.app/) - PostgreSQL

2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)

## Environment Variables

Set up the following environment variables in your Vercel dashboard:

### Required Variables

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
DIRECT_URL="postgresql://username:password@host:port/database?sslmode=require"

# Supabase (if using)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Smart Contract
NEXT_PUBLIC_CHITFUND_FACTORY_ADDRESS="0x..."

# Optional
NEXT_PUBLIC_FLOW_TESTNET_RPC="https://testnet.flowscan.org"
```

### Database URL Configuration

- **DATABASE_URL**: Connection pooled URL for application queries (use connection pooling)
- **DIRECT_URL**: Direct connection URL for migrations (no connection pooling)

For **Neon**:

```env
DATABASE_URL="postgresql://user:pass@ep-xxx.pooler.neon.tech/dbname?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require"
```

For **Supabase**:

```env
DATABASE_URL="postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres"
```

## Deployment Steps

### 1. Connect Repository to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure project settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `vercel-build` (uses our custom script)
   - **Output Directory**: `.next`
   - **Install Command**: `pnpm install`

### 2. Configure Environment Variables

1. In Vercel dashboard, go to **Settings** → **Environment Variables**
2. Add all required environment variables listed above
3. Make sure to set them for all environments (Production, Preview, Development)

### 3. Database Migration

The deployment will automatically run database migrations using the `vercel-build` script.

If you need to run migrations manually:

```bash
npx prisma migrate deploy
```

### 4. Verify Deployment

1. Check the deployment logs in Vercel dashboard
2. Visit your deployed application
3. Test the health endpoint: `https://your-app.vercel.app/api/health`

## Troubleshooting

### Common Issues

1. **Database Connection Timeout**
   - Ensure your database provider allows connections from Vercel
   - Check if connection pooling is properly configured
   - Verify DATABASE_URL and DIRECT_URL are correct

2. **Prisma Client Generation Fails**
   - Make sure `postinstall` script runs `prisma generate`
   - Check if all environment variables are set

3. **Migration Failures**
   - Ensure DIRECT_URL is set and points to direct database connection
   - Check database permissions
   - Verify schema syntax

### Performance Optimization

1. **Connection Pooling**: Always use connection pooling in production
2. **Query Optimization**: Use Prisma's built-in query optimization
3. **Caching**: Implement Redis caching for frequently accessed data

### Monitoring

- Use Vercel's built-in analytics
- Monitor database performance through your provider's dashboard
- Set up error tracking (e.g., Sentry)

## Local Development

To run the application locally:

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
pnpm db:migrate

# Generate Prisma client
pnpm db:generate

# Start development server
pnpm dev
```

## Production Considerations

1. **Security**: Never commit sensitive environment variables
2. **Backup**: Set up automated database backups
3. **Monitoring**: Implement health checks and error tracking
4. **Performance**: Use connection pooling and query optimization
5. **Scaling**: Consider database read replicas for high traffic

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
