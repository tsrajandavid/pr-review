const https = require('https');

async function checkAPIKeyStatus() {
  const apiKey = 'AIzaSyBFE_fhLOSPbfWrW9J3p4hH8FKRzJ8U-tE';
  
  console.log('🔍 Checking Gemini API Key Status...\n');
  
  // Try to list models using the REST API
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  https.get(url, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`📊 Status Code: ${res.statusCode}\n`);
      
      if (res.statusCode === 200) {
        const response = JSON.parse(data);
        console.log('✅ API Key is valid!\n');
        console.log('📋 Available models:\n');
        
        if (response.models && response.models.length > 0) {
          response.models.forEach(model => {
            console.log(`  - ${model.name}`);
            if (model.supportedGenerationMethods) {
              console.log(`    Methods: ${model.supportedGenerationMethods.join(', ')}`);
            }
          });
          
          console.log('\n💡 Use one of these model names in your extension!');
        } else {
          console.log('⚠️  No models available for this API key.');
          console.log('   You may need to enable the Generative Language API.');
        }
      } else if (res.statusCode === 403) {
        console.log('❌ API Key is invalid or doesn\'t have permission.');
        console.log('\n💡 Steps to fix:');
        console.log('   1. Go to: https://makersuite.google.com/app/apikey');
        console.log('   2. Create a new API key or verify the existing one');
        console.log('   3. Make sure "Generative Language API" is enabled');
      } else if (res.statusCode === 400) {
        console.log('❌ Bad request. API key format might be incorrect.');
      } else {
        console.log(`❌ Unexpected status: ${res.statusCode}`);
        console.log('Response:', data);
      }
    });
  }).on('error', (err) => {
    console.log('❌ Network error:', err.message);
  });
}

checkAPIKeyStatus();
