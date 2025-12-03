#!/bin/bash
# Deployment preparation script for Netlify

echo "🚀 Starting deployment preparation for HPSB Workload Management System..."

# Check if environment variables are set (they should be available from Netlify dashboard)
if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ] && [ -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ] && [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "✅ Environment variables are set from Netlify dashboard"
else
    # Only check for .env.local in development environments if environment variables are not already set
    if [ -f .env.local ]; then
        echo "🔧 Loading environment variables from .env.local..."
        export $(grep -v '^#' .env.local | xargs)

        # Check again if the required variables are now available
        if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
            echo "❌ Error: Required environment variables not found in .env.local"
            echo "Please ensure .env.local contains:"
            echo "  - NEXT_PUBLIC_SUPABASE_URL"
            echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
            echo "  - SUPABASE_SERVICE_ROLE_KEY"
            exit 1
        fi
    else
        echo "❌ Error: Missing required environment variables"
        echo "In production (Netlify), ensure these are set in your Netlify dashboard:"
        echo "  - NEXT_PUBLIC_SUPABASE_URL"
        echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
        echo "  - SUPABASE_SERVICE_ROLE_KEY"
        echo ""
        echo "For local development, ensure .env.local exists with these variables."
        exit 1
    fi
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