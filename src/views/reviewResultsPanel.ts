import * as vscode from 'vscode';
import { ReviewResult } from '../services/aiService';
import { ChangedFile } from '../services/gitService';

/**
 * Webview panel for displaying review results
 */
export class ReviewResultsPanel {
	public static currentPanel: ReviewResultsPanel | undefined;
	private static readonly viewType = 'prReviewResults';

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];

	public static createOrShow(
		extensionUri: vscode.Uri,
		reviewResult: ReviewResult,
		changedFiles: ChangedFile[]
	) {
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		// If we already have a panel, show it
		if (ReviewResultsPanel.currentPanel) {
			ReviewResultsPanel.currentPanel._panel.reveal(column);
			ReviewResultsPanel.currentPanel._update(reviewResult, changedFiles);
			return;
		}

		// Otherwise, create a new panel
		const panel = vscode.window.createWebviewPanel(
			ReviewResultsPanel.viewType,
			'PR Review Results',
			column || vscode.ViewColumn.One,
			{
				enableScripts: true,
				localResourceRoots: [extensionUri]
			}
		);

		ReviewResultsPanel.currentPanel = new ReviewResultsPanel(
			panel,
			extensionUri,
			reviewResult,
			changedFiles
		);
	}

	private constructor(
		panel: vscode.WebviewPanel,
		extensionUri: vscode.Uri,
		reviewResult: ReviewResult,
		changedFiles: ChangedFile[]
	) {
		this._panel = panel;
		this._extensionUri = extensionUri;

		// Set the webview's initial html content
		this._update(reviewResult, changedFiles);

		// Listen for when the panel is disposed
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// Handle messages from the webview
		this._panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'openFile':
						this._openFile(message.file, message.line);
						return;
				}
			},
			null,
			this._disposables
		);
	}

	private _update(reviewResult: ReviewResult, changedFiles: ChangedFile[]) {
		this._panel.webview.html = this._getHtmlForWebview(reviewResult, changedFiles);
	}

	private _openFile(filePath: string, line: number) {
		const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
		if (!workspaceRoot) {
			return;
		}

		const fullPath = vscode.Uri.joinPath(vscode.Uri.file(workspaceRoot), filePath);
		
		vscode.workspace.openTextDocument(fullPath).then(doc => {
			vscode.window.showTextDocument(doc).then(editor => {
				const position = new vscode.Position(Math.max(0, line - 1), 0);
				editor.selection = new vscode.Selection(position, position);
				editor.revealRange(new vscode.Range(position, position));
			});
		});
	}

	private _getHtmlForWebview(reviewResult: ReviewResult, changedFiles: ChangedFile[]): string {
		const riskColor = {
			'LOW': '#28a745',
			'MEDIUM': '#ffa500',
			'HIGH': '#dc3545'
		}[reviewResult.riskLevel] || '#6c757d';

		const blockingCount = reviewResult.blockingIssues.length;
		const suggestionCount = reviewResult.suggestions.length;
		const noteCount = reviewResult.notes.length;

		return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>PR Review Results</title>
	<style>
		body {
			font-family: var(--vscode-font-family);
			padding: 20px;
			color: var(--vscode-foreground);
			background-color: var(--vscode-editor-background);
		}
		.header {
			margin-bottom: 30px;
		}
		.risk-badge {
			display: inline-block;
			padding: 6px 12px;
			border-radius: 4px;
			font-weight: bold;
			color: white;
			background-color: ${riskColor};
		}
		.summary {
			margin: 20px 0;
			padding: 15px;
			background-color: var(--vscode-textBlockQuote-background);
			border-left: 4px solid var(--vscode-textBlockQuote-border);
		}
		.stats {
			display: flex;
			gap: 20px;
			margin: 20px 0;
		}
		.stat-card {
			flex: 1;
			padding: 15px;
			background-color: var(--vscode-editor-inactiveSelectionBackground);
			border-radius: 6px;
		}
		.stat-number {
			font-size: 24px;
			font-weight: bold;
			margin-bottom: 5px;
		}
		.stat-label {
			font-size: 12px;
			opacity: 0.8;
		}
		.section {
			margin: 30px 0;
		}
		.section-title {
			font-size: 18px;
			font-weight: bold;
			margin-bottom: 15px;
			display: flex;
			align-items: center;
			gap: 10px;
		}
		.issue-card {
			margin: 10px 0;
			padding: 15px;
			background-color: var(--vscode-editor-inactiveSelectionBackground);
			border-radius: 6px;
			border-left: 4px solid;
		}
		.issue-card.blocking {
			border-left-color: #dc3545;
		}
		.issue-card.suggestion {
			border-left-color: #ffa500;
		}
		.issue-card.note {
			border-left-color: #17a2b8;
		}
		.issue-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 10px;
		}
		.file-link {
			color: var(--vscode-textLink-foreground);
			cursor: pointer;
			text-decoration: none;
		}
		.file-link:hover {
			text-decoration: underline;
		}
		.line-number {
			opacity: 0.7;
			font-size: 12px;
		}
		.issue-description {
			margin: 10px 0;
		}
		.suggested-fix {
			margin-top: 10px;
			padding: 10px;
			background-color: var(--vscode-textCodeBlock-background);
			border-radius: 4px;
			font-family: var(--vscode-editor-font-family);
			font-size: 13px;
		}
		.suggested-fix-label {
			font-weight: bold;
			margin-bottom: 5px;
			color: #28a745;
		}
		.empty-state {
			text-align: center;
			padding: 40px;
			opacity: 0.6;
		}
		.changed-files {
			margin-top: 10px;
		}
		.file-item {
			padding: 8px;
			margin: 4px 0;
			background-color: var(--vscode-editor-inactiveSelectionBackground);
			border-radius: 4px;
			font-family: var(--vscode-editor-font-family);
			font-size: 13px;
		}
		.status-badge {
			display: inline-block;
			padding: 2px 6px;
			border-radius: 3px;
			font-size: 11px;
			margin-right: 8px;
		}
		.status-M { background-color: #ffa500; color: white; }
		.status-A { background-color: #28a745; color: white; }
		.status-D { background-color: #dc3545; color: white; }
	</style>
</head>
<body>
	<div class="header">
		<h1>PR Review Results</h1>
		<div class="risk-badge">Risk Level: ${reviewResult.riskLevel}</div>
	</div>

	<div class="summary">
		<strong>Summary:</strong> ${reviewResult.summary}
	</div>

	<div class="stats">
		<div class="stat-card">
			<div class="stat-number" style="color: #dc3545;">${blockingCount}</div>
			<div class="stat-label">Blocking Issues</div>
		</div>
		<div class="stat-card">
			<div class="stat-number" style="color: #ffa500;">${suggestionCount}</div>
			<div class="stat-label">Suggestions</div>
		</div>
		<div class="stat-card">
			<div class="stat-number" style="color: #17a2b8;">${noteCount}</div>
			<div class="stat-label">Notes</div>
		</div>
		<div class="stat-card">
			<div class="stat-number">${changedFiles.length}</div>
			<div class="stat-label">Files Changed</div>
		</div>
	</div>

	${blockingCount > 0 ? `
	<div class="section">
		<div class="section-title">
			❌ Blocking Issues
		</div>
		${reviewResult.blockingIssues.map(issue => `
			<div class="issue-card blocking">
				<div class="issue-header">
					<a class="file-link" href="#" onclick="openFile('${issue.file}', ${issue.line}); return false;">
						${issue.file}
					</a>
					<span class="line-number">Line ${issue.line}</span>
				</div>
				<div class="issue-description">${issue.description}</div>
				${issue.suggestedFix ? `
					<div class="suggested-fix">
						<div class="suggested-fix-label">💡 Suggested Fix:</div>
						${issue.suggestedFix}
					</div>
				` : ''}
			</div>
		`).join('')}
	</div>
	` : ''}

	${suggestionCount > 0 ? `
	<div class="section">
		<div class="section-title">
			⚠️ Suggestions
		</div>
		${reviewResult.suggestions.map(issue => `
			<div class="issue-card suggestion">
				<div class="issue-header">
					<a class="file-link" href="#" onclick="openFile('${issue.file}', ${issue.line}); return false;">
						${issue.file}
					</a>
					<span class="line-number">Line ${issue.line}</span>
				</div>
				<div class="issue-description">${issue.description}</div>
				${issue.suggestedFix ? `
					<div class="suggested-fix">
						<div class="suggested-fix-label">💡 Suggested Fix:</div>
						${issue.suggestedFix}
					</div>
				` : ''}
			</div>
		`).join('')}
	</div>
	` : ''}

	${noteCount > 0 ? `
	<div class="section">
		<div class="section-title">
			ℹ️ Notes
		</div>
		${reviewResult.notes.map(issue => `
			<div class="issue-card note">
				<div class="issue-header">
					<a class="file-link" href="#" onclick="openFile('${issue.file}', ${issue.line}); return false;">
						${issue.file}
					</a>
					<span class="line-number">Line ${issue.line}</span>
				</div>
				<div class="issue-description">${issue.description}</div>
			</div>
		`).join('')}
	</div>
	` : ''}

	<div class="section">
		<div class="section-title">
			📁 Changed Files
		</div>
		<div class="changed-files">
			${changedFiles.map(file => `
				<div class="file-item">
					<span class="status-badge status-${file.status}">${file.status}</span>
					${file.path}
				</div>
			`).join('')}
		</div>
	</div>

	<script>
		const vscode = acquireVsCodeApi();
		
		function openFile(file, line) {
			vscode.postMessage({
				command: 'openFile',
				file: file,
				line: line
			});
		}
	</script>
</body>
</html>`;
	}

	public dispose() {
		ReviewResultsPanel.currentPanel = undefined;

		this._panel.dispose();

		while (this._disposables.length) {
			const disposable = this._disposables.pop();
			if (disposable) {
				disposable.dispose();
			}
		}
	}
}
