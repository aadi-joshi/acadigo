require('dotenv').config();

// Define required environment variables
const requiredVars = [
  'JWT_SECRET',
  'MONGODB_URI',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
];

// Define optional environment variables
const optionalVars = [
  'PORT',
  'NODE_ENV',
  'EMAIL_SERVICE',
  'EMAIL_USER',
  'EMAIL_PASS',
  'EMAIL_FROM',
  'FRONTEND_URL',
  'SUPABASE_BUCKET_NAME'
];

console.log('\n=== Environment Variables Check ===\n');

let missingRequired = false;

// Check required variables
console.log('Required Variables:');
requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    console.log(`❌ ${varName}: Missing`);
    missingRequired = true;
  } else {
    const value = process.env[varName];
    const displayValue = value.length > 10 ? `${value.substring(0, 5)}...${value.substring(value.length - 5)}` : value;
    console.log(`✅ ${varName}: ${displayValue}`);
  }
});

// Check optional variables
console.log('\nOptional Variables:');
optionalVars.forEach(varName => {
  if (!process.env[varName]) {
    console.log(`⚠️ ${varName}: Not set (uses default)`);
  } else {
    const value = process.env[varName];
    const displayValue = value.length > 10 ? `${value.substring(0, 5)}...${value.substring(value.length - 5)}` : value;
    console.log(`✅ ${varName}: ${displayValue}`);
  }
});

console.log('\n=== Summary ===');
if (missingRequired) {
  console.log('❌ Missing required variables. Please update your .env file.');
  console.log('   You can use .env.example as a template.');
} else {
  console.log('✅ All required variables are set.');
}

console.log('\n');
