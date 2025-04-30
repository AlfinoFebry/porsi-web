# Next.js Supabase Template

<div align="center">
  <img src="public/nextjs-thumbnail.png" alt="Next.js Supabase Template Preview" width="100%" />
</div>

Modern full-stack template with Next.js 14, Supabase, Tailwind CSS, and shadcn/ui. Perfect for building web applications quickly.

## Features

- **Next.js 14** - React framework
- **Supabase** - Auth and database made easy
- **shadcn/ui + Tailwind** - Beautiful, ready-to-use components
- **TypeScript** - Type safety for better code

## Before You Start

Create these free accounts (you'll need them):

1. [GitHub](https://github.com) - to store your code
2. [Vercel](https://vercel.com) - to make your site live (use GitHub to sign up)
3. [Supabase](https://supabase.com) - for your database (use GitHub to sign up)

## Step-by-Step Guide

### 1. Get Your Own Copy of the Template

1. Go to [github.com/juanmaramos/nextjs-supabase-template](https://github.com/juanmaramos/nextjs-supabase-template)
2. Click the green "Use this template" button
3. Click "Create a new repository"
4. Fill in:
   - Repository name (e.g., "my-website")
   - Description (optional)
   - Select "Public"
5. Click "Create repository"

### 2. Set Up Your Computer for Coding

1. Download and install these two programs:

   - [Cursor](https://cursor.sh) - This is where you'll write your code
   - [Node.js](https://nodejs.org) - Pick the "LTS" version

2. Open your project in Cursor:

   - Open Cursor
   - Click "Open a folder" (blue button in the center)
   - Go to your GitHub repository URL (created in step 1)
   - Click the green "Code" button
   - Copy the HTTPS URL (e.g., https://github.com/yourusername/my-website.git)
   - Open Terminal in Cursor (View > Terminal or Cmd+J/Ctrl+J)
   - Type:
     ```bash
     cd Documents/Projects  # or wherever you want your code
     git clone [paste your URL here]
     ```
   - Once cloned, click "Open a folder" again and select your new project folder

3. Get your project running:
   - In Cursor, press Cmd+J (Mac) or Ctrl+J (Windows) to open the terminal
   - Type these commands one by one:
     ```bash
     npm install
     npm run dev
     ```
   - Open your web browser to http://localhost:3000
   - You should see your website running locally!

### 3. Make Changes to Your Code

1. Edit files in Cursor
2. See your changes live at http://localhost:3000
3. Save your changes to GitHub:
   - Press Cmd+Shift+G (Mac) or Ctrl+Shift+G (Windows)
   - Type a message describing what you changed
   - Click "Commit"
   - Click "Sync" to save to GitHub

### 4. Add Your Database (Optional)

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. After creation, go to Project Settings > API
4. Copy these values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
5. Create a file named `.env.local` in your project
6. Paste the values into this file

### 5. Make Your Site Live

1. Go to [vercel.com/new](https://vercel.com/new)
2. Select your repository
3. If you added a database, under "Environment Variables", add your Supabase values
4. Click "Deploy"
5. Wait a few minutes - your site is going live!

## Project Structure

```
src/
├── app/          # Your pages live here
├── components/   # Reusable UI components
└── lib/         # Helper functions
```

## Adding Features

Add pre-built components:

```bash
npx shadcn@latest add button  # Example: adding a button component
```

## Need Help?

- Use Cursor's AI: Type `/` while coding or click the chat icon
- Check out the docs: [Next.js](https://nextjs.org/docs), [Supabase](https://supabase.com/docs), [shadcn/ui](https://ui.shadcn.com)
- Visit [cursor.sh/docs](https://cursor.sh/docs) to learn about Cursor features

---

Made by [Juan Ramos](https://www.juanmaramos.com) • MIT License
