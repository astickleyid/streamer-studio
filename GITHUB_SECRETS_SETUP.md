# GitHub Secrets Setup

To enable CI/CD pipeline via GitHub Actions, you need to add the following secret to your GitHub repository:

## Required Secret

**GEMINI_API_KEY**
- Value: Your Google Gemini API key (already configured in `.env`)
- This is needed for the build process in CI/CD

## How to Add Secret to GitHub

1. Go to your repository: https://github.com/astickleyid/streamer-studio
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add the secret listed above

## Already Configured ✅

The following are already set up:
- ✅ **VERCEL_ORG_ID** - Added to GitHub secrets
- ✅ **VERCEL_PROJECT_ID** - Added to GitHub secrets
- ✅ **GEMINI_API_KEY** - Added to GitHub secrets
- ✅ Vercel environment variables configured for all environments
- ✅ Vercel Git integration handles automatic deployments

## How It Works

### Vercel Automatic Deployment
Vercel's Git integration automatically deploys when you push to main:
- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and other branches

### GitHub Actions CI/CD
Every push and PR triggers:
1. ✅ Run tests (vitest)
2. ✅ Run TypeScript checks
3. ✅ Build the project
4. ✅ Vercel deploys automatically (via Git integration)

## URLs

- **Production**: https://streamer-studio.vercel.app
- **Dashboard**: https://vercel.com/lemxnaidhead-6918s-projects/streamer-studio
