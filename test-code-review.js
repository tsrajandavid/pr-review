const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testCodeReview() {
  const apiKey = 'AIzaSyBFE_fhLOSPbfWrW9J3p4hH8FKRzJ8U-tE';
  
  console.log('🧪 Testing Gemini Code Review with actual prompt...\n');
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });
    
    // Simulate the actual review prompt
    const systemPrompt = `You are an expert code reviewer. Analyze the code changes and provide feedback in the following JSON format:

{
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "summary": "Brief summary of changes",
  "blockingIssues": [
    {
      "file": "filename",
      "line": 1,
      "description": "Issue description",
      "suggestedFix": "How to fix"
    }
  ],
  "suggestions": [],
  "notes": []
}`;

    const codeChanges = `
File: utils.js
+function validateUser(user) {
+  return user && typeof user.name === 'string' && user.name.length > 0;
+}
`;

    const fullPrompt = `${systemPrompt}

IMPORTANT: You MUST respond with ONLY valid JSON. Do not include any explanatory text, markdown formatting, or code blocks. Return ONLY the raw JSON object.

Review these code changes:
${codeChanges}

Remember: Return ONLY the JSON object, nothing else.`;

    console.log('📡 Sending review request to Gemini...\n');
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    let text = response.text();
    
    console.log('📝 Raw Response from Gemini:');
    console.log('---START---');
    console.log(text);
    console.log('---END---\n');
    
    // Try to clean it up
    let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    console.log('🧹 Cleaned Response:');
    console.log('---START---');
    console.log(cleaned);
    console.log('---END---\n');
    
    // Try to parse it
    try {
      const parsed = JSON.parse(cleaned);
      console.log('✅ Successfully parsed JSON!');
      console.log('Risk Level:', parsed.riskLevel);
      console.log('Summary:', parsed.summary);
    } catch (parseError) {
      console.log('❌ Failed to parse JSON:');
      console.log(parseError.message);
      console.log('\n💡 The response needs more cleaning or different prompt formatting.');
    }
    
  } catch (error) {
    console.log('\n❌ ERROR:', error.message);
  }
}

testCodeReview();
