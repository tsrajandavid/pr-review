const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiAPI() {
  const apiKey = 'AIzaSyBFE_fhLOSPbfWrW9J3p4hH8FKRzJ8U-tE';
  
  console.log('🔍 Testing Gemini API Key...\n');
  
  try {
    // Initialize the client
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try to get the model
    console.log('📡 Connecting to Gemini API...');
    const model = genAI.getGenerativeModel({ model: 'models/gemini-pro' });
    
    // Send a simple test prompt
    console.log('💬 Sending test prompt...');
    const result = await model.generateContent('Say "Hello, API is working!" in one sentence.');
    const response = await result.response;
    const text = response.text();
    
    console.log('\n✅ SUCCESS! API Key is valid and working!\n');
    console.log('📝 Response from Gemini:');
    console.log(text);
    console.log('\n🎉 Your Gemini API key is configured correctly!');
    
  } catch (error) {
    console.log('\n❌ ERROR! API Key test failed.\n');
    console.log('Error details:');
    console.log(error.message);
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.log('\n💡 The API key appears to be invalid.');
      console.log('   Please check: https://makersuite.google.com/app/apikey');
    } else if (error.message.includes('404')) {
      console.log('\n💡 Model not found. This might be a quota or access issue.');
    } else if (error.message.includes('403')) {
      console.log('\n💡 Access denied. Check if the API key has proper permissions.');
    }
  }
}

testGeminiAPI();
