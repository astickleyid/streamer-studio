# Debugging Guide for nXcor Streamer Studio

This guide helps you debug common issues in the Streamer Studio application.

---

## 🔧 Quick Diagnostics

### Run Full Health Check
```bash
# Install dependencies
npm install

# Run tests
npm test

# Check TypeScript
npx tsc --noEmit

# Build project
npm run build

# Start dev server
npm run dev
```

If all of these succeed, your local setup is healthy! ✅

---

## 🐛 Common Issues & Solutions

### Issue 1: "Camera or Microphone access denied"

**Symptoms**:
- Red error banner appears when trying to use camera
- Stream preview shows black screen

**Causes**:
- Browser permissions not granted
- Running on non-HTTPS connection (except localhost)
- Privacy settings blocking camera/mic access

**Solutions**:
1. Check browser URL bar for blocked permissions icon
2. Click the icon and allow camera/microphone access
3. Reload the page
4. If using a custom domain, ensure it's served over HTTPS
5. On localhost, this should work without HTTPS

**Test**:
```javascript
// Open browser console and run:
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(() => console.log("✅ Permissions granted"))
  .catch(err => console.error("❌ Permission denied:", err))
```

---

### Issue 2: "Screen sharing not supported"

**Symptoms**:
- Cannot enable screen capture
- Error: "Screen sharing is not supported by your browser"

**Causes**:
- Browser doesn't support `getDisplayMedia`
- Running on non-secure context (HTTP instead of HTTPS)
- Old browser version

**Solutions**:
1. Update to latest Chrome, Firefox, or Edge
2. Ensure you're on HTTPS (or localhost)
3. Check browser compatibility: https://caniuse.com/mdn-api_mediadevices_getdisplaymedia

**Supported Browsers**:
- ✅ Chrome 72+
- ✅ Firefox 66+
- ✅ Edge 79+
- ✅ Safari 13+

---

### Issue 3: "AI Assistant not responding"

**Symptoms**:
- AI suggestions show "Error connecting to AI Assistant"
- Analytics page shows "Analyzing stream patterns..." indefinitely

**Causes**:
- Missing or invalid `GEMINI_API_KEY`
- API rate limit exceeded
- Network connectivity issues

**Solutions**:

1. **Check if .env file exists**:
```bash
ls -la .env
# If not found, create it:
cp .env.example .env
```

2. **Add your Gemini API key**:
```bash
# Edit .env and add:
GEMINI_API_KEY=your_actual_api_key_here
```

3. **Get an API key**:
   - Visit https://aistudio.google.com/apikey
   - Create a new API key
   - Copy it to your .env file

4. **Restart the dev server**:
```bash
# Stop current server (Ctrl+C)
npm run dev
```

5. **Test the API key** (optional):
```bash
# Check if env variable is loaded (requires dotenv package)
# npm install dotenv --save-dev  # Install if needed
node -e "require('dotenv').config(); console.log(process.env.GEMINI_API_KEY ? '✅ Key loaded' : '❌ Key missing')"
```

Note: Vite loads .env automatically during dev, so this test is optional.

**Rate Limits**:
- Gemini Flash: 15 requests per minute (free tier)
- If you hit limits, wait 60 seconds and try again

---

### Issue 4: "Build fails with module errors"

**Symptoms**:
- `npm run build` fails
- Module not found errors

**Causes**:
- Corrupted node_modules
- Package version conflicts
- Missing dependencies

**Solutions**:

1. **Clean install**:
```bash
# Remove node_modules and lock file
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

2. **Check Node.js version**:
```bash
node --version
# Should be v18 or higher
```

3. **Update npm**:
```bash
npm install -g npm@latest
```

4. **Clear npm cache**:
```bash
npm cache clean --force
npm install
```

---

### Issue 5: "Tests failing"

**Symptoms**:
- `npm test` shows failures
- Test errors in CI/CD

**Solutions**:

1. **Run tests in watch mode**:
```bash
npm run test:watch
```

2. **Check test output carefully**:
```bash
npm test -- --reporter=verbose
```

3. **Verify test environment**:
```bash
# Tests should pass in clean environment
rm -rf node_modules
npm install
npm test
```

4. **Check for test conflicts**:
- Ensure no other tests are running
- Clear any mock data or cached state

---

### Issue 6: "Twitch embed not loading"

**Symptoms**:
- Twitch player shows black screen
- Error about "refused to connect"

**Causes**:
- Missing parent domain in URL
- Incorrect channel name
- Twitch API issues

**Solutions**:

1. **Check parent parameter**:
The code automatically adds parent domains, but verify in browser console:
```javascript
// Should see parent= in the iframe src
document.querySelector('iframe[src*="twitch"]')?.src
```

2. **Test with a known live channel**:
- Try "shroud" or "ninja" or any popular streamer
- If it works with known channels, the issue is the specific channel

3. **Check Twitch developer console**:
- Open browser DevTools → Console
- Look for Twitch-specific errors

---

### Issue 7: "TypeScript errors in editor"

**Symptoms**:
- Red squiggly lines in VSCode/IDE
- Type errors that don't fail the build

**Solutions**:

1. **Restart TypeScript server** (VSCode):
   - Cmd/Ctrl + Shift + P
   - Type "TypeScript: Restart TS Server"
   - Press Enter

2. **Check TypeScript version**:
```bash
npx tsc --version
# Should match package.json: ~5.8.2
```

3. **Regenerate types**:
```bash
rm -rf node_modules/@types
npm install
```

4. **Verify tsconfig.json is valid**:
```bash
npx tsc --noEmit
```

---

## 🔍 Advanced Debugging

### Enable Verbose Logging

Add this to your browser console to see detailed logs:
```javascript
// Enable verbose media device logging
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => {
    console.log("Stream tracks:", stream.getTracks().map(t => ({
      kind: t.kind,
      label: t.label,
      enabled: t.enabled,
      readyState: t.readyState
    })));
  })
  .catch(err => console.error("Media error:", err.name, err.message));
```

### Check Global Stream State

In browser console:
```javascript
// See current stream state (if using React DevTools)
// Or add temporary logging in App.tsx:
console.log("Stream State:", streamState);
```

### Monitor Network Requests

1. Open DevTools → Network tab
2. Filter by "XHR" or "Fetch"
3. Look for failed API calls to Gemini
4. Check response status and error messages

### Test Individual Components

Create a test file:
```typescript
// test/debug.test.tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Analytics from '../components/Analytics';

describe('Debug Component', () => {
  it('renders Analytics', () => {
    const { container } = render(<Analytics />);
    expect(container).toBeTruthy();
  });
});
```

Run specific test:
```bash
npx vitest run test/debug.test.tsx
```

---

## 🌐 Browser-Specific Issues

### Chrome/Edge
- **Issue**: Camera flickers
- **Solution**: Disable hardware acceleration in Settings

### Firefox
- **Issue**: Screen share preview not showing
- **Solution**: Update to latest version (66+)

### Safari
- **Issue**: WebRTC features limited
- **Solution**: Enable "WebRTC" in Develop menu

---

## 📊 Performance Debugging

### Check Bundle Size
```bash
npm run build -- --analyze
```

### Memory Leaks
```javascript
// Add this to useEffect cleanup
useEffect(() => {
  return () => {
    // Clean up streams
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };
}, []);
```

### CPU Usage
- Open DevTools → Performance tab
- Record a profile while using the app
- Look for long-running tasks

---

## 🆘 Getting Help

### Before Asking for Help
1. ✅ Check this debugging guide
2. ✅ Read error messages completely
3. ✅ Check browser console for errors
4. ✅ Verify all prerequisites are met
5. ✅ Try in a different browser
6. ✅ Clear cache and restart

### When Reporting Issues
Include:
- Operating system and version
- Browser and version
- Node.js version (`node --version`)
- npm version (`npm --version`)
- Full error message and stack trace
- Steps to reproduce
- Screenshots if relevant

### Resources
- GitHub Issues: https://github.com/astickleyid/streamer-studio/issues
- React DevTools: https://react.dev/learn/react-developer-tools
- Vite Docs: https://vitejs.dev/guide/troubleshooting
- Gemini API Docs: https://ai.google.dev/docs

---

## 🧪 Testing Your Setup

Run this comprehensive test:
```bash
#!/bin/bash
echo "🔍 Running comprehensive diagnostics..."

echo "\n📦 Node.js version:"
node --version

echo "\n📦 npm version:"
npm --version

echo "\n🔧 Installing dependencies..."
npm install

echo "\n✅ Running tests..."
npm test

echo "\n🔎 TypeScript check..."
npx tsc --noEmit

echo "\n🏗️  Building..."
npm run build

echo "\n🔒 Security audit..."
npm audit

echo "\n✨ All checks complete!"
```

Save as `diagnose.sh`, make executable with `chmod +x diagnose.sh`, and run with `./diagnose.sh`

---

## 🎯 Quick Reference

| Problem | Quick Fix |
|---------|-----------|
| Camera blocked | Check permissions icon in URL bar |
| AI not working | Create .env with GEMINI_API_KEY |
| Build fails | `rm -rf node_modules && npm install` |
| Tests fail | `npm test -- --reporter=verbose` |
| Twitch won't load | Try with known live channel |
| TypeScript errors | Restart TS server in IDE |
| Dev server crashes | Check port 3000 isn't in use |
| Deployment fails | Add GitHub secrets (see STATUS_REPORT.md) |

---

**Remember**: Most issues are related to permissions, environment variables, or dependencies. Start with the basics before diving deep!
