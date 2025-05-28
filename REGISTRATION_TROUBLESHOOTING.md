# PortofolioSiswa Registration - Troubleshooting Guide

## 🚨 Known Issues and Fixes

### Issue 1: OCR Not Working (CORS Error)
**Problem:** `Access to fetch at 'https://api.porsi.me' has been blocked by CORS policy`

**Solution:** 
1. The OCR now uses a proxy API route at `/api/ocr` to avoid CORS issues
2. If you still see CORS errors, the proxy API route should handle it automatically
3. Users can always input scores manually as a fallback

**Test:**
- Upload an image in the registration form
- Check browser console for any remaining errors
- Verify the proxy API works by checking Network tab in DevTools

### Issue 2: Registration Submission Error
**Problem:** Empty error object `{}` when trying to submit registration

**Root Causes:**
1. **Database Schema Issues:** Tables might not exist or have wrong structure
2. **RLS Policy Issues:** Row Level Security might be blocking inserts
3. **Data Type Issues:** Incorrect data types being inserted

**Solutions:**

#### Step 1: Check Database Setup
Run both migration files in your Supabase SQL editor:

```sql
-- First run: supabase/migrations/001_initial_schema.sql
-- Then run: supabase/migrations/002_fix_schema.sql
```

#### Step 2: Verify Tables Exist
In Supabase dashboard, check that these tables exist:
- `profiles`
- `academic_records` 
- `additional_subjects`

#### Step 3: Check RLS Policies
In Supabase dashboard → Authentication → Policies, verify these policies exist:
- `Users can insert own profile` on `profiles`
- `Users can insert own academic records` on `academic_records`

#### Step 4: Test Database Access
In browser console, you should see detailed error logs:
- `Profile error: [error details]`
- `Academic records error: [error details]`

### Issue 3: Cookie Parse Error
**Problem:** `Failed to parse cookie string: SyntaxError: Unexpected token 'b'`

**Solution:**
1. Clear browser cookies for localhost:3000
2. This is usually caused by corrupted auth cookies
3. The error doesn't affect functionality but can be annoying

**Steps:**
```
1. Open DevTools (F12)
2. Go to Application/Storage tab
3. Click Cookies → http://localhost:3000
4. Delete all cookies
5. Refresh the page
```

### Issue 4: "Invalid Refresh Token" Error
**Problem:** `AuthApiError: Invalid Refresh Token: Refresh Token Not Found`

**Solution:**
1. This is a common Supabase auth issue
2. Clear browser storage and cookies
3. The error doesn't prevent registration from working

## 🔧 Debug Steps

### For Registration Submission Issues:

1. **Open Browser DevTools** (F12)
2. **Go to Console tab**
3. **Try to submit registration**
4. **Look for detailed error messages:**
   - Profile error: [specific error]
   - Academic records error: [specific error]

### Common Error Messages and Solutions:

#### "relation 'profiles' does not exist"
**Solution:** Run the database migration files in Supabase

#### "new row violates row-level security policy"
**Solution:** Check RLS policies are correctly set up

#### "column 'school_year' does not exist"
**Solution:** Run the second migration file (002_fix_schema.sql)

#### "duplicate key value violates unique constraint"
**Solution:** User might already be registered, check profiles table

## 🛠️ Manual Testing Steps

### Test Registration Flow:
1. **Navigate to `/register`**
2. **Step 1 - Auth:** Create new account or use Google
3. **Step 2 - User Type:** Select "Siswa SMA" or "Alumni"
4. **Step 3 - Biodata:** Fill all required fields
5. **Step 4 - Reports:** 
   - Test OCR upload (optional)
   - Input at least one score manually
   - Submit registration

### Verify Data Saved:
1. **Go to Supabase dashboard**
2. **Check Table Editor**
3. **Verify data in:**
   - `profiles` table: User biodata
   - `academic_records` table: Scores

## 🚀 Quick Fix Commands

### Reset Everything:
```bash
# Clear all browser data
1. Open DevTools → Application → Storage
2. Click "Clear site data"
3. Refresh page

# Or use browser settings:
1. Go to browser settings
2. Privacy & Security → Clear browsing data
3. Select "Cookies and other site data"
4. Clear data for localhost:3000
```

### Database Reset (if needed):
```sql
-- Run in Supabase SQL editor
DROP TABLE IF EXISTS academic_records CASCADE;
DROP TABLE IF EXISTS additional_subjects CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Then run both migration files again
```

## 📞 Getting Help

If issues persist:

1. **Check browser console** for specific error messages
2. **Check Supabase logs** in the dashboard
3. **Verify environment variables** in `.env.local`
4. **Test with a fresh browser** or incognito mode

### Required Environment Variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## ✅ Success Indicators

Registration is working correctly when:
- No console errors during submission
- User is redirected to `/dashboard` after completion
- Data appears in Supabase tables
- Toast notification shows "Registrasi berhasil!"

## 🔍 Debugging Checklist

- [ ] Database tables exist and have correct structure
- [ ] RLS policies are properly configured
- [ ] Environment variables are set correctly
- [ ] Browser cookies/storage are clear
- [ ] OCR proxy API is working (test at `/api/ocr`)
- [ ] Console shows specific error details (not just `{}`)
- [ ] User authentication is working (can create account)
- [ ] Form validation passes (all required fields filled) 