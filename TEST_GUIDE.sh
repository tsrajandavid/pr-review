#!/bin/bash

# PR Auto Review Assistant - Quick Test Guide

echo "🚀 PR Auto Review Assistant - Testing Guide"
echo "==========================================="
echo ""
echo "To test the extension:"
echo ""
echo "1. Press F5 in VS Code to launch Extension Development Host"
echo "   (or use Debug > Start Debugging)"
echo ""
echo "2. In the new window, open a Git repository"
echo ""
echo "3. Configure the extension:"
echo "   - Open Settings (Ctrl+,)"
echo "   - Search for 'PR Review'"
echo "   - Set your AI provider and API key"
echo "   - Set your base branch (e.g., 'main', 'development')"
echo ""
echo "4. Test the commands:"
echo "   - Open Command Palette (Ctrl+Shift+P)"
echo "   - Try: 'PR Review: Run AI Review on Current Branch'"
echo "   - Try: 'PR Review: Generate PR Description'"
echo "   - Try: 'PR Review: Show Pre-PR Checklist'"
echo ""
echo "5. Or use keyboard shortcut:"
echo "   - Press Ctrl+Shift+R to run review"
echo ""
echo "📝 Configuration Example:"
echo "{"
echo '  "prReview.aiProvider": "openai",'
echo '  "prReview.apiKey": "your-api-key-here",'
echo '  "prReview.baseBranch": "development"'
echo "}"
echo ""
echo "✅ Extension compiled successfully!"
echo "📦 To package: npm run package"
echo ""
