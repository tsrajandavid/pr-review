import * as vscode from 'vscode';
import { ConfigurationManager } from './config/settings';
import { GitService } from './services/gitService';
import { AIService } from './services/aiService';
import { CodeDecorations } from './decorations/codeDecorations';
import { PRDescriptionGenerator } from './generators/prDescriptionGenerator';
import { PRChecklist } from './checklist/prChecklist';
import { PRSizeChecker } from './utils/prSizeChecker';
import { buildReviewPrompt } from './prompts/reviewPrompt';
import { ReviewResultsPanel } from './views/reviewResultsPanel';

/**
 * Extension activation
 */
export function activate(context: vscode.ExtensionContext) {
	console.log('PR Auto Review Assistant is now active');

	// Initialize services
	const config = new ConfigurationManager();
	const codeDecorations = new CodeDecorations();
	
	// Get workspace root
	const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
	if (!workspaceRoot) {
		vscode.window.showErrorMessage('No workspace folder open');
		return;
	}

	const gitService = new GitService(workspaceRoot);
	const prSizeChecker = new PRSizeChecker();
	const prChecklist = new PRChecklist(workspaceRoot);

	// AI service will be initialized on-demand (requires API key)
	let aiService: AIService | undefined;
	let prDescriptionGenerator: PRDescriptionGenerator | undefined;

	/**
	 * Initialize AI service if not already initialized
	 */
	function initializeAIService(): AIService {
		if (!aiService) {
			config.refresh();
			const configValidation = config.validate();
			
			if (!configValidation.valid) {
				throw new Error(configValidation.errors.join('\n'));
			}

			aiService = new AIService(config);
			prDescriptionGenerator = new PRDescriptionGenerator(aiService);
		}
		return aiService;
	}

	/**
	 * Command: Run AI Review on Current Branch
	 */
	const runReviewCommand = vscode.commands.registerCommand('pr-review.runReview', async () => {
		try {
			// Validate Git setup
			const baseBranch = config.getBaseBranch();
			const gitValidation = await gitService.validate(baseBranch);
			
			if (!gitValidation.valid) {
				vscode.window.showErrorMessage(
					`Git validation failed:\n${gitValidation.errors.join('\n')}`
				);
				return;
			}

			// Show progress
			await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: 'Running PR Review',
				cancellable: false
			}, async (progress) => {
				// Step 1: Get changed files
				progress.report({ increment: 10, message: 'Analyzing changes...' });
				const changedFiles = await gitService.getChangedFiles(baseBranch);

				if (changedFiles.length === 0) {
					vscode.window.showInformationMessage('No changes detected compared to base branch');
					return;
				}

				// Step 2: Check PR size
				progress.report({ increment: 10, message: 'Checking PR size...' });
				const maxFiles = config.getMaxFiles();
				const shouldProceed = await prSizeChecker.checkAndWarn(changedFiles, maxFiles);
				
				if (!shouldProceed) {
					return;
				}

				// Step 3: Get diff
				progress.report({ increment: 20, message: 'Getting code diff...' });
				const diff = await gitService.getDiff(baseBranch);

				// Step 4: Initialize AI service and run review
				progress.report({ increment: 20, message: 'Running AI review...' });
				const ai = initializeAIService();
				
				const fileNames = changedFiles.map(f => f.path);
				const reviewPrompt = buildReviewPrompt(diff, fileNames);
				const reviewResult = await ai.reviewCode(reviewPrompt);

				// Step 5: Apply feedback
				progress.report({ increment: 20, message: 'Applying feedback...' });
				if (config.isInlineAnnotationsEnabled()) {
					codeDecorations.applyReviewFeedback(reviewResult, workspaceRoot);
				}

				// Step 6: Show results
				progress.report({ increment: 20, message: 'Preparing results...' });
				ReviewResultsPanel.createOrShow(context.extensionUri, reviewResult, changedFiles);

				// Auto-run checklist if enabled
				if (config.isAutoRunChecklistEnabled()) {
					vscode.commands.executeCommand('pr-review.showChecklist');
				}

				vscode.window.showInformationMessage(
					`✅ Review complete! Risk Level: ${reviewResult.riskLevel}`
				);
			});

		} catch (error) {
			vscode.window.showErrorMessage(
				`Review failed: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	});

	/**
	 * Command: Generate PR Description
	 */
	const generateDescriptionCommand = vscode.commands.registerCommand(
		'pr-review.generateDescription',
		async () => {
			try {
				const baseBranch = config.getBaseBranch();
				
				// Validate Git
				const gitValidation = await gitService.validate(baseBranch);
				if (!gitValidation.valid) {
					vscode.window.showErrorMessage(
						`Git validation failed:\n${gitValidation.errors.join('\n')}`
					);
					return;
				}

				await vscode.window.withProgress({
					location: vscode.ProgressLocation.Notification,
					title: 'Generating PR Description',
					cancellable: false
				}, async (progress) => {
					progress.report({ increment: 30, message: 'Analyzing changes...' });
					const changedFiles = await gitService.getChangedFiles(baseBranch);
					const diff = await gitService.getDiff(baseBranch);

					progress.report({ increment: 40, message: 'Generating description...' });
					const ai = initializeAIService();
					const generator = new PRDescriptionGenerator(ai);
					
					await generator.generateAndCopy(diff, changedFiles);
				});

			} catch (error) {
				vscode.window.showErrorMessage(
					`Failed to generate PR description: ${error instanceof Error ? error.message : String(error)}`
				);
			}
		}
	);

	/**
	 * Command: Show Pre-PR Checklist
	 */
	const showChecklistCommand = vscode.commands.registerCommand(
		'pr-review.showChecklist',
		async () => {
			try {
				await vscode.window.withProgress({
					location: vscode.ProgressLocation.Notification,
					title: 'Running Pre-PR Checklist',
					cancellable: false
				}, async (progress) => {
					progress.report({ message: 'Running checks...' });
					const results = await prChecklist.runAll();
					await prChecklist.showResults(results);
				});

			} catch (error) {
				vscode.window.showErrorMessage(
					`Checklist failed: ${error instanceof Error ? error.message : String(error)}`
				);
			}
		}
	);

	/**
	 * Command: Clear Review Annotations
	 */
	const clearDiagnosticsCommand = vscode.commands.registerCommand(
		'pr-review.clearDiagnostics',
		() => {
			codeDecorations.clearAll();
			vscode.window.showInformationMessage('Review annotations cleared');
		}
	);

	/**
	 * Command: Apply Suggested Fix (placeholder for future implementation)
	 */
	const applyFixCommand = vscode.commands.registerCommand(
		'pr-review.applyFix',
		async () => {
			vscode.window.showInformationMessage(
				'Auto-fix feature coming soon! For now, please apply fixes manually.'
			);
		}
	);

	// Register all commands
	context.subscriptions.push(
		runReviewCommand,
		generateDescriptionCommand,
		showChecklistCommand,
		clearDiagnosticsCommand,
		applyFixCommand,
		codeDecorations
	);

	// Listen for configuration changes
	context.subscriptions.push(
		vscode.workspace.onDidChangeConfiguration(e => {
			if (e.affectsConfiguration('prReview')) {
				config.refresh();
				// Reset AI service to pick up new config
				aiService = undefined;
				prDescriptionGenerator = undefined;
			}
		})
	);
}

/**
 * Extension deactivation
 */
export function deactivate() {
	console.log('PR Auto Review Assistant deactivated');
}
