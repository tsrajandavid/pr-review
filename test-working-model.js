const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testWorkingModel() {
  const apiKey = 'AIzaSyBFE_fhLOSPbfWrW9J3p4hH8FKRzJ8U-tE';
  
  console.log('🧪 Testing gemini-2.5-flash model...\n');
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });
    
    console.log('📡 Sending test request...');
    const result = await model.generateContent('Say "Hello! The Gemini API is working perfectly!" in one sentence.');
    const response = await result.response;
    const text = response.text();
    
    console.log('\n✅ SUCCESS!\n');
    console.log('📝 Gemini Response:');
    console.log(text);
    console.log('\n🎉 Your API key works with gemini-2.5-flash!');
    console.log('\n💡 The extension is now configured to use this model.');
    
  } catch (error) {
    console.log('\n❌ ERROR:', error.message);
  }
}

testWorkingModel();
