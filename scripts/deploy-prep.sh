#!/bin/bash
# Deployment preparation script for Netlify

echo "🚀 Starting deployment preparation for HPSB Workload Management System..."

# Source environment variables from .env.local if it exists
if [ -f .env.local ]; then
    echo "🔧 Loading environment variables from .env.local..."
    export $(grep -v '^#' .env.local | xargs)
else
    echo "❌ .env.local file not found!"
    exit 1
fi

# Check if environment variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: Missing required environment variables"
    echo "Please set:"
    echo "  - NEXT_PUBLIC_SUPABASE_URL"
    echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "  - SUPABASE_SERVICE_ROLE_KEY"
    exit 1
fi

echo "✅ Environment variables are set"

# Run the user provisioning script to ensure all users exist in both database and Supabase Auth
echo "👥 Provisioning users..."
node scripts/provision-users.js

if [ $? -eq 0 ]; then
    echo "✅ User provisioning completed successfully"
else
    echo "⚠️  User provisioning had errors, but continuing deployment"
fi

echo "✅ Deployment preparation completed!"