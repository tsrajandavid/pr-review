#!/bin/bash

# Quick Test Repository Setup for PR Review Assistant
# This creates a test repo with proper branch structure

TEST_DIR="/tmp/pr-review-test-repo"

echo "🚀 Creating test repository for PR Review Assistant..."
echo ""

# Clean up if exists
rm -rf "$TEST_DIR"

# Create test repo
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

# Initialize Git
git init
git config user.name "Test User"
git config user.email "test@example.com"

# Create development branch (base branch)
git checkout -b development

# Add initial files
cat > README.md << 'EOF'
# Test Project for PR Review

This is a test repository for testing the PR Auto Review Assistant extension.
EOF

cat > app.js << 'EOF'
// Simple application
function greet(name) {
  console.log("Hello, " + name);
}

greet("World");
EOF

cat > package.json << 'EOF'
{
  "name": "test-project",
  "version": "1.0.0",
  "description": "Test project for PR review",
  "main": "app.js",
  "scripts": {
    "start": "node app.js"
  }
}
EOF

# Commit initial files
git add .
git commit -m "Initial commit"

echo "✅ Created development branch with initial files"
echo ""

# Create feature branch with changes
git checkout -b feature/add-user-greeting

# Make some changes
cat > app.js << 'EOF'
// Simple application with user greeting
function greet(name) {
  const greeting = `Hello, ${name}!`;
  console.log(greeting);
  return greeting;
}

function greetUser(user) {
  if (!user || !user.name) {
    throw new Error("User object must have a name property");
  }
  return greet(user.name);
}

// Main execution
const user = { name: "World" };
greetUser(user);

module.exports = { greet, greetUser };
EOF

cat > utils.js << 'EOF'
// Utility functions
function validateUser(user) {
  return user && typeof user.name === 'string' && user.name.length > 0;
}

function formatGreeting(name) {
  return `Hello, ${name}!`;
}

module.exports = { validateUser, formatGreeting };
EOF

# Update package.json
cat > package.json << 'EOF'
{
  "name": "test-project",
  "version": "1.1.0",
  "description": "Test project for PR review with user greeting",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "test": "echo 'No tests yet'"
  },
  "keywords": ["greeting", "demo"],
  "author": "Test User"
}
EOF

# Commit changes
git add .
git commit -m "Add user greeting functionality

- Refactored greet function to use template literals
- Added greetUser function with validation
- Created utils.js with helper functions
- Updated package.json with new version and metadata"

echo "✅ Created feature/add-user-greeting branch with changes"
echo ""
echo "📁 Test repository created at: $TEST_DIR"
echo ""
echo "🎯 Next steps:"
echo "1. Open this folder in the Extension Development Host window:"
echo "   File > Open Folder > $TEST_DIR"
echo ""
echo "2. Configure PR Review settings:"
echo "   - Press Ctrl+,"
echo "   - Search 'PR Review'"
echo "   - Set your API key"
echo "   - Base branch is already 'development'"
echo ""
echo "3. Run PR Review:"
echo "   - Press Ctrl+Shift+P"
echo "   - Type 'PR Review: Run AI Review'"
echo "   - Or press Ctrl+Shift+R"
echo ""
echo "✨ The extension will analyze the changes between feature/add-user-greeting and development!"
