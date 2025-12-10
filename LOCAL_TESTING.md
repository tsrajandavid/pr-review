# Local Testing Guide for PR Auto Review Assistant

## Prerequisites
✅ Extension compiled successfully
✅ Dependencies installed
✅ VS Code launch configuration created

## Step-by-Step Local Testing

### Step 1: Open Extension Project in VS Code
```bash
cd /home/directory/workspace/poc/vscode/pr-review-assistant
code .
```

### Step 2: Launch Extension Development Host

**Method A: Using Keyboard Shortcut**
- Press **F5**

**Method B: Using Debug Menu**
1. Go to **Run** > **Start Debugging**
2. Or click the Run icon in the sidebar and click the green play button

**Method C: Using Command Palette**
1. Press **Ctrl+Shift+P**
2. Type "Debug: Start Debugging"
3. Press Enter

This will:
- Compile the extension automatically
- Open a new VS Code window titled "[Extension Development Host]"
- Load your extension in that window

### Step 3: Prepare a Test Repository

In the Extension Development Host window:

1. **Open a Git repository** (File > Open Folder)
   - Use any existing Git project
   - Or create a test repo:
   ```bash
   mkdir /tmp/test-pr-review
   cd /tmp/test-pr-review
   git init
   git checkout -b development
   echo "# Test" > README.md
   git add .
   git commit -m "Initial commit"
   git checkout -b feature/test-branch
   echo "console.log('test');" > test.js
   git add .
   git commit -m "Add test file"
   ```

2. **Configure the extension**
   - Press **Ctrl+,** to open Settings
   - Search for "PR Review"
   - Set the following:
     - `prReview.aiProvider`: Choose "openai" or "anthropic"
     - `prReview.apiKey`: Your API key (or set environment variable)
     - `prReview.baseBranch`: "development" (or your base branch)

### Step 4: Test Each Command

#### Test 1: Run AI Review
1. Make sure you're on a feature branch (not the base branch)
2. Press **Ctrl+Shift+P** to open Command Palette
3. Type: "PR Review: Run AI Review"
4. Press Enter

**Expected Results:**
- Progress notification appears
- If PR is large, you'll see a size warning
- AI review runs (requires API key)
- Results panel opens showing review feedback
- Inline annotations appear in your code (if enabled)

**Alternative:** Use keyboard shortcut **Ctrl+Shift+R**

#### Test 2: Generate PR Description
1. Press **Ctrl+Shift+P**
2. Type: "PR Review: Generate PR Description"
3. Press Enter

**Expected Results:**
- Progress notification appears
- PR description is generated
- Description is copied to clipboard
- You can click "Preview" to see it in a new document

#### Test 3: Show Pre-PR Checklist
1. Press **Ctrl+Shift+P**
2. Type: "PR Review: Show Pre-PR Checklist"
3. Press Enter

**Expected Results:**
- Checklist runs automatically
- Shows results for: lint, build, tests, review
- Displays pass/fail status

#### Test 4: Clear Annotations
1. Press **Ctrl+Shift+P**
2. Type: "PR Review: Clear Review Annotations"
3. Press Enter

**Expected Results:**
- All inline annotations are removed
- Problems panel is cleared

### Step 5: Test Without API Key (Error Handling)

1. Remove or clear the API key in settings
2. Try running a review

**Expected Result:**
- Error message: "API key not configured"

### Step 6: Test on Base Branch (Error Handling)

1. Switch to your base branch: `git checkout development`
2. Try running a review

**Expected Result:**
- Error message: "Already on base branch"

### Step 7: Check Extension Output

1. In the Extension Development Host window:
   - Press **Ctrl+Shift+U** to open Output panel
   - Select "Extension Host" from the dropdown
   - Look for: "PR Auto Review Assistant is now active"

2. Check for any errors in the console

## Debugging Tips

### Enable Watch Mode
For faster development, run watch mode in a terminal:
```bash
npm run watch
```
This will automatically recompile when you make changes.

### View Extension Logs
- Open Output panel (**Ctrl+Shift+U**)
- Select "Extension Host" from dropdown
- Look for console.log messages

### Debug with Breakpoints
1. Open `src/extension.ts` in the main VS Code window
2. Click in the gutter to set breakpoints
3. Press F5 to start debugging
4. Trigger the command in Extension Development Host
5. Debugger will pause at breakpoints

### Reload Extension After Changes
After making code changes:
1. In Extension Development Host window
2. Press **Ctrl+R** (or Cmd+R on Mac)
3. Or use Command Palette: "Developer: Reload Window"

## Common Issues & Solutions

### Issue: "tsc: command not found"
**Solution:** Run `npm install` first

### Issue: Extension doesn't appear in Command Palette
**Solution:** 
- Check that extension compiled successfully
- Reload the Extension Development Host window
- Check for errors in Output > Extension Host

### Issue: "API key not configured"
**Solution:**
- Set `prReview.apiKey` in settings, OR
- Set environment variable: `export OPENAI_API_KEY=your-key`

### Issue: "Not a Git repository"
**Solution:** Open a folder that contains a `.git` directory

### Issue: "Base branch not found"
**Solution:** Make sure the base branch exists in your repository

## Quick Test Checklist

- [ ] Extension loads without errors
- [ ] Commands appear in Command Palette
- [ ] Keyboard shortcut (Ctrl+Shift+R) works
- [ ] AI review runs successfully
- [ ] Results panel displays correctly
- [ ] Inline annotations appear
- [ ] PR description generation works
- [ ] Checklist runs
- [ ] Clear annotations works
- [ ] Error messages display for invalid scenarios

## Next Steps After Testing

### Package the Extension
```bash
npm run package
```
This creates `pr-review-assistant-0.1.0.vsix`

### Install Locally
```bash
code --install-extension pr-review-assistant-0.1.0.vsix
```

### Share with Others
Send them the `.vsix` file and they can install it via:
- Extensions view > "..." menu > "Install from VSIX..."

## Environment Variables (Alternative to Settings)

Instead of storing API keys in settings, you can use environment variables:

```bash
# For OpenAI
export OPENAI_API_KEY="your-openai-key"

# For Anthropic
export ANTHROPIC_API_KEY="your-anthropic-key"

# Then launch VS Code from the same terminal
code .
```

## Test Configuration Example

Create a `.vscode/settings.json` in your test repository:

```json
{
  "prReview.aiProvider": "openai",
  "prReview.baseBranch": "development",
  "prReview.maxFiles": 5,
  "prReview.enableInlineAnnotations": true,
  "prReview.autoRunChecklist": false,
  "prReview.openaiModel": "gpt-4-turbo-preview",
  "prReview.maxTokens": 4000
}
```

## Ready to Test!

You're all set! Press **F5** to start testing the extension locally.
