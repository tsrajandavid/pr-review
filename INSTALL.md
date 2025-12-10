# PR Auto Review Assistant - Installation Guide

## ✅ Extension Package Created!

**File**: `pr-review-assistant-0.1.0.vsix`
**Size**: 32.44 KB
**Files**: 20 files included
**Location**: `/home/david/workspace/poc/vscode/pr-review-assistant/`

## 📦 What's Included

- All compiled JavaScript code (`out/` directory)
- Extension manifest (`package.json`)
- Documentation (README, guides)
- All extension features:
  - AI-powered code review
  - PR description generator
  - Pre-PR checklist
  - Inline annotations
  - Results webview
  - Support for OpenAI, Anthropic, Azure OpenAI, and **Google Gemini**

## 🚀 How to Install

### Method 1: Install from VSIX (Recommended)

1. **Open VS Code**
2. **Press `Ctrl+Shift+X`** to open Extensions view
3. **Click the "..." menu** (three dots) at the top of the Extensions panel
4. **Select "Install from VSIX..."**
5. **Navigate to**: `/home/david/workspace/poc/vscode/pr-review-assistant/`
6. **Select**: `pr-review-assistant-0.1.0.vsix`
7. **Click "Install"**
8. **Reload VS Code** when prompted

### Method 2: Command Line Installation

```bash
code --install-extension /home/david/workspace/poc/vscode/pr-review-assistant/pr-review-assistant-0.1.0.vsix
```

## ⚙️ Configuration

After installation, configure the extension:

1. **Open Settings** (`Ctrl+,`)
2. **Search for "PR Review"**
3. **Configure**:
   - `prReview.aiProvider`: Choose "gemini", "openai", or "anthropic"
   - `prReview.apiKey`: Your API key
   - `prReview.baseBranch`: Your base branch (e.g., "main", "development")

### For Gemini:

```json
{
  "prReview.aiProvider": "gemini",
  "prReview.apiKey": "YOUR_GEMINI_API_KEY",
  "prReview.baseBranch": "development",
  "prReview.geminiModel": "gemini-1.5-pro"
}
```

**Get Gemini API Key**: https://makersuite.google.com/app/apikey

### Using Environment Variables (More Secure):

```bash
# For Gemini
export GEMINI_API_KEY="your-key-here"
# or
export GOOGLE_API_KEY="your-key-here"

# For OpenAI
export OPENAI_API_KEY="your-key-here"

# For Anthropic
export ANTHROPIC_API_KEY="your-key-here"
```

## 🎯 How to Use

### 1. Run AI Review
- Open a Git repository
- Make sure you're on a feature branch (not base branch)
- Press **`Ctrl+Shift+R`**
- Or: Command Palette → "PR Review: Run AI Review on Current Branch"

### 2. Generate PR Description
- Command Palette → "PR Review: Generate PR Description"
- Description is copied to clipboard automatically

### 3. Show Pre-PR Checklist
- Command Palette → "PR Review: Show Pre-PR Checklist"
- Runs lint, build, tests automatically

### 4. Clear Annotations
- Command Palette → "PR Review: Clear Review Annotations"

## 📁 Test Repository

To test the extension, use the test repository:

```bash
cd /tmp/pr-review-test-repo
git checkout feature/add-user-greeting
code .
```

Then run the review with `Ctrl+Shift+R`!

## 🔧 Troubleshooting

### "API key not configured"
- Set `prReview.apiKey` in settings
- Or use environment variable (GEMINI_API_KEY, OPENAI_API_KEY, etc.)

### "Base branch not found"
- Check that `prReview.baseBranch` matches an existing branch
- Common values: "main", "master", "development", "develop"

### "Already on base branch"
- Switch to a feature branch
- Create one: `git checkout -b feature/my-feature`

### Extension not appearing
- Reload VS Code window
- Check Extensions view to confirm installation

## 📊 Features

✅ AI-powered code review (Gemini, OpenAI, Anthropic, Azure OpenAI)
✅ PR description generation
✅ Pre-PR checklist automation
✅ Inline code annotations
✅ Interactive results webview
✅ Multi-provider AI support
✅ Keyboard shortcuts
✅ Comprehensive documentation

## 🌟 Next Steps

1. **Install the extension** using one of the methods above
2. **Configure your API key**
3. **Open a Git repository**
4. **Run a review** with `Ctrl+Shift+R`
5. **Enjoy automated PR reviews!** 🎉

---

**Package Location**: `/home/david/workspace/poc/vscode/pr-review-assistant/pr-review-assistant-0.1.0.vsix`

**GitHub Repository**: https://github.com/tsrajandavid/pr-review
