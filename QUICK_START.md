# Quick Start: Test the Extension Now!

## 🚀 Fastest Way to Test

### 1. Press F5
Just press **F5** in VS Code right now! This will:
- Compile the extension
- Open a new window with the extension loaded
- Ready to test immediately

### 2. Open a Git Repo
In the new window that opens:
- Open any folder with a Git repository
- Or create a quick test repo (see below)

### 3. Configure API Key
- Press `Ctrl+,` for Settings
- Search "PR Review"
- Add your OpenAI or Anthropic API key

### 4. Run a Review
- Press `Ctrl+Shift+P`
- Type "PR Review: Run AI Review"
- Done! 🎉

---

## 📝 Create a Test Repository (30 seconds)

```bash
# Create test repo
mkdir /tmp/test-pr && cd /tmp/test-pr
git init
git checkout -b main

# Add initial file
echo "# Test Project" > README.md
git add . && git commit -m "Initial commit"

# Create feature branch with changes
git checkout -b feature/test
echo "console.log('Hello PR Review!');" > app.js
git add . && git commit -m "Add app.js"

# Now open this folder in the Extension Development Host
```

---

## ⚡ Quick Commands to Test

| Command | Shortcut | What it does |
|---------|----------|--------------|
| Run AI Review | `Ctrl+Shift+R` | Analyzes your changes |
| Generate PR Description | Command Palette | Creates PR description |
| Show Checklist | Command Palette | Runs pre-PR checks |
| Clear Annotations | Command Palette | Removes inline feedback |

---

## 🔧 Minimal Configuration

Add to your VS Code settings (or test repo's `.vscode/settings.json`):

```json
{
  "prReview.aiProvider": "openai",
  "prReview.apiKey": "sk-...",
  "prReview.baseBranch": "main"
}
```

Or use environment variable:
```bash
export OPENAI_API_KEY="sk-..."
```

---

## ✅ What to Expect

After running "Run AI Review":
1. ⏳ Progress notification appears
2. 🤖 AI analyzes your code changes
3. 📊 Results panel opens with feedback
4. 📍 Inline annotations appear in your code
5. ✨ Review complete!

---

## 🐛 Troubleshooting

**Extension doesn't load?**
- Check Output panel: `Ctrl+Shift+U` > "Extension Host"

**No commands in palette?**
- Reload window: `Ctrl+R` in Extension Development Host

**API errors?**
- Verify API key is set correctly
- Check you have API credits

---

## 📚 Full Documentation

See [LOCAL_TESTING.md](./LOCAL_TESTING.md) for detailed testing guide.

---

**Ready? Press F5 now!** 🚀
