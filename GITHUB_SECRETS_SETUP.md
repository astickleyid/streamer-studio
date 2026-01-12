# GitHub Secrets Setup

To enable automatic deployments via GitHub Actions, you need to add the following secrets to your GitHub repository:

## Required Secrets

1. **VERCEL_TOKEN**
   - Go to https://vercel.com/account/tokens
   - Create a new token
   - Add it as `VERCEL_TOKEN` in GitHub secrets

2. **VERCEL_ORG_ID**
   - Value: `team_YeXUcvSknl2mbYldgH8A6ENH`

3. **VERCEL_PROJECT_ID**
   - Value: `prj_KqUeRVmkkIdfTYBdgjwZ7L8R5MAy`

4. **GEMINI_API_KEY**
   - Value: Already configured in your `.env` file
   - Add to GitHub secrets for CI/CD builds

## How to Add Secrets to GitHub

1. Go to your repository: https://github.com/astickleyid/streamer-studio
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add each secret listed above

## Verification

Once secrets are added, every push to the `main` branch will:
1. Run tests
2. Run TypeScript checks
3. Build the project
4. Deploy to Vercel automatically

Current production URL: https://streamer-studio.vercel.app
