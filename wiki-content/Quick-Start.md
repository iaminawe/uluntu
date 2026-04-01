# Quick Start Guide

Get the Nelson Tech Community Platform running locally in 5 minutes!

---

## Prerequisites

Before you begin, ensure you have:

- ✅ **Node.js 18+** - [Download here](https://nodejs.org/)
- ✅ **Git** - [Download here](https://git-scm.com/)
- ✅ **Supabase Account** - [Sign up here](https://supabase.com/)

**Optional but recommended:**
- npm or yarn (comes with Node.js)
- VS Code or your preferred editor

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/iaminawe/nelson-tech.git
cd nelson-tech
```

---

## Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages (~2-3 minutes).

---

## Step 3: Set Up Environment Variables

### Create Environment File

```bash
cp .env.example .env
```

### Configure Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project (or use existing)
3. Go to **Settings** → **API**
4. Copy your credentials

### Edit `.env` File

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_USE_SUPABASE=true

# Optional: AI Features (can skip for now)
# VITE_OPENAI_API_KEY=your-openai-key
# VITE_ENABLE_AI=true
```

**Important**: Replace `your-project` and `your-anon-key-here` with your actual values.

---

## Step 4: Set Up Database

### Option A: Quick Setup (Recommended)

```bash
npm run db:reset
```

This will:
- Apply all migrations
- Set up Row Level Security (RLS)
- Create initial data

### Option B: Manual Setup

1. Go to Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run migration files from `/supabase/migrations/` in order

---

## Step 5: Start Development Server

```bash
npm run dev
```

The application will open at: **http://localhost:5555**

---

## Step 6: Create Your First Account

1. Navigate to **http://localhost:5555**
2. Click **Sign Up**
3. Enter your email and password
4. Check your email for verification link
5. Complete the onboarding wizard

**Default Roles:**
- First user is automatically assigned admin role
- Subsequent users start as authenticated members

---

## ✅ Verification

Verify everything is working:

```bash
# Run type checking
npm run typecheck

# Run tests
npm test

# Build for production
npm run build
```

All should pass without errors.

---

## 🎉 You're Ready!

Your development environment is set up. Here's what to explore next:

### Learn the Codebase
1. Read [CLAUDE.md](../CLAUDE.md) - Development patterns ⭐
2. Review [Project Structure](https://iaminawe.github.io/nelson-tech/architecture/PROJECT_STRUCTURE/)
3. Explore [Hybrid State Management](https://iaminawe.github.io/nelson-tech/architecture/HYBRID_STATE_MANAGEMENT/)

### Try Key Features
- **Create a Group** - Test group management
- **Upload to Gallery** - Try batch photo upload
- **Send a Message** - Test real-time messaging
- **Customize Theme** - Admin → Appearance → Theme Manager

### Development Workflow
```bash
npm run dev          # Start dev server
npm test             # Run tests
npm run lint         # Check code style
npm run typecheck    # TypeScript validation
```

---

## 🔧 Common Issues

### Port Already in Use
```bash
# Kill process on port 5555
npx kill-port 5555
npm run dev
```

### Database Connection Error
- Verify your Supabase URL and anon key in `.env`
- Check that your Supabase project is running
- Ensure `VITE_USE_SUPABASE=true`

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Email Verification Not Working
- Check Supabase email templates (Settings → Auth → Email Templates)
- For development, you can disable email verification in Supabase settings

---

## 📚 Next Steps

### Developer Resources
- **[Development Guide](https://iaminawe.github.io/nelson-tech/guides/feature-development/)** - Building features
- **[Component Library](https://iaminawe.github.io/nelson-tech/components/)** - UI components
- **[API Structure](https://iaminawe.github.io/nelson-tech/guides/API_STRUCTURE/)** - API patterns

### Feature Documentation
- **[Gallery System](https://iaminawe.github.io/nelson-tech/features/gallery/)** - Photo galleries
- **[Groups](https://iaminawe.github.io/nelson-tech/features/groups/)** - Community groups
- **[Admin Features](https://iaminawe.github.io/nelson-tech/features/admin/)** - Admin tools

### Community
- Read [Contributing Guide](../CONTRIBUTING.md)
- Check [Community Guide](Community-Guide)
- Explore [FAQ](FAQ)

---

## 🆘 Need Help?

- **[FAQ](FAQ)** - Common questions
- **[Troubleshooting](Troubleshooting)** - Solve problems
- **GitHub Issues** - Report bugs
- **GitHub Discussions** - Ask questions

---

**Previous**: [Home](Home) | **Next**: [Development Tips](Development-Tips)
