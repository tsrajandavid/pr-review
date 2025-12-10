import * as vscode from 'vscode';
import { ReviewResult, ReviewIssue } from '../services/aiService';

/**
 * Code decorations for inline review feedback
 */
export class CodeDecorations {
  private diagnosticCollection: vscode.DiagnosticCollection;
  private blockingDecorationType: vscode.TextEditorDecorationType;
  private suggestionDecorationType: vscode.TextEditorDecorationType;
  private noteDecorationType: vscode.TextEditorDecorationType;

  constructor() {
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection('pr-review');

    // Define decoration types
    this.blockingDecorationType = vscode.window.createTextEditorDecorationType({
      borderWidth: '0 0 2px 0',
      borderStyle: 'solid',
      borderColor: new vscode.ThemeColor('editorError.foreground'),
      backgroundColor: new vscode.ThemeColor('editorError.background')
    });

    this.suggestionDecorationType = vscode.window.createTextEditorDecorationType({
      borderWidth: '0 0 2px 0',
      borderStyle: 'solid',
      borderColor: new vscode.ThemeColor('editorWarning.foreground'),
      backgroundColor: new vscode.ThemeColor('editorWarning.background')
    });

    this.noteDecorationType = vscode.window.createTextEditorDecorationType({
      borderWidth: '0 0 1px 0',
      borderStyle: 'dotted',
      borderColor: new vscode.ThemeColor('editorInfo.foreground')
    });
  }

  /**
   * Apply review feedback as diagnostics and decorations
   */
  applyReviewFeedback(reviewResult: ReviewResult, workspaceRoot: string): void {
    this.clearAll();

    const diagnosticsMap = new Map<string, vscode.Diagnostic[]>();

    // Process blocking issues
    this.processFeedback(
      reviewResult.blockingIssues,
      vscode.DiagnosticSeverity.Error,
      '❌ Blocking',
      diagnosticsMap,
      workspaceRoot
    );

    // Process suggestions
    this.processFeedback(
      reviewResult.suggestions,
      vscode.DiagnosticSeverity.Warning,
      '⚠️ Suggestion',
      diagnosticsMap,
      workspaceRoot
    );

    // Process notes
    this.processFeedback(
      reviewResult.notes,
      vscode.DiagnosticSeverity.Information,
      'ℹ️ Note',
      diagnosticsMap,
      workspaceRoot
    );

    // Apply diagnostics
    diagnosticsMap.forEach((diagnostics, filePath) => {
      const uri = vscode.Uri.file(filePath);
      this.diagnosticCollection.set(uri, diagnostics);
    });
  }

  /**
   * Process feedback items and create diagnostics
   */
  private processFeedback(
    issues: ReviewIssue[],
    severity: vscode.DiagnosticSeverity,
    prefix: string,
    diagnosticsMap: Map<string, vscode.Diagnostic[]>,
    workspaceRoot: string
  ): void {
    for (const issue of issues) {
      const filePath = vscode.Uri.joinPath(vscode.Uri.file(workspaceRoot), issue.file).fsPath;
      
      if (!diagnosticsMap.has(filePath)) {
        diagnosticsMap.set(filePath, []);
      }

      const line = Math.max(0, issue.line - 1); // Convert to 0-indexed
      const range = new vscode.Range(line, 0, line, Number.MAX_SAFE_INTEGER);

      let message = `${prefix}: ${issue.description}`;
      if (issue.suggestedFix) {
        message += `\n\n💡 Suggested fix: ${issue.suggestedFix}`;
      }

      const diagnostic = new vscode.Diagnostic(range, message, severity);
      diagnostic.source = 'PR Review';
      diagnostic.code = {
        value: 'pr-review',
        target: vscode.Uri.parse('command:pr-review.applyFix')
      };

      diagnosticsMap.get(filePath)!.push(diagnostic);
    }
  }

  /**
   * Clear all diagnostics and decorations
   */
  clearAll(): void {
    this.diagnosticCollection.clear();
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    this.diagnosticCollection.dispose();
    this.blockingDecorationType.dispose();
    this.suggestionDecorationType.dispose();
    this.noteDecorationType.dispose();
  }
}
