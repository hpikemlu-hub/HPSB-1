# HPSB Workload Management System - Deployment Guide

This document provides instructions for deploying the HPSB Workload Management System to Netlify.

## Environment Variables

The following environment variables must be configured in your Netlify deployment settings:

### Required Variables
```
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NODE_ENV=production
```

### Netlify Build Settings
- Build command: `npm run deploy-prep && npm run build`
- Publish directory: `.next`

## User Provisioning

The system includes 22 user accounts that need to be provisioned in both the database and Supabase Auth:

### Admin Accounts
- `admin@kemlu.go.id` / `HPSB2025!`
- `test.admin.api@kemlu.go.id` / `HPSB2025!`

### Regular User Accounts
- `ajeng.widianty@kemlu.go.id` / `HPSB2025!`
- 19 additional user accounts with the same default password

## Deployment Steps

1. **Configure Environment Variables in Netlify Dashboard**
   - Go to your Netlify site settings
   - Navigate to "Build & Deploy" → "Environment"
   - Add the required environment variables listed above

2. **Set Build Command**
   - Go to "Build & Deploy" → "Builds"
   - Set build command to: `npm run deploy-prep && npm run build`
   - Set publish directory to: `.next`

3. **Trigger Deployment**
   - Push changes to your repository, or
   - Trigger a manual deploy from the Netlify dashboard

## Troubleshooting

### Login Issues
If users cannot log in after deployment:
1. Verify all environment variables are correctly set in Netlify
2. Check that the SUPABASE_SERVICE_ROLE_KEY has admin permissions
3. Ensure the user provisioning script ran successfully during build
4. Check browser console for CORS errors

### CORS Issues
The API routes are configured with appropriate CORS headers for the production domain `https://hpsb.netlify.app`.

### API Route Issues
Make sure the `@netlify/plugin-nextjs` is properly configured in your `netlify.toml`:

```toml
[[plugins]]
  package = "@netlify/plugin-nextjs"
```

## Post-Deployment Verification

After deployment, verify the following:

1. **API Routes**: Test the username resolution API:
   ```bash
   curl -X POST "https://your-site.netlify.app/api/auth/resolve-username/" \
        -H "Content-Type: application/json" \
        -d '{"username": "admin@kemlu.go.id"}'
   ```

2. **User Login**: Try logging in with the default credentials

3. **Environment Variables**: Ensure all required variables are available in the deployed environment

## Scripts

- `npm run deploy-prep`: Runs user provisioning before deployment
- `npm run provision-users`: Manually provision users (run this in your deployment environment)
- `npm run build`: Build the application for production

## Architecture

- **Frontend**: Next.js 16 with App Router
- **Backend**: Netlify Functions for API routes
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Hosting**: Netlify with server-side rendering

For support, check the build logs in Netlify and verify that the user provisioning script completed successfully.