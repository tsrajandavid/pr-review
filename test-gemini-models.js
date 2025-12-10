const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listAvailableModels() {
  const apiKey = 'AIzaSyBFE_fhLOSPbfWrW9J3p4hH8FKRzJ8U-tE';
  
  console.log('🔍 Listing available Gemini models...\n');
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try different model names
    const modelsToTry = [
      'gemini-pro',
      'models/gemini-pro',
      'gemini-1.5-pro',
      'models/gemini-1.5-pro',
      'gemini-1.5-flash',
      'models/gemini-1.5-flash'
    ];
    
    console.log('Testing different model names:\n');
    
    for (const modelName of modelsToTry) {
      try {
        console.log(`📡 Trying: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hi');
        const response = await result.response;
        const text = response.text();
        
        console.log(`✅ SUCCESS with model: ${modelName}`);
        console.log(`   Response: ${text.substring(0, 50)}...\n`);
        
        console.log(`\n🎉 Working model found: ${modelName}`);
        console.log(`\nUse this in your extension settings:`);
        console.log(`prReview.geminiModel = "${modelName}"`);
        break;
        
      } catch (error) {
        console.log(`❌ Failed: ${error.message.substring(0, 100)}...\n`);
      }
    }
    
  } catch (error) {
    console.log('\n❌ ERROR!');
    console.log(error.message);
  }
}

listAvailableModels();
