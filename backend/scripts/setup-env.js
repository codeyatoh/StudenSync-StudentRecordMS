const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

console.log('🔧 Setting up environment configuration...\n');

const questions = [
  {
    key: 'DB_HOST',
    question: 'Database Host (default: localhost): ',
    default: 'localhost'
  },
  {
    key: 'DB_PORT',
    question: 'Database Port (default: 3306): ',
    default: '3306'
  },
  {
    key: 'DB_USER',
    question: 'Database Username (default: root): ',
    default: 'root'
  },
  {
    key: 'DB_PASSWORD',
    question: 'Database Password: ',
    default: ''
  },
  {
    key: 'DB_NAME',
    question: 'Database Name (default: sis_data): ',
    default: 'sis_data'
  },
  {
    key: 'JWT_SECRET',
    question: 'JWT Secret (leave empty for auto-generated): ',
    default: ''
  }
];

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question.question, (answer) => {
      resolve(answer.trim() || question.default);
    });
  });
}

function generateJWTSecret() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function setupEnv() {
  try {
    // Check if .env already exists
    if (fs.existsSync(envPath)) {
      console.log('⚠️  .env file already exists!');
      const overwrite = await new Promise((resolve) => {
        rl.question('Do you want to overwrite it? (y/N): ', (answer) => {
          resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
        });
      });
      
      if (!overwrite) {
        console.log('❌ Setup cancelled.');
        rl.close();
        return;
      }
    }

    // Read .env.example as template
    let envContent = fs.readFileSync(envExamplePath, 'utf8');
    
    console.log('\nPlease provide the following information:\n');

    // Ask questions and replace values
    for (const question of questions) {
      let answer = await askQuestion(question);
      
      // Generate JWT secret if not provided
      if (question.key === 'JWT_SECRET' && !answer) {
        answer = generateJWTSecret();
        console.log('✅ Auto-generated JWT secret');
      }
      
      // Replace in env content
      const regex = new RegExp(`${question.key}=.*`, 'g');
      envContent = envContent.replace(regex, `${question.key}=${answer}`);
    }

    // Write .env file
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n✅ Environment file created successfully!');
    console.log('📁 Location:', envPath);
    console.log('\n🔒 Security Note: The .env file contains sensitive information and is excluded from git.');
    console.log('\n🚀 You can now run: npm run init-db');
    
  } catch (error) {
    console.error('❌ Error setting up environment:', error.message);
  } finally {
    rl.close();
  }
}

setupEnv();
