# 🚀 Netlify Deployment Guide

## ✅ **Setup yang Sudah Selesai:**

1. **Build Configuration**: ✅ Fixed TypeScript errors
2. **Next.js Config**: ✅ Configured for Netlify
3. **Environment Variables**: ✅ Template ready
4. **Netlify Plugin**: ✅ @netlify/plugin-nextjs configured

---

## 🔧 **Steps untuk Deploy:**

### 1. **Push ke GitHub** (Already Done ✅)
```bash
# Semua file sudah di-push ke GitHub
git push origin master
```

### 2. **Connect ke Netlify**
1. Buka [netlify.com](https://netlify.com)
2. Login/Register
3. Click **"New site from Git"**
4. Pilih **GitHub** dan authorize
5. Pilih repository **`hpsb`**
6. Choose branch: **`master`**
7. Base directory: **`hpsb-fresh`**

### 3. **Build Settings**
```
Build command: npm run build
Publish directory: hpsb-fresh/.next
```

### 4. **Environment Variables** (IMPORTANT!)
Di Netlify Dashboard → Site settings → Environment variables, tambahkan:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NODE_VERSION=18
```

### 5. **Deploy!**
Click **"Deploy site"**

---

## 🔐 **Supabase Configuration**

1. **Get Supabase Credentials:**
   - Buka [supabase.com](https://supabase.com)
   - Go to your project → Settings → API
   - Copy:
     - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
     - `anon/public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY`

2. **Database Setup:**
   - Run semua SQL migrations di folder `database/`
   - Import data dari Excel files jika perlu

---

## 📁 **File Structure yang Sudah Ready:**

```
hpsb-fresh/
├── netlify.toml          ✅ Netlify configuration
├── _redirects            ✅ SPA routing rules
├── .env.example          ✅ Environment template
├── next.config.ts        ✅ Next.js config for Netlify
├── src/                  ✅ Application source
├── public/               ✅ Static assets
└── database/             ✅ SQL migrations
```

---

## 🎯 **Expected Result:**

- **Frontend**: Full React/Next.js app with dashboard, calendar, workload management
- **API Routes**: Functional backend API endpoints
- **Database**: Connected to Supabase PostgreSQL
- **Authentication**: User login system
- **Real-time**: Calendar and workload updates

---

## 🐛 **Troubleshooting:**

**If build fails:**
1. Check environment variables are set correctly
2. Verify Supabase credentials
3. Check build logs in Netlify dashboard

**If API doesn't work:**
1. Ensure all environment variables are set
2. Check Supabase RLS policies
3. Verify database schema is imported

---

## 📞 **Support:**
Jika ada masalah deployment, check:
1. Netlify build logs
2. Browser console untuk errors
3. Network tab untuk API calls

**Ready to deploy!** 🚀