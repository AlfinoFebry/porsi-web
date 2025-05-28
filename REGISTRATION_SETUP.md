# PortofolioSiswa Registration System Setup

This guide explains how to set up and use the new multi-step registration system for PortofolioSiswa.

## Features

The registration system includes:

1. **Multi-step Registration Flow**
   - Account creation (email/password or Google OAuth)
   - User type selection (Siswa SMA or Alumni)
   - Biodata form (personal information)
   - Academic report input with OCR support

2. **Responsive Design**
   - Works perfectly on both light and dark themes
   - Mobile-friendly interface
   - Clean, modern UI following the website's design language

3. **Smart Subject Selection**
   - Automatic subject selection based on student's major (IPA/IPS)
   - Option to add subjects from other majors
   - Different semester requirements based on current class

4. **OCR Integration**
   - Upload student report photos for automatic score extraction
   - Uses the existing https://api.porsi.me OCR API
   - Manual input option available

## Setup Instructions

### 1. Database Setup

First, you need to run the database migration to create the required tables:

```sql
-- Run this in your Supabase SQL editor
-- File: supabase/migrations/001_initial_schema.sql
```

This creates:
- `profiles` table for user biodata
- `academic_records` table for student scores
- `additional_subjects` table for cross-major subjects
- Proper RLS policies for data security

### 2. Environment Variables

Make sure you have these environment variables set up in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Google OAuth Setup (Optional)

To enable Google authentication:

1. Go to Google Cloud Console
2. Create OAuth credentials
3. Add to your Supabase project under Authentication > Settings > Auth Providers
4. Enable Google provider in Supabase

### 4. Installation

Install required dependencies:

```bash
npm install lucide-react
```

## Usage

### Accessing the Registration

Users can access the registration at `/register` or be redirected from the sign-up page.

### Registration Flow

1. **Account Creation**
   - Users can register with email/password
   - Or use Google OAuth for faster signup
   - Email verification may be required based on Supabase settings

2. **User Type Selection**
   - Choose between "Siswa SMA" (current high school student) or "Alumni"
   - This determines which form fields appear in the next steps

3. **Biodata Form**
   - Basic information: name, date of birth, gender
   - For Siswa SMA: school name, major (IPA/IPS), class (10/11/12)
   - For Alumni: university name, SMA graduation year, university entry year, college major

4. **Academic Records**
   - Subjects are automatically selected based on major
   - Class 10 students only input semester 1 scores
   - Class 11/12 and alumni input semesters 1-4
   - Option to add subjects from other majors
   - OCR support for automatic score extraction from report photos

### Subject Categories

**Mandatory Subjects (All Students):**
- Pendidikan Agama dan Budi Pekerti
- PPKn (Pendidikan Pancasila dan Kewarganegaraan)
- Bahasa Indonesia
- Matematika Wajib
- Sejarah Indonesia
- Bahasa Inggris
- PJOK (Pendidikan Jasmani, Olahraga, dan Kesehatan)
- Prakarya/Seni Budaya

**IPA Major Subjects:**
- Matematika Peminatan
- Fisika
- Kimia
- Biologi

**IPS Major Subjects:**
- Geografi
- Sejarah
- Sosiologi
- Ekonomi

## Technical Details

### Theme Support

The registration system fully supports both light and dark themes:

- Uses CSS variables from the global theme system
- All components adapt to theme changes
- Proper contrast ratios maintained in both modes
- Smooth transitions between themes

### Database Schema

**Profiles Table:**
```sql
- id (UUID, references auth.users)
- email, name, date_of_birth, gender
- user_type ('siswa' | 'alumni')
- nama_sekolah, jurusan, class (for students)
- nama_perguruan_tinggi, tahun_lulus_sma, tahun_masuk_kuliah, jurusan_kuliah (for alumni)
```

**Academic Records Table:**
```sql
- user_id, subject, semester (1-4), score (0-100)
- Unique constraint on (user_id, subject, semester)
```

### Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Proper authentication checks throughout the flow
- Input validation and sanitization

## Troubleshooting

### Common Issues

1. **OCR API Errors**
   - Check if https://api.porsi.me is accessible
   - Verify image format is supported
   - Try smaller image files if upload fails

2. **Database Connection Issues**
   - Verify Supabase environment variables
   - Check if migration was run successfully
   - Ensure RLS policies are properly set

3. **Theme Issues**
   - Make sure the ThemeProvider is properly configured in layout.tsx
   - Check CSS variable definitions in globals.css

### Development

To test the registration flow in development:

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000/register`
3. Test with different user types and scenarios
4. Check the Supabase dashboard to verify data is being saved correctly

## Future Enhancements

Potential improvements for the registration system:

1. **Enhanced OCR**
   - Better parsing of OCR results
   - Automatic score mapping to subjects
   - Multiple image upload support

2. **Data Import/Export**
   - CSV import for bulk score entry
   - PDF report generation
   - Data backup functionality

3. **Validation**
   - Real-time validation
   - Better error messages
   - Progress saving (draft functionality)

4. **Analytics**
   - Registration completion rates
   - Common drop-off points
   - User behavior tracking 