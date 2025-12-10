import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { AIService } from '../services/aiService';
import { GitService } from '../services/gitService';
import { ConfigurationManager } from '../config/settings';

/**
 * Pre-commit hook manager for AI-powered code validation
 */
export class PreCommitHookManager {
  private config: ConfigurationManager;
  private gitService: GitService;
  private aiService: AIService;

  constructor(
    config: ConfigurationManager,
    gitService: GitService,
    aiService: AIService
  ) {
    this.config = config;
    this.gitService = gitService;
    this.aiService = aiService;
  }

  /**
   * Install pre-commit hook in the repository
   */
  async installHook(): Promise<boolean> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      vscode.window.showErrorMessage('No workspace folder found');
      return false;
    }

    const gitDir = path.join(workspaceFolder.uri.fsPath, '.git');
    if (!fs.existsSync(gitDir)) {
      vscode.window.showErrorMessage('Not a Git repository');
      return false;
    }

    const hooksDir = path.join(gitDir, 'hooks');
    if (!fs.existsSync(hooksDir)) {
      fs.mkdirSync(hooksDir, { recursive: true });
    }

    const hookPath = path.join(hooksDir, 'pre-commit');
    const hookContent = this.generateHookScript();

    try {
      fs.writeFileSync(hookPath, hookContent, { mode: 0o755 });
      vscode.window.showInformationMessage(
        '✅ Pre-commit AI review hook installed successfully!'
      );
      return true;
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to install pre-commit hook: ${error}`
      );
      return false;
    }
  }

  /**
   * Uninstall pre-commit hook
   */
  async uninstallHook(): Promise<boolean> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      return false;
    }

    const hookPath = path.join(
      workspaceFolder.uri.fsPath,
      '.git',
      'hooks',
      'pre-commit'
    );

    if (fs.existsSync(hookPath)) {
      try {
        fs.unlinkSync(hookPath);
        vscode.window.showInformationMessage(
          '✅ Pre-commit hook uninstalled'
        );
        return true;
      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed to uninstall hook: ${error}`
        );
        return false;
      }
    }

    return true;
  }

  /**
   * Generate the pre-commit hook script
   */
  private generateHookScript(): string {
    return `#!/bin/bash
# PR Auto Review Assistant - Pre-commit Hook
# This hook runs AI-powered code review before commit

echo "🤖 Running AI code review..."

# Check if pre-commit review is enabled
ENABLED=$(code --list-extensions | grep -c "pr-review-assistant" || echo "0")

if [ "$ENABLED" = "0" ]; then
  echo "⚠️  PR Review Assistant not installed, skipping..."
  exit 0
fi

# Create a marker file to trigger review
REVIEW_MARKER=".git/PR_REVIEW_PENDING"
touch "$REVIEW_MARKER"

# The actual review will be triggered by VS Code
echo "📊 Analyzing staged changes..."
echo ""
echo "💡 Review results will appear in VS Code"
echo "   - Check the PR Review Results panel"
echo "   - Fix any blocking issues before committing"
echo ""
echo "To bypass this check, use: git commit --no-verify"

# Exit with success - VS Code extension will handle the actual validation
exit 0
`;
  }

  /**
   * Run pre-commit validation
   */
  async runPreCommitValidation(): Promise<{
    canCommit: boolean;
    blockingIssues: number;
    message: string;
  }> {
    try {
      // Get staged changes
      const stagedDiff = await this.gitService.getStagedDiff();
      
      if (!stagedDiff || stagedDiff.trim().length === 0) {
        return {
          canCommit: true,
          blockingIssues: 0,
          message: 'No staged changes to review'
        };
      }

      // Run AI review on staged changes
      const prompt = this.buildPreCommitPrompt(stagedDiff);
      const result = await this.aiService.reviewCode(prompt);

      const blockingCount = result.blockingIssues.length;
      
      // Check if commit should be blocked
      const blockOnIssues = vscode.workspace.getConfiguration('prReview').get<boolean>(
        'blockCommitOnIssues',
        true
      );

      const canCommit = !blockOnIssues || blockingCount === 0;

      let message = '';
      if (blockingCount > 0) {
        message = `⚠️ Found ${blockingCount} blocking issue(s)`;
        if (!canCommit) {
          message += '\n❌ Commit blocked. Fix issues or use --no-verify to bypass.';
        }
      } else {
        message = '✅ No blocking issues found';
      }

      return {
        canCommit,
        blockingIssues: blockingCount,
        message
      };
    } catch (error) {
      vscode.window.showErrorMessage(
        `Pre-commit validation failed: ${error}`
      );
      return {
        canCommit: true, // Don't block on errors
        blockingIssues: 0,
        message: `Error during validation: ${error}`
      };
    }
  }

  /**
   * Build prompt for pre-commit review
   */
  private buildPreCommitPrompt(diff: string): string {
    return `Review the following staged changes for commit.

Focus on:
1. Critical bugs and errors
2. Security vulnerabilities
3. Breaking changes
4. Code quality issues
5. Missing error handling

Staged Changes:
${diff}

Provide a thorough review focusing on issues that should block the commit.`;
  }

  /**
   * Check if hook is installed
   */
  isHookInstalled(): boolean {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      return false;
    }

    const hookPath = path.join(
      workspaceFolder.uri.fsPath,
      '.git',
      'hooks',
      'pre-commit'
    );

    return fs.existsSync(hookPath);
  }
}
