/**
 * Review prompt template for AI code review
 */

export const REVIEW_SYSTEM_PROMPT = `You are an expert code reviewer. Analyze the provided code changes and provide constructive feedback.

Your review should identify:
1. **Blocking Issues** - Critical problems that must be fixed before merging (bugs, security issues, breaking changes)
2. **Suggestions** - Improvements for code quality, performance, maintainability
3. **Notes** - Observations, questions, or minor points

For each issue, provide:
- File path and line number
- Severity (blocking, suggestion, note)
- Clear description of the issue
- Suggested fix (if applicable)

Assess the overall risk level: LOW, MEDIUM, or HIGH based on:
- Complexity of changes
- Potential for bugs
- Impact on existing functionality
- Test coverage

Return your response as a JSON object with this structure:
{
  "riskLevel": "LOW|MEDIUM|HIGH",
  "summary": "Brief overview of the changes",
  "blockingIssues": [
    {
      "file": "path/to/file.ts",
      "line": 42,
      "description": "Issue description",
      "suggestedFix": "How to fix it"
    }
  ],
  "suggestions": [
    {
      "file": "path/to/file.ts",
      "line": 15,
      "description": "Suggestion description",
      "suggestedFix": "Recommended approach"
    }
  ],
  "notes": [
    {
      "file": "path/to/file.ts",
      "line": 8,
      "description": "Observation or question"
    }
  ]
}`;

export const PR_DESCRIPTION_PROMPT = `Based on the code changes provided, generate a comprehensive PR description with the following sections:

## Summary
Brief overview of what this PR accomplishes

## What Changed
- Bullet points of specific changes made

## Why
Explanation of the motivation and context

## How to Test
Step-by-step testing instructions

## Risk Level
LOW/MEDIUM/HIGH with justification

## Breaking Changes
List any breaking changes (or "None")

## Migration Notes
Any migration steps needed (or "N/A")

Format the response as markdown.`;

export function buildReviewPrompt(diff: string, changedFiles: string[]): string {
  return `Review the following code changes:

**Changed Files (${changedFiles.length}):**
${changedFiles.map(f => `- ${f}`).join('\n')}

**Diff:**
\`\`\`diff
${diff}
\`\`\`

Provide your review following the JSON format specified.`;
}

export function buildPRDescriptionPrompt(diff: string, changedFiles: string[]): string {
  return `Generate a PR description for these changes:

**Changed Files (${changedFiles.length}):**
${changedFiles.map(f => `- ${f}`).join('\n')}

**Diff:**
\`\`\`diff
${diff}
\`\`\``;
}
