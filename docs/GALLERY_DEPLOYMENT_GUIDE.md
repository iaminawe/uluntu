# Gallery System Deployment Guide

## Overview

This guide covers the deployment process for the Gallery System, including environment setup, configuration, monitoring, and maintenance procedures.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Storage Configuration](#storage-configuration)
- [Application Deployment](#application-deployment)
- [Security Configuration](#security-configuration)
- [Performance Optimization](#performance-optimization)
- [Monitoring and Logging](#monitoring-and-logging)
- [Backup and Recovery](#backup-and-recovery)
- [Maintenance Procedures](#maintenance-procedures)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

**Production Environment:**
- Node.js 18+ LTS
- PostgreSQL 15+ (via Supabase)
- Redis 6+ (for caching)
- CDN (CloudFlare/AWS CloudFront)
- Load Balancer (if scaling horizontally)

**Development Environment:**
- Node.js 18+
- Git
- Docker (optional)
- Supabase CLI

### Service Dependencies

- **Supabase**: Database and storage backend
- **Vercel/Netlify**: Frontend hosting (recommended)
- **CloudFlare**: CDN and security
- **Sentry**: Error monitoring
- **LogRocket**: User session recording (optional)

## Environment Configuration

### Environment Variables

Create environment files for different stages:

**`.env.production`**
```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Gallery Configuration
NEXT_PUBLIC_GALLERY_MAX_FILE_SIZE=10485760  # 10MB
NEXT_PUBLIC_GALLERY_MAX_FILES=50
NEXT_PUBLIC_GALLERY_CONCURRENT_UPLOADS=3

# Storage Configuration
NEXT_PUBLIC_STORAGE_BUCKET=gallery-photos
SUPABASE_STORAGE_URL=https://your-project.supabase.co/storage/v1

# Image Processing
NEXT_PUBLIC_IMAGE_PROCESSING_ENABLED=true
NEXT_PUBLIC_WEBP_ENABLED=true
NEXT_PUBLIC_SMART_CROP_ENABLED=true

# CDN Configuration
NEXT_PUBLIC_CDN_URL=https://cdn.your-domain.com
NEXT_PUBLIC_CDN_ENABLED=true

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
NEXT_PUBLIC_SENTRY_DSN=https://your-public-sentry-dsn
LOGFOCKET_APP_ID=your-logrocket-id

# Analytics
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id

# Rate Limiting
RATE_LIMIT_WINDOW_MS=3600000  # 1 hour
RATE_LIMIT_MAX_REQUESTS=1000
RATE_LIMIT_UPLOAD_MAX=100

# Security
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com
ALLOWED_HOSTS=your-domain.com,www.your-domain.com

# Performance
CACHE_TTL=3600  # 1 hour
IMAGE_CACHE_TTL=86400  # 24 hours
```

**`.env.staging`**
```bash
NODE_ENV=staging
NEXT_PUBLIC_APP_URL=https://staging.your-domain.com
# ... other staging-specific values
```

**`.env.development`**
```bash
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
# ... development values
```

### Configuration Validation

Create a config validation utility:

```typescript
// src/config/validation.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  NEXT_PUBLIC_GALLERY_MAX_FILE_SIZE: z.string().transform(Number),
  NEXT_PUBLIC_GALLERY_MAX_FILES: z.string().transform(Number),
  SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_CDN_URL: z.string().url().optional(),
});

export const validateConfig = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid environment configuration:', error);
    process.exit(1);
  }
};

export const config = validateConfig();
```

## Database Setup

### Supabase Configuration

1. **Create Supabase Project**
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref
```

2. **Run Migrations**
```bash
# Apply database migrations
supabase db push

# Or run specific migration
supabase migration up 20250622000009_create_gallery_storage_system
```

3. **Set Up Row Level Security**
```sql
-- Enable RLS on all gallery tables
ALTER TABLE user_galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_likes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (already included in migrations)
```

4. **Create Database Indexes**
```sql
-- Performance indexes for gallery queries
CREATE INDEX CONCURRENTLY idx_user_galleries_user_id ON user_galleries(user_id);
CREATE INDEX CONCURRENTLY idx_user_galleries_privacy ON user_galleries(privacy_level);
CREATE INDEX CONCURRENTLY idx_user_galleries_created ON user_galleries(created_at DESC);
CREATE INDEX CONCURRENTLY idx_gallery_photos_gallery_id ON gallery_photos(gallery_id);
CREATE INDEX CONCURRENTLY idx_gallery_photos_sort ON gallery_photos(gallery_id, sort_order);
CREATE INDEX CONCURRENTLY idx_gallery_likes_gallery_user ON gallery_likes(gallery_id, user_id);
CREATE INDEX CONCURRENTLY idx_photo_likes_photo_user ON photo_likes(photo_id, user_id);

-- Full-text search indexes
CREATE INDEX CONCURRENTLY idx_user_galleries_search ON user_galleries 
USING gin(to_tsvector('english', title || ' ' || coalesce(description, '')));
```

### Database Optimization

```sql
-- Optimize PostgreSQL settings
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET track_activity_query_size = 2048;
ALTER SYSTEM SET pg_stat_statements.track = 'all';

-- Auto-vacuum settings
ALTER SYSTEM SET autovacuum_naptime = '15s';
ALTER SYSTEM SET autovacuum_vacuum_scale_factor = 0.1;
ALTER SYSTEM SET autovacuum_analyze_scale_factor = 0.05;
```

## Storage Configuration

### Supabase Storage Setup

1. **Create Storage Buckets**
```sql
-- Create gallery photos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery-photos',
  'gallery-photos',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
);
```

2. **Configure Storage Policies**
```sql
-- Policy for authenticated users to upload photos
CREATE POLICY "Authenticated users can upload photos" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'gallery-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy for public read access
CREATE POLICY "Public can view photos" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'gallery-photos');

-- Policy for users to delete their own photos
CREATE POLICY "Users can delete own photos" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'gallery-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
```

3. **Configure CDN**
```javascript
// next.config.js
const nextConfig = {
  images: {
    domains: [
      'your-project.supabase.co',
      'cdn.your-domain.com'
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400, // 24 hours
  },
  // Enable image optimization
  experimental: {
    images: {
      allowFutureImage: true
    }
  }
};
```

### CDN Configuration (CloudFlare)

```javascript
// cloudflare-workers/image-transform.js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Image transformation parameters
    const width = url.searchParams.get('w');
    const quality = url.searchParams.get('q') || '85';
    const format = url.searchParams.get('f') || 'auto';
    
    // Build CloudFlare Image Resizing URL
    const imageUrl = `https://your-project.supabase.co${url.pathname}`;
    const transformedUrl = `https://cdn.your-domain.com/cdn-cgi/image/width=${width},quality=${quality},format=${format}/${imageUrl}`;
    
    return fetch(transformedUrl, {
      headers: request.headers,
      cf: {
        cacheEverything: true,
        cacheTtl: 86400 // 24 hours
      }
    });
  }
};
```

## Application Deployment

### Vercel Deployment

1. **Project Configuration**
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "regions": ["iad1", "sfo1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://your-domain.com"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/gallery-api/(.*)",
      "destination": "/api/galleries/$1"
    }
  ]
}
```

2. **Build Configuration**
```json
// package.json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "jest",
    "test:e2e": "playwright test",
    "deploy": "vercel --prod",
    "deploy:staging": "vercel --target staging"
  }
}
```

3. **Environment Setup**
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link project
vercel link

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# ... add all other environment variables

# Deploy
vercel --prod
```

### Docker Deployment (Alternative)

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
```

## Security Configuration

### CORS Configuration

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle CORS
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': process.env.CORS_ORIGINS || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Security headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

export const config = {
  matcher: ['/api/:path*', '/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

### Rate Limiting

```typescript
// lib/rate-limiter.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 h'), // 100 requests per hour
  analytics: true,
});

export const uploadRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 uploads per hour
  analytics: true,
});

// Usage in API routes
export async function applyRateLimit(request: Request, identifier: string) {
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier);
  
  if (!success) {
    throw new Error('Rate limit exceeded');
  }
  
  return { limit, reset, remaining };
}
```

### Content Security Policy

```typescript
// next.config.js
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://*.supabase.co https://cdn.your-domain.com;
  font-src 'self';
  connect-src 'self' https://*.supabase.co wss://*.supabase.co;
  media-src 'self' blob:;
  worker-src 'self' blob:;
  frame-src 'none';
  form-action 'self';
  base-uri 'self';
  upgrade-insecure-requests;
`;

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim()
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  }
];
```

## Performance Optimization

### Image Optimization

```typescript
// lib/image-optimization.ts
export const imageOptimizationConfig = {
  quality: 85,
  formats: ['image/webp', 'image/avif', 'image/jpeg'],
  sizes: [320, 640, 768, 1024, 1280, 1600],
  placeholder: 'blur',
  loading: 'lazy',
};

// Optimize images during build
export const optimizeImages = async () => {
  const sharp = require('sharp');
  const glob = require('glob');
  
  const images = glob.sync('public/images/**/*.{jpg,jpeg,png}');
  
  for (const image of images) {
    const outputPath = image.replace(/\.(jpg|jpeg|png)$/, '.webp');
    
    await sharp(image)
      .webp({ quality: 85 })
      .toFile(outputPath);
  }
};
```

### Caching Strategy

```typescript
// lib/cache.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export class CacheManager {
  static async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data as string) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  static async set(key: string, value: any, ttl = 3600): Promise<void> {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  static async invalidate(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }
}

// Usage in API
export const getCachedGalleries = async (filters: any) => {
  const cacheKey = `galleries:${JSON.stringify(filters)}`;
  
  let galleries = await CacheManager.get(cacheKey);
  if (!galleries) {
    galleries = await fetchGalleriesFromDB(filters);
    await CacheManager.set(cacheKey, galleries, 1800); // 30 minutes
  }
  
  return galleries;
};
```

### Database Connection Pooling

```typescript
// lib/db-pool.ts
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  const client = await pool.connect();
  
  try {
    const result = await client.query(text, params);
    const duration = Date.now() - start;
    
    if (duration > 1000) {
      console.warn(`Slow query (${duration}ms):`, text);
    }
    
    return result;
  } finally {
    client.release();
  }
};
```

## Monitoring and Logging

### Error Monitoring (Sentry)

```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Postgres(),
  ],
  beforeSend(event) {
    // Filter out sensitive data
    if (event.exception) {
      const error = event.exception.values?.[0];
      if (error?.stacktrace?.frames) {
        error.stacktrace.frames = error.stacktrace.frames.filter(
          frame => !frame.filename?.includes('node_modules')
        );
      }
    }
    return event;
  },
});

export const captureError = (error: Error, context?: any) => {
  Sentry.withScope(scope => {
    if (context) {
      scope.setContext('additional', context);
    }
    Sentry.captureException(error);
  });
};
```

### Application Logging

```typescript
// lib/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
});

export const logGalleryEvent = (event: string, data: any) => {
  logger.info('Gallery Event', {
    event,
    data,
    timestamp: new Date().toISOString()
  });
};

export default logger;
```

### Performance Monitoring

```typescript
// lib/performance.ts
export class PerformanceMonitor {
  static startTimer(name: string) {
    performance.mark(`${name}-start`);
  }

  static endTimer(name: string) {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const measure = performance.getEntriesByName(name)[0];
    if (measure.duration > 1000) {
      console.warn(`Slow operation: ${name} took ${measure.duration}ms`);
    }
    
    return measure.duration;
  }

  static async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.startTimer(name);
    try {
      const result = await fn();
      return result;
    } finally {
      this.endTimer(name);
    }
  }
}

// Usage
const uploadPhoto = async (file: File) => {
  return PerformanceMonitor.measureAsync('photo-upload', async () => {
    // Upload logic here
  });
};
```

## Backup and Recovery

### Database Backup

```bash
#!/bin/bash
# scripts/backup-db.sh

# Set variables
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_URL="postgresql://user:pass@host:port/database"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create database backup
pg_dump $DB_URL > "$BACKUP_DIR/gallery_backup_$DATE.sql"

# Compress backup
gzip "$BACKUP_DIR/gallery_backup_$DATE.sql"

# Upload to cloud storage (AWS S3 example)
aws s3 cp "$BACKUP_DIR/gallery_backup_$DATE.sql.gz" \
  s3://your-backup-bucket/database/

# Clean up old local backups (keep 7 days)
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: gallery_backup_$DATE.sql.gz"
```

### Storage Backup

```bash
#!/bin/bash
# scripts/backup-storage.sh

# Sync Supabase storage to backup location
rclone sync supabase:gallery-photos backup-s3:gallery-backup/photos \
  --progress \
  --transfers 4 \
  --checkers 8

echo "Storage backup completed"
```

### Automated Backup Schedule

```yaml
# .github/workflows/backup.yml
name: Automated Backups

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install -g supabase
        
      - name: Run database backup
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID }}
        run: |
          supabase db dump --project-id $SUPABASE_PROJECT_ID > backup.sql
          
      - name: Upload to S3
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
          
      - name: Sync to S3
        run: |
          aws s3 cp backup.sql s3://your-backup-bucket/$(date +%Y%m%d)/
```

## Maintenance Procedures

### Database Maintenance

```sql
-- Weekly maintenance script
-- Run ANALYZE to update statistics
ANALYZE;

-- Reindex heavily used tables
REINDEX TABLE user_galleries;
REINDEX TABLE gallery_photos;

-- Clean up old sessions (if using database sessions)
DELETE FROM auth.sessions WHERE expires_at < NOW() - INTERVAL '7 days';

-- Update table statistics
SELECT schemaname, tablename, attname, n_distinct, correlation 
FROM pg_stats 
WHERE schemaname = 'public' 
ORDER BY tablename, attname;
```

### Storage Cleanup

```typescript
// scripts/cleanup-orphaned-files.ts
import { supabase } from '../lib/supabase';

export async function cleanupOrphanedFiles() {
  // Get all file paths from storage
  const { data: files } = await supabase.storage
    .from('gallery-photos')
    .list('', { limit: 10000 });

  // Get all photo records from database
  const { data: photos } = await supabase
    .from('gallery_photos')
    .select('storage_path, original_path, large_path, medium_path, small_path, thumbnail_path');

  // Find files not referenced in database
  const referencedPaths = new Set();
  photos?.forEach(photo => {
    [photo.storage_path, photo.original_path, photo.large_path, 
     photo.medium_path, photo.small_path, photo.thumbnail_path]
      .filter(Boolean)
      .forEach(path => referencedPaths.add(path));
  });

  const orphanedFiles = files?.filter(file => 
    !referencedPaths.has(file.name)
  ) || [];

  // Delete orphaned files
  if (orphanedFiles.length > 0) {
    const { error } = await supabase.storage
      .from('gallery-photos')
      .remove(orphanedFiles.map(f => f.name));

    if (error) {
      console.error('Error deleting orphaned files:', error);
    } else {
      console.log(`Deleted ${orphanedFiles.length} orphaned files`);
    }
  }
}
```

### Health Checks

```typescript
// lib/health-check.ts
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Record<string, {
    status: 'ok' | 'warning' | 'error';
    message?: string;
    responseTime?: number;
  }>;
}

export async function performHealthCheck(): Promise<HealthStatus> {
  const checks: HealthStatus['checks'] = {};

  // Database check
  try {
    const start = Date.now();
    const { data } = await supabase.from('user_galleries').select('id').limit(1);
    checks.database = {
      status: 'ok',
      responseTime: Date.now() - start
    };
  } catch (error) {
    checks.database = {
      status: 'error',
      message: 'Database connection failed'
    };
  }

  // Storage check
  try {
    const start = Date.now();
    const { data } = await supabase.storage.from('gallery-photos').list('', { limit: 1 });
    checks.storage = {
      status: 'ok',
      responseTime: Date.now() - start
    };
  } catch (error) {
    checks.storage = {
      status: 'error',
      message: 'Storage connection failed'
    };
  }

  // Overall status
  const hasErrors = Object.values(checks).some(check => check.status === 'error');
  const hasWarnings = Object.values(checks).some(check => check.status === 'warning');

  return {
    status: hasErrors ? 'unhealthy' : hasWarnings ? 'degraded' : 'healthy',
    checks
  };
}
```

## Troubleshooting

### Common Issues

#### High Memory Usage
```typescript
// Monitor memory usage
const monitoring = setInterval(() => {
  if (process.memoryUsage().heapUsed > 500 * 1024 * 1024) { // 500MB
    console.warn('High memory usage detected');
    // Trigger garbage collection
    if (global.gc) {
      global.gc();
    }
  }
}, 30000);
```

#### Slow Database Queries
```sql
-- Find slow queries
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
WHERE mean_time > 1000
ORDER BY mean_time DESC
LIMIT 10;

-- Check for missing indexes
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE schemaname = 'public'
AND n_distinct > 100
AND correlation < 0.1;
```

#### Storage Issues
```typescript
// Check storage quota
const checkStorageQuota = async () => {
  const { data, error } = await supabase.storage
    .from('gallery-photos')
    .list('', { limit: 1 });

  if (error?.message?.includes('quota')) {
    console.error('Storage quota exceeded');
    // Implement cleanup or notification
  }
};
```

### Debugging Tools

```typescript
// Debug middleware
export const debugMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
    
    if (duration > 5000) {
      console.warn(`Slow request: ${req.method} ${req.url} took ${duration}ms`);
    }
  });
  
  next();
};
```

### Emergency Procedures

```bash
#!/bin/bash
# Emergency rollback script

echo "Starting emergency rollback..."

# 1. Revert to previous deployment
vercel rollback --yes

# 2. Reset database to last backup
# psql $DATABASE_URL < latest_backup.sql

# 3. Clear cache
redis-cli FLUSHALL

# 4. Notify team
curl -X POST $SLACK_WEBHOOK \
  -H 'Content-type: application/json' \
  -d '{"text":"🚨 Emergency rollback completed"}'

echo "Rollback completed"
```

This deployment guide provides comprehensive coverage of production deployment procedures. Always test deployment steps in staging environment before applying to production.