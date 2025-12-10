#!/bin/bash

# Simple script to launch extension in debug mode
# This bypasses the debugger selection dialog

echo "🚀 Launching PR Review Assistant Extension..."
echo ""

# Make sure extension is compiled
echo "📦 Compiling extension..."
npm run compile

if [ $? -eq 0 ]; then
    echo "✅ Compilation successful!"
    echo ""
    echo "🔧 Starting Extension Development Host..."
    echo ""
    echo "A new VS Code window will open with the extension loaded."
    echo "You can then test all the PR Review commands!"
    echo ""
    
    # Launch VS Code with extension development
    code --extensionDevelopmentPath="$(pwd)" .
else
    echo "❌ Compilation failed. Please fix errors and try again."
    exit 1
fi
