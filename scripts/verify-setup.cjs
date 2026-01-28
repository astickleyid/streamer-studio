#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Verifying streamer-studio setup...\n');

let hasErrors = false;

// Check Node version
console.log('📦 Checking Node.js version...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
if (majorVersion >= 18) {
  console.log(`✅ Node.js ${nodeVersion} (>= 18 required)\n`);
} else {
  console.log(`❌ Node.js ${nodeVersion} is too old (>= 18 required)\n`);
  hasErrors = true;
}

// Check if .env exists
console.log('🔧 Checking environment configuration...');
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file exists');
  
  // Check if API key is set
  const envContent = fs.readFileSync(envPath, 'utf-8');
  if (envContent.includes('GEMINI_API_KEY=') && !envContent.includes('GEMINI_API_KEY=your_api_key_here')) {
    console.log('✅ GEMINI_API_KEY is configured\n');
  } else {
    console.log('⚠️  GEMINI_API_KEY not set in .env file');
    console.log('   Get one at: https://aistudio.google.com/apikey\n');
  }
} else {
  console.log('❌ .env file not found');
  console.log('   Run: npm run setup\n');
  hasErrors = true;
}

// Check if node_modules exists
console.log('📚 Checking dependencies...');
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('✅ Dependencies installed\n');
} else {
  console.log('❌ Dependencies not installed');
  console.log('   Run: npm install\n');
  hasErrors = true;
}

// Try to build
if (!hasErrors) {
  console.log('🏗️  Testing build...');
  try {
    execSync('npm run build', { 
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe'
    });
    console.log('✅ Build successful\n');
  } catch (error) {
    console.log('❌ Build failed');
    console.log('   Run: npm run build (for details)\n');
    hasErrors = true;
  }

  // Try to run tests
  console.log('🧪 Running tests...');
  try {
    execSync('npm test -- --run', { 
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe'
    });
    console.log('✅ All tests passed\n');
  } catch (error) {
    console.log('❌ Tests failed');
    console.log('   Run: npm test (for details)\n');
    hasErrors = true;
  }

  // TypeScript check
  console.log('📝 Checking TypeScript...');
  try {
    execSync('npx tsc --noEmit', { 
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe'
    });
    console.log('✅ No TypeScript errors\n');
  } catch (error) {
    console.log('❌ TypeScript errors found');
    console.log('   Run: npx tsc --noEmit (for details)\n');
    hasErrors = true;
  }
}

// Final summary
console.log('═══════════════════════════════════════\n');
if (hasErrors) {
  console.log('❌ Setup verification failed');
  console.log('   Please fix the errors above\n');
  process.exit(1);
} else {
  console.log('✅ All checks passed!');
  console.log('🚀 Ready to run: npm run dev\n');
  process.exit(0);
}
