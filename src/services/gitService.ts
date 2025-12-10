import simpleGit, { SimpleGit, DiffResult } from 'simple-git';
import * as vscode from 'vscode';

export interface ChangedFile {
  path: string;
  status: string; // 'M' (modified), 'A' (added), 'D' (deleted), etc.
}

/**
 * Git operations service
 */
export class GitService {
  private git: SimpleGit;
  private workspaceRoot: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
    this.git = simpleGit(workspaceRoot);
  }

  /**
   * Check if current directory is a Git repository
   */
  async isGitRepository(): Promise<boolean> {
    try {
      await this.git.status();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current branch name
   */
  async getCurrentBranch(): Promise<string> {
    try {
      const status = await this.git.status();
      return status.current || '';
    } catch (error) {
      throw new Error(`Failed to get current branch: ${error}`);
    }
  }

  /**
   * Get list of changed files between current branch and base branch
   */
  async getChangedFiles(baseBranch: string): Promise<ChangedFile[]> {
    try {
      const currentBranch = await this.getCurrentBranch();
      
      if (currentBranch === baseBranch) {
        throw new Error(`Current branch is the same as base branch (${baseBranch})`);
      }

      // Get diff summary
      const diffSummary = await this.git.diffSummary([baseBranch]);
      
      return diffSummary.files.map(file => ({
        path: file.file,
        status: this.getFileStatus(file)
      }));
    } catch (error) {
      throw new Error(`Failed to get changed files: ${error}`);
    }
  }

  /**
   * Get unified diff between current branch and base branch
   */
  async getDiff(baseBranch: string): Promise<string> {
    try {
      const diff = await this.git.diff([baseBranch]);
      return diff;
    } catch (error) {
      throw new Error(`Failed to get diff: ${error}`);
    }
  }

  /**
   * Get diff for a specific file
   */
  async getFileDiff(baseBranch: string, filePath: string): Promise<string> {
    try {
      const diff = await this.git.diff([baseBranch, '--', filePath]);
      return diff;
    } catch (error) {
      throw new Error(`Failed to get diff for ${filePath}: ${error}`);
    }
  }

  /**
   * Check if base branch exists
   */
  async branchExists(branchName: string): Promise<boolean> {
    try {
      const branches = await this.git.branch();
      return branches.all.includes(branchName) || branches.all.includes(`origin/${branchName}`);
    } catch (error) {
      return false;
    }
  }

  /**
   * Get file content at specific commit/branch
   */
  async getFileContent(ref: string, filePath: string): Promise<string> {
    try {
      const content = await this.git.show([`${ref}:${filePath}`]);
      return content;
    } catch (error) {
      throw new Error(`Failed to get file content: ${error}`);
    }
  }

  /**
   * Get commit count between branches
   */
  async getCommitCount(baseBranch: string): Promise<number> {
    try {
      const log = await this.git.log([`${baseBranch}..HEAD`]);
      return log.total;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Determine file status from diff result
   */
  private getFileStatus(file: any): string {
    if (file.binary) return 'B';
    // simple-git doesn't provide status directly in diffSummary
    // We'll use insertions/deletions to infer
    if (file.insertions > 0 && file.deletions === 0) return 'A';
    if (file.insertions === 0 && file.deletions > 0) return 'D';
    return 'M';
  }

  /**
   * Validate Git setup and branch configuration
   */
  async validate(baseBranch: string): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check if Git repo
    const isRepo = await this.isGitRepository();
    if (!isRepo) {
      errors.push('Not a Git repository');
      return { valid: false, errors };
    }

    // Check current branch
    try {
      const currentBranch = await this.getCurrentBranch();
      if (!currentBranch) {
        errors.push('Could not determine current branch');
      }
      if (currentBranch === baseBranch) {
        errors.push(`Already on base branch (${baseBranch}). Switch to a feature branch first.`);
      }
    } catch (error) {
      errors.push('Failed to get current branch');
    }

    // Check if base branch exists
    const baseExists = await this.branchExists(baseBranch);
    if (!baseExists) {
      errors.push(`Base branch "${baseBranch}" not found. Check your configuration.`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get diff of staged changes (for pre-commit validation)
   */
  async getStagedDiff(): Promise<string> {
    try {
      const diff = await this.git.diff(['--cached']);
      return diff;
    } catch (error) {
      throw new Error(`Failed to get staged diff: ${error}`);
    }
  }

  /**
   * Get list of staged files
   */
  async getStagedFiles(): Promise<ChangedFile[]> {
    try {
      const status = await this.git.status();
      return status.staged.map(file => ({
        path: file,
        status: 'M' // Staged files are considered modified
      }));
    } catch (error) {
      throw new Error(`Failed to get staged files: ${error}`);
    }
  }
}
