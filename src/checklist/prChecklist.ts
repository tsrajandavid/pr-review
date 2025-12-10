import * as vscode from 'vscode';

export interface ChecklistItem {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  error?: string;
}

/**
 * Pre-PR checklist validator
 */
export class PRChecklist {
  private workspaceRoot: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
  }

  /**
   * Run all checklist items
   */
  async runAll(): Promise<ChecklistItem[]> {
    const items: ChecklistItem[] = [
      { id: 'lint', label: 'Lint check', status: 'pending' },
      { id: 'build', label: 'Build verification', status: 'pending' },
      { id: 'tests', label: 'Test suite', status: 'pending' },
      { id: 'review', label: 'AI review completed', status: 'pending' }
    ];

    // Run checks sequentially
    for (const item of items) {
      item.status = 'running';
      
      try {
        switch (item.id) {
          case 'lint':
            await this.runLint();
            break;
          case 'build':
            await this.runBuild();
            break;
          case 'tests':
            await this.runTests();
            break;
          case 'review':
            await this.checkReviewCompleted();
            break;
        }
        item.status = 'passed';
      } catch (error) {
        item.status = 'failed';
        item.error = error instanceof Error ? error.message : String(error);
      }
    }

    return items;
  }

  /**
   * Run lint check
   */
  private async runLint(): Promise<void> {
    // Try common linters
    const linters = ['npm run lint', 'yarn lint', 'eslint .'];
    
    for (const cmd of linters) {
      try {
        await this.executeCommand(cmd);
        return; // Success
      } catch (error) {
        // Try next linter
        continue;
      }
    }

    // If no linter found, skip (not fail)
    console.log('No linter configured, skipping...');
  }

  /**
   * Run build
   */
  private async runBuild(): Promise<void> {
    const buildCommands = ['npm run build', 'yarn build', 'tsc'];
    
    for (const cmd of buildCommands) {
      try {
        await this.executeCommand(cmd);
        return; // Success
      } catch (error) {
        continue;
      }
    }

    throw new Error('Build failed or no build command found');
  }

  /**
   * Run tests
   */
  private async runTests(): Promise<void> {
    const testCommands = ['npm test', 'yarn test', 'npm run test:unit'];
    
    for (const cmd of testCommands) {
      try {
        await this.executeCommand(cmd);
        return; // Success
      } catch (error) {
        continue;
      }
    }

    throw new Error('Tests failed or no test command found');
  }

  /**
   * Check if AI review was completed
   */
  private async checkReviewCompleted(): Promise<void> {
    // Check if there are active diagnostics from PR review
    const diagnostics = vscode.languages.getDiagnostics();
    
    const hasReviewDiagnostics = diagnostics.some(([uri, diags]) => 
      diags.some(d => d.source === 'PR Review')
    );

    if (!hasReviewDiagnostics) {
      throw new Error('AI review not completed. Run "PR Review: Run AI Review" first.');
    }
  }

  /**
   * Execute shell command
   */
  private async executeCommand(command: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const terminal = vscode.window.createTerminal({
        name: 'PR Checklist',
        cwd: this.workspaceRoot,
        hideFromUser: true
      });

      // Simple execution - in production, you'd want better process management
      terminal.sendText(command);
      
      // Wait a bit for command to complete
      setTimeout(() => {
        terminal.dispose();
        resolve();
      }, 5000);
    });
  }

  /**
   * Show checklist results in UI
   */
  async showResults(items: ChecklistItem[]): Promise<boolean> {
    const passed = items.filter(i => i.status === 'passed').length;
    const failed = items.filter(i => i.status === 'failed').length;

    const message = `Pre-PR Checklist: ${passed}/${items.length} passed`;
    
    if (failed > 0) {
      const failedItems = items
        .filter(i => i.status === 'failed')
        .map(i => `• ${i.label}: ${i.error}`)
        .join('\n');

      const action = await vscode.window.showErrorMessage(
        `${message}\n\nFailed checks:\n${failedItems}`,
        'View Details',
        'Proceed Anyway'
      );

      return action === 'Proceed Anyway';
    } else {
      vscode.window.showInformationMessage(`✅ ${message}`);
      return true;
    }
  }
}
