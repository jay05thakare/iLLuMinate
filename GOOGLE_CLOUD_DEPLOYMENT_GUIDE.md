# iLLuMinate Google Cloud Deployment Guide

This comprehensive guide will walk you through deploying the iLLuMinate project on Google Cloud Platform (GCP). The project consists of three main services:

- **Backend**: Node.js/Express API server
- **Frontend**: React/Vite web application  
- **AI Services**: FastAPI Python application
- **Database**: PostgreSQL with Redis cache

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Google Cloud Setup](#google-cloud-setup)
3. [Database Setup (Cloud SQL)](#database-setup-cloud-sql)
4. [Containerization with Docker](#containerization-with-docker)
5. [Backend Deployment (Cloud Run)](#backend-deployment-cloud-run)
6. [AI Services Deployment (Cloud Run)](#ai-services-deployment-cloud-run)
7. [Frontend Deployment (Firebase Hosting)](#frontend-deployment-firebase-hosting)
8. [Environment Configuration](#environment-configuration)
9. [Custom Domain & SSL](#custom-domain--ssl)
10. [Monitoring & Logging](#monitoring--logging)
11. [CI/CD with Cloud Build](#cicd-with-cloud-build)
12. [Cost Optimization](#cost-optimization)
13. [Troubleshooting](#troubleshooting)

## Prerequisites

Before starting, ensure you have:

- Google Cloud account with billing enabled
- Domain name (optional, for custom domains)
- Local development environment with:
  - Node.js (v22+)
  - Python (v3.13+)
  - Docker Desktop
  - Git

## Google Cloud Setup

### 1. Create a New Project

```bash
# Install Google Cloud CLI
# macOS
brew install google-cloud-sdk

# Authenticate
gcloud auth login

# Set your existing project as default
gcloud config set project illuminate-472809

# Enable required APIs
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  sqladmin.googleapis.com \
  secretmanager.googleapis.com \
  storage-api.googleapis.com \
  firebase.googleapis.com \
  cloudresourcemanager.googleapis.com
```

### 2. Set Up Billing

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to Billing
3. Link a billing account to your project

### 3. Create Service Account

```bash
# Create service account for deployments
gcloud iam service-accounts create illuminate-deploy \
  --description="Service account for iLLuMinate deployments" \
  --display-name="iLLuMinate Deploy"

# Grant necessary roles (using your project ID)
gcloud projects add-iam-policy-binding illuminate-472809 \
  --member="serviceAccount:illuminate-deploy@illuminate-472809.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding illuminate-472809 \
  --member="serviceAccount:illuminate-deploy@illuminate-472809.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding illuminate-472809 \
  --member="serviceAccount:illuminate-deploy@illuminate-472809.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

# Create and download service account key
gcloud iam service-accounts keys create illuminate-deploy-key.json \
  --iam-account=illuminate-deploy@illuminate-472809.iam.gserviceaccount.com
```

## Database Setup (Cloud SQL)

### 1. Create PostgreSQL Instance

```bash
# Create Cloud SQL PostgreSQL instance
gcloud sql instances create illuminate-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --storage-type=SSD \
  --storage-size=10GB \
  --storage-auto-increase

# Set root password
gcloud sql users set-password postgres \
  --instance=illuminate-db \
  --password=YOUR_SECURE_PASSWORD

# Create application database
gcloud sql databases create illuminate_db \
  --instance=illuminate-db

# Create application user
gcloud sql users create illuminate \
  --instance=illuminate-db \
  --password=YOUR_APP_PASSWORD
```

### 2. Configure Database Connection

```bash
# Get connection name (will be: illuminate-472809:us-central1:illuminate-db)
gcloud sql instances describe illuminate-db --format="value(connectionName)"
# Save this connection name - you'll need it later
```

### 3. Set Up Cloud SQL Proxy (for local development)

```bash
# Download Cloud SQL Proxy
curl -o cloud_sql_proxy https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64
chmod +x cloud_sql_proxy

# Start proxy (using your project connection name)
./cloud_sql_proxy -instances=illuminate-472809:us-central1:illuminate-db=tcp:5432
```

## Containerization with Docker

### 1. Create Dockerfiles

#### Backend Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["npm", "start"]
```

#### AI Services Dockerfile

Create `ai-services/Dockerfile`:

```dockerfile
FROM python:3.13-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY src/ ./src/

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Start application
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Frontend Dockerfile

Create `frontend/Dockerfile`:

```dockerfile
# Build stage
FROM node:22-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

#### Frontend Nginx Configuration

Create `frontend/nginx.conf`:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### 2. Create .dockerignore files

#### Backend .dockerignore

Create `backend/.dockerignore`:

```
node_modules
npm-debug.log
Dockerfile
.dockerignore
.git
.gitignore
README.md
.env
coverage
.nyc_output
test
tests
*.test.js
*.spec.js
logs/*.log
```

#### AI Services .dockerignore

Create `ai-services/.dockerignore`:

```
__pycache__
*.pyc
*.pyo
*.pyd
.Python
venv
.venv
pip-log.txt
pip-delete-this-directory.txt
.tox
.coverage
.coverage.*
.cache
nosetests.xml
coverage.xml
*.cover
*.log
.git
.mypy_cache
.pytest_cache
.hypothesis
.env
tests
Dockerfile
.dockerignore
README.md
```

#### Frontend .dockerignore

Create `frontend/.dockerignore`:

```
node_modules
npm-debug.log
Dockerfile
.dockerignore
.git
.gitignore
README.md
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
dist
coverage
```

## Backend Deployment (Cloud Run)

### 1. Build and Deploy Backend

```bash
# Navigate to backend directory
cd backend

# Build and push Docker image
gcloud builds submit --tag gcr.io/illuminate-472809/illuminate-backend

# Deploy to Cloud Run
gcloud run deploy illuminate-backend \
  --image gcr.io/illuminate-472809/illuminate-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --set-cloudsql-instances illuminate-472809:us-central1:illuminate-db \
  --set-env-vars "NODE_ENV=production,PORT=3000,DB_HOST=/cloudsql/illuminate-472809:us-central1:illuminate-db"
```

### 2. Set Environment Variables

```bash
# Set environment variables for backend
gcloud run services update illuminate-backend \
  --set-env-vars \
  "NODE_ENV=production,\
  PORT=3000,\
  DB_HOST=/cloudsql/illuminate-472809:us-central1:illuminate-db,\
  DB_NAME=illuminate_db,\
  DB_USER=illuminate,\
  DB_PASSWORD=YOUR_APP_PASSWORD,\
  JWT_SECRET=your-production-jwt-secret,\
  CORS_ORIGIN=https://your-domain.com,\
  AI_SERVICE_URL=https://illuminate-ai-SERVICE_URL"
```

## AI Services Deployment (Cloud Run)

### 1. Build and Deploy AI Services

```bash
# Navigate to ai-services directory
cd ai-services

# Build and push Docker image
gcloud builds submit --tag gcr.io/illuminate-472809/illuminate-ai

# Deploy to Cloud Run
gcloud run deploy illuminate-ai \
  --image gcr.io/illuminate-472809/illuminate-ai \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8000 \
  --memory 1Gi \
  --cpu 2 \
  --min-instances 0 \
  --max-instances 5 \
  --timeout 300 \
  --set-env-vars "ENVIRONMENT=production,PORT=8000"
```

### 2. Set AI Service Environment Variables

```bash
# Set environment variables for AI services
gcloud run services update illuminate-ai \
  --set-env-vars \
  "ENVIRONMENT=production,\
  PORT=8000,\
  OPENAI_API_KEY=your-openai-api-key,\
  DATABASE_URL=postgresql://illuminate:YOUR_APP_PASSWORD@/illuminate_db?host=/cloudsql/illuminate-472809:us-central1:illuminate-db"
```

## Frontend Deployment (Firebase Hosting)

### 1. Set Up Firebase

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
cd frontend
firebase init hosting

# Select your Google Cloud project
# Choose 'dist' as public directory
# Configure as single-page app: Yes
# Don't overwrite index.html
```

### 2. Configure Environment Variables

Create `frontend/.env.production`:

```env
VITE_API_URL=https://illuminate-backend-RANDOM_ID-uc.a.run.app
VITE_AI_SERVICE_URL=https://illuminate-ai-RANDOM_ID-uc.a.run.app
VITE_APP_NAME=iLLuMinate
VITE_ENVIRONMENT=production
```

### 3. Build and Deploy Frontend

```bash
# Build the application
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

### 4. Alternative: Deploy to Cloud Storage + Cloud CDN

If you prefer Cloud Storage over Firebase:

```bash
# Create bucket
gsutil mb gs://illuminate-frontend-bucket

# Enable web serving
gsutil web set -m index.html -e index.html gs://illuminate-frontend-bucket

# Upload files
gsutil -m rsync -r -d dist/ gs://illuminate-frontend-bucket

# Make bucket public
gsutil iam ch allUsers:objectViewer gs://illuminate-frontend-bucket
```

## Environment Configuration

### 1. Set Up Secret Manager

```bash
# Store sensitive environment variables in Secret Manager
echo "your-production-jwt-secret" | gcloud secrets create jwt-secret --data-file=-
echo "your-openai-api-key" | gcloud secrets create openai-api-key --data-file=-
echo "your-app-db-password" | gcloud secrets create db-password --data-file=-

# Grant access to Cloud Run services
gcloud secrets add-iam-policy-binding jwt-secret \
  --member="serviceAccount:illuminate-deploy@illuminate-472809.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 2. Update Cloud Run Services to Use Secrets

```bash
# Update backend service
gcloud run services update illuminate-backend \
  --update-secrets=JWT_SECRET=jwt-secret:latest,DB_PASSWORD=db-password:latest

# Update AI service
gcloud run services update illuminate-ai \
  --update-secrets=OPENAI_API_KEY=openai-api-key:latest
```

## Custom Domain & SSL

### 1. Set Up Custom Domain for Cloud Run

```bash
# Map domain to backend service
gcloud run domain-mappings create \
  --service illuminate-backend \
  --domain api.yourdomain.com \
  --region us-central1

# Map domain to AI service
gcloud run domain-mappings create \
  --service illuminate-ai \
  --domain ai.yourdomain.com \
  --region us-central1
```

### 2. Configure DNS

Add the following DNS records to your domain:

```
api.yourdomain.com    CNAME    ghs.googlehosted.com
ai.yourdomain.com     CNAME    ghs.googlehosted.com
```

### 3. Set Up Custom Domain for Frontend

If using Firebase Hosting:

```bash
firebase hosting:channel:create live
firebase target:apply hosting production your-site-id
```

Add to `firebase.json`:

```json
{
  "hosting": {
    "target": "production",
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

## Database Migration

### 1. Run Initial Migrations

```bash
# Connect to Cloud SQL instance via proxy
./cloud_sql_proxy -instances=illuminate-472809:us-central1:illuminate-db=tcp:5432 &

# Run migrations from your local machine
cd backend
DB_HOST=localhost DB_PORT=5432 DB_NAME=illuminate_db \
DB_USER=illuminate DB_PASSWORD=YOUR_APP_PASSWORD \
npm run migrate
```

### 2. Automated Migration with Cloud Build

Create `cloudbuild-migration.yaml`:

```yaml
steps:
  - name: 'node:22'
    dir: 'backend'
    entrypoint: 'npm'
    args: ['install']

  - name: 'node:22'
    dir: 'backend'
    entrypoint: 'npm'
    args: ['run', 'migrate']
    env:
      - 'NODE_ENV=production'
      - 'DB_HOST=/cloudsql/illuminate-472809:us-central1:illuminate-db'
      - 'DB_NAME=illuminate_db'
      - 'DB_USER=illuminate'
      - 'DB_PASSWORD=YOUR_APP_PASSWORD'

options:
  logging: CLOUD_LOGGING_ONLY
```

## Monitoring & Logging

### 1. Set Up Cloud Monitoring

```bash
# Enable monitoring API
gcloud services enable monitoring.googleapis.com

# Create uptime checks
gcloud alpha monitoring uptime create \
  --display-name="iLLuMinate Backend Health" \
  --http-check-path="/health" \
  --hostname="api.yourdomain.com"

gcloud alpha monitoring uptime create \
  --display-name="iLLuMinate AI Health" \
  --http-check-path="/health" \
  --hostname="ai.yourdomain.com"
```

### 2. Set Up Alerting

Create alerting policies in Cloud Console:

1. Go to Monitoring → Alerting
2. Create policies for:
   - High error rates (>5%)
   - High latency (>2s)
   - Service downtime
   - Database connection failures

### 3. Logging Configuration

Cloud Run automatically sends logs to Cloud Logging. Configure log-based metrics:

```bash
# Create log-based metric for errors
gcloud logging metrics create error_rate \
  --description="Rate of error logs" \
  --log-filter='resource.type="cloud_run_revision" AND severity>=ERROR'
```

## CI/CD with Cloud Build

### 1. Create Cloud Build Configuration

Create `cloudbuild.yaml` in project root:

```yaml
steps:
  # Build Backend
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$illuminate-472809/illuminate-backend', './backend']
    id: 'build-backend'

  # Build AI Services
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$illuminate-472809/illuminate-ai', './ai-services']
    id: 'build-ai'

  # Push images
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$illuminate-472809/illuminate-backend']
    waitFor: ['build-backend']

  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$illuminate-472809/illuminate-ai']
    waitFor: ['build-ai']

  # Deploy Backend
  - name: 'gcr.io/cloud-builders/gcloud'
    args: [
      'run', 'deploy', 'illuminate-backend',
      '--image', 'gcr.io/$illuminate-472809/illuminate-backend',
      '--region', 'us-central1',
      '--platform', 'managed',
      '--allow-unauthenticated'
    ]
    waitFor: ['build-backend']

  # Deploy AI Services
  - name: 'gcr.io/cloud-builders/gcloud'
    args: [
      'run', 'deploy', 'illuminate-ai',
      '--image', 'gcr.io/$illuminate-472809/illuminate-ai',
      '--region', 'us-central1',
      '--platform', 'managed',
      '--allow-unauthenticated'
    ]
    waitFor: ['build-ai']

  # Build and Deploy Frontend
  - name: 'node:22'
    dir: 'frontend'
    entrypoint: 'npm'
    args: ['install']

  - name: 'node:22'
    dir: 'frontend'
    entrypoint: 'npm'
    args: ['run', 'build']
    env:
      - 'VITE_API_URL=https://illuminate-backend-$illuminate-472809.run.app'
      - 'VITE_AI_SERVICE_URL=https://illuminate-ai-$illuminate-472809.run.app'

  - name: 'gcr.io/$illuminate-472809/firebase'
    dir: 'frontend'
    args: ['deploy', '--only', 'hosting']

images:
  - 'gcr.io/$illuminate-472809/illuminate-backend'
  - 'gcr.io/$illuminate-472809/illuminate-ai'

options:
  logging: CLOUD_LOGGING_ONLY
```

### 2. Set Up Build Triggers

```bash
# Connect repository
gcloud builds triggers create github \
  --repo-name=illuminate \
  --repo-owner=YOUR_GITHUB_USERNAME \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml
```

### 3. Create Firebase Docker Image

Create `firebase.Dockerfile`:

```dockerfile
FROM node:22-alpine

RUN npm install -g firebase-tools

ENTRYPOINT ["firebase"]
```

Build and push:

```bash
docker build -f firebase.Dockerfile -t gcr.io/illuminate-472809/firebase .
docker push gcr.io/illuminate-472809/firebase
```

## Cost Optimization

### 1. Cloud Run Optimization

```bash
# Set minimum instances to 0 for development
gcloud run services update illuminate-backend --min-instances=0
gcloud run services update illuminate-ai --min-instances=0

# Use smaller machine types for testing
gcloud run services update illuminate-backend --memory=512Mi --cpu=1
gcloud run services update illuminate-ai --memory=1Gi --cpu=1
```

### 2. Database Optimization

```bash
# Use shared-core instances for development
gcloud sql instances patch illuminate-db --tier=db-f1-micro

# Enable automatic storage increase
gcloud sql instances patch illuminate-db --storage-auto-increase
```

### 3. Storage Optimization

```bash
# Set lifecycle rules for container images
gsutil lifecycle set lifecycle.json gs://artifacts.illuminate-472809.appspot.com
```

Create `lifecycle.json`:

```json
{
  "rule": [
    {
      "action": {"type": "Delete"},
      "condition": {"age": 30}
    }
  ]
}
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Cloud SQL Connection Issues

```bash
# Check Cloud SQL instance status
gcloud sql instances describe illuminate-db

# Test connection
gcloud sql connect illuminate-db --user=illuminate --database=illuminate_db
```

#### 2. Cloud Run Service Not Starting

```bash
# Check logs
gcloud logs read "resource.type=cloud_run_revision AND resource.labels.service_name=illuminate-backend" --limit=50

# Check service status
gcloud run services describe illuminate-backend --region=us-central1
```

#### 3. Build Failures

```bash
# Check build logs
gcloud builds list --limit=5
gcloud builds log BUILD_ID
```

#### 4. DNS and Domain Issues

```bash
# Check domain mapping status
gcloud run domain-mappings describe --domain=api.yourdomain.com --region=us-central1

# Verify DNS propagation
nslookup api.yourdomain.com
```

### Health Check Endpoints

Ensure your services implement health check endpoints:

**Backend** (`/health`):
```javascript
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'illuminate-backend'
  });
});
```

**AI Services** (`/health`):
```python
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "service": "illuminate-ai"
    }
```

### Performance Optimization

1. **Enable HTTP/2**: Cloud Run automatically supports HTTP/2
2. **Use CDN**: Enable Cloud CDN for static assets
3. **Optimize Images**: Use Container Registry's vulnerability scanning
4. **Database Connection Pooling**: Configure connection pools in your applications

### Security Best Practices

1. **Use least privilege IAM roles**
2. **Enable VPC connectors for private networking**
3. **Use Secret Manager for sensitive data**
4. **Enable audit logging**
5. **Set up security scanning for containers**

### Scaling Configuration

```bash
# Configure autoscaling
gcloud run services update illuminate-backend \
  --cpu=1 \
  --memory=512Mi \
  --min-instances=1 \
  --max-instances=100 \
  --concurrency=80

gcloud run services update illuminate-ai \
  --cpu=2 \
  --memory=2Gi \
  --min-instances=0 \
  --max-instances=10 \
  --concurrency=10
```

## Production Checklist

Before going live, ensure you have:

- [ ] Domain configured with SSL certificates
- [ ] Environment variables properly set
- [ ] Database migrations completed
- [ ] Monitoring and alerting configured
- [ ] Backup strategy implemented
- [ ] Security scanning enabled
- [ ] Performance testing completed
- [ ] Documentation updated
- [ ] Team access configured
- [ ] Disaster recovery plan in place

## Support and Resources

- [Google Cloud Documentation](https://cloud.google.com/docs)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud SQL Documentation](https://cloud.google.com/sql/docs)
- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)

## Estimated Monthly Costs

For a production deployment with moderate traffic:

- **Cloud SQL (db-f1-micro)**: ~$7-15/month
- **Cloud Run (Backend)**: ~$10-30/month
- **Cloud Run (AI Services)**: ~$15-50/month
- **Firebase Hosting**: ~$0-25/month (based on usage)
- **Cloud Storage**: ~$1-5/month
- **Load Balancing**: ~$18/month
- **Total**: ~$51-143/month

Costs scale with usage. Use the [Google Cloud Pricing Calculator](https://cloud.google.com/products/calculator) for accurate estimates based on your expected traffic.

---

**Note**: Replace `YOUR_DOMAIN.com` and other placeholders with your actual values throughout this guide. Your project ID `illuminate-472809` is already configured.

## ⚠️ **Critical Environment Variables Summary**

Both services now have these essential environment variables configured:

### **Backend Service Environment Variables:**
- `NODE_ENV=production`
- `DB_HOST=/cloudsql/illuminate-472809:us-central1:illuminate-db`
- `DB_NAME=illuminate_db`
- `DB_USER=illuminate`
- `DB_PASSWORD=e843050527f45a81c81e81be60ae9830`
- `JWT_SECRET=6c8d92b0dc7c6c75f09dbfc240d1273349c204d5318ed14fb8f1b0457babf58b`
- `CORS_ORIGIN=https://your-frontend-domain.com` (update when frontend is deployed)
- `AI_SERVICE_URL=https://illuminate-ai-972867566883.us-central1.run.app`
- `OPENAI_API_KEY=your-openai-api-key-here`

### **AI Services Environment Variables:**
- `ENVIRONMENT=production`
- `OPENAI_API_KEY=your-openai-api-key-here`
- `DATABASE_URL=postgresql://illuminate:e843050527f45a81c81e81be60ae9830@/illuminate_db?host=/cloudsql/illuminate-472809:us-central1:illuminate-db`
- `CORS_ORIGINS=https://your-frontend-domain.com` (update when frontend is deployed)
- `BACKEND_API_URL=https://illuminate-backend-972867566883.us-central1.run.app`
- `BACKEND_API_KEY=illuminate-ai-service-2024`
- `JWT_SECRET=6c8d92b0dc7c6c75f09dbfc240d1273349c204d5318ed14fb8f1b0457babf58b`

This guide provides a comprehensive foundation for deploying iLLuMinate on Google Cloud. Adjust configurations based on your specific requirements and traffic patterns.
