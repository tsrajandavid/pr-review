# 🚀 Pre-Commit AI Code Validation

## Overview

The PR Auto Review Assistant now includes **automatic pre-commit validation** - similar to ESLint, Prettier, and SonarLint, but powered by AI!

## 🎯 What It Does

Before you commit code, the extension automatically:

✅ **Analyzes staged changes** using AI  
✅ **Detects critical issues**:
- Bugs and errors
- Security vulnerabilities  
- Breaking changes
- Code quality problems
- Missing error handling
- Duplicated code
- High complexity functions
- Bad patterns

✅ **Blocks commits** if blocking issues found (configurable)  
✅ **Shows results** in VS Code  
✅ **Allows bypass** with `git commit --no-verify`

## 📦 Installation

### 1. Install the Pre-Commit Hook

Open Command Palette (`Ctrl+Shift+P`) and run:
```
PR Review: Install Pre-Commit AI Review Hook
```

This creates a Git hook in `.git/hooks/pre-commit` that runs automatically before each commit.

### 2. Configure Settings

```json
{
  "prReview.aiProvider": "gemini",
  "prReview.apiKey": "YOUR_API_KEY",
  "prReview.blockCommitOnIssues": true  // Block commits on issues
}
```

## 🎮 Usage

### Automatic (Recommended)

Once installed, the hook runs automatically:

```bash
git add .
git commit -m "Your commit message"
```

The AI will analyze your staged changes and:
- ✅ **Allow commit** if no blocking issues
- ❌ **Block commit** if critical issues found
- 💡 **Show results** in VS Code

### Manual Validation

You can also run validation manually:

**Command Palette** → `PR Review: Run Pre-Commit Validation`

### Bypass Validation

If you need to commit despite issues:

```bash
git commit --no-verify -m "Your message"
```

## ⚙️ Configuration

### Block Commits on Issues

```json
{
  "prReview.blockCommitOnIssues": true  // Default: true
}
```

- `true`: Commits are blocked if blocking issues found
- `false`: Warnings shown but commits allowed

### AI Provider Settings

```json
{
  "prReview.aiProvider": "gemini",  // or "openai", "anthropic"
  "prReview.geminiModel": "gemini-2.5-flash",
  "prReview.apiKey": "YOUR_KEY"
}
```

## 🔧 Commands

| Command | Description |
|---------|-------------|
| `PR Review: Install Pre-Commit AI Review Hook` | Install the pre-commit hook |
| `PR Review: Uninstall Pre-Commit Hook` | Remove the hook |
| `PR Review: Run Pre-Commit Validation` | Manually validate staged changes |

## 📊 What Gets Analyzed

The AI reviews:
- **Staged changes only** (not all uncommitted changes)
- **Diff format** (what's being added/removed)
- **File context** (which files are changing)

Focus areas:
1. **Critical bugs** - Logic errors, null references
2. **Security** - SQL injection, XSS, auth issues
3. **Breaking changes** - API changes, removed functions
4. **Code quality** - Complexity, duplication, patterns
5. **Error handling** - Missing try-catch, validation

## 🆚 Comparison with Other Tools

| Feature | ESLint | Prettier | SonarLint | **PR Review AI** |
|---------|--------|----------|-----------|------------------|
| Syntax errors | ✅ | ❌ | ✅ | ✅ |
| Code formatting | ❌ | ✅ | ❌ | ✅ |
| Security issues | ⚠️ | ❌ | ✅ | ✅ |
| Logic bugs | ❌ | ❌ | ✅ | ✅ |
| Context-aware | ❌ | ❌ | ⚠️ | ✅ |
| Natural language | ❌ | ❌ | ❌ | ✅ |
| Multi-language | ⚠️ | ⚠️ | ✅ | ✅ |
| Pre-commit hook | ✅ | ✅ | ❌ | ✅ |

## 💡 Best Practices

### 1. Use with Other Tools

Combine with ESLint, Prettier, and SonarLint for comprehensive coverage:

```bash
# .git/hooks/pre-commit
#!/bin/bash

# Run ESLint
npm run lint || exit 1

# Run Prettier
npm run format:check || exit 1

# Run AI Review (handled by extension)
# ...

exit 0
```

### 2. Configure for Your Team

Set team-wide settings in `.vscode/settings.json`:

```json
{
  "prReview.aiProvider": "gemini",
  "prReview.blockCommitOnIssues": true,
  "prReview.baseBranch": "main"
}
```

### 3. Review Before Committing

Stage changes incrementally:

```bash
git add file1.js file2.js
git commit -m "Add feature X"  # AI reviews only these files
```

## 🐛 Troubleshooting

### Hook Not Running

Check if hook is installed:
```bash
ls -la .git/hooks/pre-commit
```

If missing, reinstall:
- Command Palette → `PR Review: Install Pre-Commit AI Review Hook`

### Commits Still Going Through

Check configuration:
```json
{
  "prReview.blockCommitOnIssues": true  // Must be true
}
```

### API Errors

Verify API key:
- Settings → `prReview.apiKey`
- Or set environment variable: `GEMINI_API_KEY`

### Slow Performance

Use faster model:
```json
{
  "prReview.geminiModel": "gemini-2.5-flash"  // Fastest
}
```

## 🔐 Security

- API keys are stored securely in VS Code settings
- Hooks run locally (no code sent to third parties except AI provider)
- You can review hook script: `.git/hooks/pre-commit`

## 📝 Examples

### Example 1: Blocking Issue Found

```bash
$ git commit -m "Add user login"
🤖 Running AI code review...
📊 Analyzing staged changes...

⚠️ Found 2 blocking issue(s)
❌ Commit blocked. Fix issues or use --no-verify to bypass.
```

### Example 2: No Issues

```bash
$ git commit -m "Update documentation"
🤖 Running AI code review...
📊 Analyzing staged changes...

✅ No blocking issues found
[main abc1234] Update documentation
```

### Example 3: Bypass

```bash
$ git commit --no-verify -m "WIP: experimental feature"
[main def5678] WIP: experimental feature
```

## 🚀 Advanced Usage

### Custom Prompts

Add custom focus areas in settings:

```json
{
  "prReview.customPrompt": "Also check for performance issues and accessibility"
}
```

### Integration with CI/CD

The hook works locally. For CI/CD, use the main review command in your pipeline.

## 📚 Learn More

- [Main README](./README.md)
- [Local Testing Guide](./LOCAL_TESTING.md)
- [Configuration Reference](./README.md#configuration)

---

**🎉 Enjoy automatic AI-powered code validation before every commit!**
