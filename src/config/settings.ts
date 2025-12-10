import * as vscode from 'vscode';

/**
 * Extension configuration management
 */
export class ConfigurationManager {
  private config: vscode.WorkspaceConfiguration;

  constructor() {
    this.config = vscode.workspace.getConfiguration('prReview');
  }

  /**
   * Refresh configuration (call after settings change)
   */
  refresh(): void {
    this.config = vscode.workspace.getConfiguration('prReview');
  }

  /**
   * Get AI provider (openai, anthropic, azure-openai)
   */
  getAIProvider(): string {
    return this.config.get<string>('aiProvider', 'openai');
  }

  /**
   * Get API key (from settings or environment variable)
   */
  getAPIKey(): string {
    const apiKey = this.config.get<string>('apiKey', '');
    
    // Check environment variables if not in settings
    if (!apiKey) {
      const provider = this.getAIProvider();
      if (provider === 'openai') {
        return process.env.OPENAI_API_KEY || '';
      } else if (provider === 'anthropic') {
        return process.env.ANTHROPIC_API_KEY || '';
      } else if (provider === 'gemini') {
        return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
      }
    }
    
    return apiKey;
  }

  /**
   * Get base branch name
   */
  getBaseBranch(): string {
    return this.config.get<string>('baseBranch', 'development');
  }

  /**
   * Get max files threshold for PR size warning
   */
  getMaxFiles(): number {
    return this.config.get<number>('maxFiles', 10);
  }

  /**
   * Check if inline annotations are enabled
   */
  isInlineAnnotationsEnabled(): boolean {
    return this.config.get<boolean>('enableInlineAnnotations', true);
  }

  /**
   * Check if auto-run checklist is enabled
   */
  isAutoRunChecklistEnabled(): boolean {
    return this.config.get<boolean>('autoRunChecklist', false);
  }

  /**
   * Get OpenAI model name
   */
  getOpenAIModel(): string {
    return this.config.get<string>('openaiModel', 'gpt-4-turbo-preview');
  }

  /**
   * Get Anthropic model name
   */
  getAnthropicModel(): string {
    return this.config.get<string>('anthropicModel', 'claude-3-opus-20240229');
  }

  /**
   * Get Gemini model name
   */
  getGeminiModel(): string {
    return this.config.get<string>('geminiModel', 'gemini-pro');
  }

  /**
   * Get max tokens for AI response
   */
  getMaxTokens(): number {
    return this.config.get<number>('maxTokens', 4000);
  }

  /**
   * Get custom prompt (empty string if not set)
   */
  getCustomPrompt(): string {
    return this.config.get<string>('customPrompt', '');
  }

  /**
   * Validate configuration
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    const apiKey = this.getAPIKey();
    if (!apiKey) {
      errors.push('API key not configured. Set prReview.apiKey or use environment variable.');
    }

    const baseBranch = this.getBaseBranch();
    if (!baseBranch) {
      errors.push('Base branch not configured.');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
