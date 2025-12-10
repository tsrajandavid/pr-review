# PR Auto Review Assistant

A VS Code extension that automates the PR review workflow using AI. Analyze code changes, get inline feedback, and generate comprehensive PR descriptions for Bitbucket, GitHub, and GitLab.

## Features

### 🤖 AI-Powered Code Review
- Automatically analyze code changes against your base branch
- Get intelligent feedback categorized as:
  - **Blocking Issues**: Critical problems that must be fixed
  - **Suggestions**: Code quality and performance improvements
  - **Notes**: Observations and questions
- Risk level assessment (LOW/MEDIUM/HIGH)

### 📝 PR Description Generation
- Generate comprehensive PR descriptions from your code changes
- Includes summary, what changed, testing instructions, and risk assessment
- Copy directly to clipboard for easy pasting into Bitbucket/GitHub/GitLab

### ✅ Pre-PR Checklist
- Automated checks before creating your PR:
  - Lint verification
  - Build validation
  - Test suite execution
  - AI review completion

### 📊 Interactive Results View
- Beautiful webview panel showing all review feedback
- Click on issues to jump directly to the relevant code
- View all changed files with status indicators

### 🎯 Inline Annotations
- Review feedback appears as VS Code diagnostics
- Color-coded by severity (errors, warnings, info)
- Suggested fixes included when available

### ⚠️ PR Size Warnings
- Alerts when PRs exceed configurable file count
- Encourages splitting large PRs for better review quality

## Installation

### From VSIX (Recommended for Testing)
1. Download the `.vsix` file
2. Open VS Code
3. Go to Extensions view (Ctrl+Shift+X)
4. Click the "..." menu → "Install from VSIX..."
5. Select the downloaded file

### From Source
```bash
git clone <repository-url>
cd pr-review-assistant
npm install
npm run compile
```

Then press F5 to launch the Extension Development Host.

## Configuration

### Required Settings

1. **AI Provider**: Choose your AI provider
   - `prReview.aiProvider`: `"openai"`, `"anthropic"`, or `"azure-openai"`

2. **API Key**: Set your API key (or use environment variable)
   - `prReview.apiKey`: Your API key
   - Or set `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` environment variable

3. **Base Branch**: The branch to compare against
   - `prReview.baseBranch`: Default is `"development"`

### Optional Settings

```json
{
  "prReview.aiProvider": "openai",
  "prReview.apiKey": "your-api-key-here",
  "prReview.baseBranch": "development",
  "prReview.maxFiles": 10,
  "prReview.enableInlineAnnotations": true,
  "prReview.autoRunChecklist": false,
  "prReview.openaiModel": "gpt-4-turbo-preview",
  "prReview.anthropicModel": "claude-3-opus-20240229",
  "prReview.maxTokens": 4000,
  "prReview.customPrompt": ""
}
```

## Usage

### Run AI Review
1. Make sure you're on a feature branch (not the base branch)
2. Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
3. Run: **PR Review: Run AI Review on Current Branch**
4. Or use keyboard shortcut: **Ctrl+Shift+R** (Cmd+Shift+R on Mac)

The extension will:
- Analyze all changes compared to base branch
- Check PR size and warn if too large
- Run AI review on the diff
- Display results in a webview panel
- Add inline annotations to your code

### Generate PR Description
1. Open Command Palette
2. Run: **PR Review: Generate PR Description**
3. Description is automatically copied to clipboard
4. Click "Preview" to view in a new document
5. Paste into your PR on Bitbucket/GitHub/GitLab

### Run Pre-PR Checklist
1. Open Command Palette
2. Run: **PR Review: Show Pre-PR Checklist**
3. Wait for automated checks to complete
4. Review results and fix any failures

### Clear Annotations
1. Open Command Palette
2. Run: **PR Review: Clear Review Annotations**

## AI Providers

### OpenAI
- Models: `gpt-4`, `gpt-4-turbo-preview`, `gpt-3.5-turbo`
- Set `OPENAI_API_KEY` environment variable or configure in settings
- Get API key: https://platform.openai.com/api-keys

### Anthropic (Claude)
- Models: `claude-3-opus-20240229`, `claude-3-sonnet-20240229`
- Set `ANTHROPIC_API_KEY` environment variable or configure in settings
- Get API key: https://console.anthropic.com/

### Azure OpenAI
- Use your Azure OpenAI deployment
- Configure endpoint and API key in settings

## Requirements

- VS Code 1.85.0 or higher
- Git repository
- Node.js 18+ (for development)
- API key for chosen AI provider

## Extension Commands

| Command | Description | Keyboard Shortcut |
|---------|-------------|-------------------|
| `pr-review.runReview` | Run AI review on current branch | Ctrl+Shift+R |
| `pr-review.generateDescription` | Generate PR description | - |
| `pr-review.showChecklist` | Show pre-PR checklist | - |
| `pr-review.clearDiagnostics` | Clear review annotations | - |
| `pr-review.applyFix` | Apply suggested fix (coming soon) | - |

## Troubleshooting

### "API key not configured"
- Set `prReview.apiKey` in settings, or
- Set `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` environment variable

### "Not a Git repository"
- Make sure you've opened a folder containing a Git repository
- Run `git init` if needed

### "Base branch not found"
- Check that `prReview.baseBranch` matches an existing branch
- Common values: `main`, `master`, `development`, `develop`

### "Already on base branch"
- Switch to a feature branch before running review
- Create a new branch: `git checkout -b feature/my-feature`

### Review not finding changes
- Make sure you have commits on your branch that aren't on the base branch
- Check that you're comparing against the correct base branch

## Development

### Build from Source
```bash
npm install
npm run compile
```

### Watch Mode
```bash
npm run watch
```

### Package Extension
```bash
npm run package
```

This creates a `.vsix` file you can install or distribute.

### Run Tests
```bash
npm test
```

## Privacy & Security

- Your code is sent to the configured AI provider for analysis
- API keys are stored in VS Code settings (use environment variables for better security)
- No data is stored or transmitted except to your chosen AI provider
- Review the AI provider's privacy policy for their data handling

## License

MIT

## Contributing

Contributions welcome! Please open an issue or PR.

## Roadmap

- [ ] Auto-fix suggestions with one-click apply
- [ ] Support for more AI providers (Google Gemini, etc.)
- [ ] Custom review templates
- [ ] Team-specific review rules
- [ ] Integration with PR platforms (auto-post comments)
- [ ] Historical review analytics
- [ ] Multi-language support

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Note**: This extension requires an API key from a supported AI provider. API usage may incur costs based on your provider's pricing.
