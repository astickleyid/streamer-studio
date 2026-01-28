#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ENV_FILE = path.join(__dirname, '..', '.env');
const ENV_EXAMPLE = path.join(__dirname, '..', '.env.example');

console.log('🔍 Checking environment configuration...\n');

// Check if .env exists
if (fs.existsSync(ENV_FILE)) {
  console.log('✅ .env file already exists');
  
  // Validate it has the API key
  const envContent = fs.readFileSync(ENV_FILE, 'utf-8');
  if (envContent.includes('GEMINI_API_KEY=') && !envContent.includes('GEMINI_API_KEY=your_api_key_here')) {
    console.log('✅ GEMINI_API_KEY appears to be configured');
  } else {
    console.log('⚠️  .env file exists but GEMINI_API_KEY may not be set');
    console.log('   Please edit .env and add your Gemini API key');
    console.log('   Get one at: https://aistudio.google.com/apikey');
  }
} else {
  // Create .env from example
  if (fs.existsSync(ENV_EXAMPLE)) {
    fs.copyFileSync(ENV_EXAMPLE, ENV_FILE);
    console.log('✅ Created .env from .env.example');
    console.log('⚠️  You need to add your GEMINI_API_KEY to the .env file');
    console.log('   Get one at: https://aistudio.google.com/apikey\n');
  } else {
    console.log('❌ .env.example file not found');
    process.exit(1);
  }
}

console.log('✨ Environment check complete!\n');
