import * as vscode from 'vscode';
import { PR_DESCRIPTION_PROMPT, buildPRDescriptionPrompt } from '../prompts/reviewPrompt';
import { AIService } from '../services/aiService';
import { ChangedFile } from '../services/gitService';

/**
 * PR description generator
 */
export class PRDescriptionGenerator {
  private aiService: AIService;

  constructor(aiService: AIService) {
    this.aiService = aiService;
  }

  /**
   * Generate PR description from diff
   */
  async generate(diff: string, changedFiles: ChangedFile[]): Promise<string> {
    try {
      const fileNames = changedFiles.map(f => f.path);
      const prompt = buildPRDescriptionPrompt(diff, fileNames);
      const fullPrompt = `${PR_DESCRIPTION_PROMPT}\n\n${prompt}`;

      const description = await this.aiService.generatePRDescription(fullPrompt);
      return description;
    } catch (error) {
      throw new Error(`Failed to generate PR description: ${error}`);
    }
  }

  /**
   * Generate and copy to clipboard
   */
  async generateAndCopy(diff: string, changedFiles: ChangedFile[]): Promise<void> {
    const description = await this.generate(diff, changedFiles);
    
    await vscode.env.clipboard.writeText(description);
    
    vscode.window.showInformationMessage(
      '✅ PR description copied to clipboard!',
      'Preview'
    ).then(action => {
      if (action === 'Preview') {
        this.showPreview(description);
      }
    });
  }

  /**
   * Show PR description in a new document
   */
  private async showPreview(description: string): Promise<void> {
    const doc = await vscode.workspace.openTextDocument({
      content: description,
      language: 'markdown'
    });

    await vscode.window.showTextDocument(doc, {
      preview: true,
      viewColumn: vscode.ViewColumn.Beside
    });
  }

  /**
   * Format description for different platforms
   */
  formatForPlatform(description: string, platform: 'bitbucket' | 'github' | 'gitlab'): string {
    // Platform-specific formatting can be added here
    // For now, return as-is (markdown is widely supported)
    return description;
  }
}
