import * as vscode from 'vscode';
import { ChangedFile } from '../services/gitService';

/**
 * PR size checker and warning system
 */
export class PRSizeChecker {
  /**
   * Check PR size and show warning if needed
   */
  async checkAndWarn(
    changedFiles: ChangedFile[],
    maxFiles: number
  ): Promise<boolean> {
    const fileCount = changedFiles.length;

    if (fileCount > maxFiles) {
      const message = `⚠️ This PR has ${fileCount} changed files (threshold: ${maxFiles}). ` +
                     `Consider splitting into smaller PRs for better review quality.`;

      const action = await vscode.window.showWarningMessage(
        message,
        'Proceed Anyway',
        'View Files',
        'Cancel'
      );

      if (action === 'View Files') {
        this.showChangedFilesList(changedFiles);
        return false;
      }

      if (action === 'Cancel') {
        return false;
      }

      // User chose "Proceed Anyway"
      return true;
    }

    return true;
  }

  /**
   * Show list of changed files in Quick Pick
   */
  private async showChangedFilesList(changedFiles: ChangedFile[]): Promise<void> {
    const items = changedFiles.map(file => ({
      label: file.path,
      description: this.getStatusDescription(file.status),
      detail: file.status
    }));

    await vscode.window.showQuickPick(items, {
      placeHolder: 'Changed files in this PR',
      canPickMany: false
    });
  }

  /**
   * Get human-readable status description
   */
  private getStatusDescription(status: string): string {
    switch (status) {
      case 'M': return 'Modified';
      case 'A': return 'Added';
      case 'D': return 'Deleted';
      case 'R': return 'Renamed';
      case 'C': return 'Copied';
      case 'B': return 'Binary';
      default: return status;
    }
  }

  /**
   * Get PR size statistics
   */
  getStatistics(changedFiles: ChangedFile[]): {
    total: number;
    modified: number;
    added: number;
    deleted: number;
  } {
    return {
      total: changedFiles.length,
      modified: changedFiles.filter(f => f.status === 'M').length,
      added: changedFiles.filter(f => f.status === 'A').length,
      deleted: changedFiles.filter(f => f.status === 'D').length
    };
  }
}
