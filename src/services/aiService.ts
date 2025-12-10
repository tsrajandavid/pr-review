import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigurationManager } from '../config/settings';

export interface ReviewIssue {
  file: string;
  line: number;
  description: string;
  suggestedFix?: string;
}

export interface ReviewResult {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  summary: string;
  blockingIssues: ReviewIssue[];
  suggestions: ReviewIssue[];
  notes: ReviewIssue[];
}

/**
 * AI service for code review and PR description generation
 */
export class AIService {
  private config: ConfigurationManager;
  private openaiClient?: OpenAI;
  private anthropicClient?: Anthropic;
  private geminiClient?: GoogleGenerativeAI;

  constructor(config: ConfigurationManager) {
    this.config = config;
    this.initializeClient();
  }

  /**
   * Initialize AI client based on provider
   */
  private initializeClient(): void {
    const provider = this.config.getAIProvider();
    const apiKey = this.config.getAPIKey();

    if (!apiKey) {
      throw new Error('API key not configured');
    }

    if (provider === 'openai' || provider === 'azure-openai') {
      this.openaiClient = new OpenAI({ apiKey });
    } else if (provider === 'anthropic') {
      this.anthropicClient = new Anthropic({ 
        apiKey: apiKey 
      });
    } else if (provider === 'gemini') {
      this.geminiClient = new GoogleGenerativeAI(apiKey);
    }
  }

  /**
   * Review code changes using AI
   */
  async reviewCode(prompt: string): Promise<ReviewResult> {
    const provider = this.config.getAIProvider();

    try {
      let response: string;

      if (provider === 'openai' || provider === 'azure-openai') {
        response = await this.reviewWithOpenAI(prompt);
      } else if (provider === 'anthropic') {
        response = await this.reviewWithAnthropic(prompt);
      } else if (provider === 'gemini') {
        response = await this.reviewWithGemini(prompt);
      } else {
        throw new Error(`Unsupported AI provider: ${provider}`);
      }

      // Parse JSON response
      return this.parseReviewResponse(response);
    } catch (error) {
      throw new Error(`AI review failed: ${error}`);
    }
  }

  /**
   * Generate PR description using AI
   */
  async generatePRDescription(prompt: string): Promise<string> {
    const provider = this.config.getAIProvider();

    try {
      if (provider === 'openai' || provider === 'azure-openai') {
        return await this.generateWithOpenAI(prompt);
      } else if (provider === 'anthropic') {
        return await this.generateWithAnthropic(prompt);
      } else if (provider === 'gemini') {
        return await this.generateWithGemini(prompt);
      } else {
        throw new Error(`Unsupported AI provider: ${provider}`);
      }
    } catch (error) {
      throw new Error(`PR description generation failed: ${error}`);
    }
  }

  /**
   * Review code using OpenAI
   */
  private async reviewWithOpenAI(prompt: string): Promise<string> {
    if (!this.openaiClient) {
      throw new Error('OpenAI client not initialized');
    }

    const completion = await this.openaiClient.chat.completions.create({
      model: this.config.getOpenAIModel(),
      messages: [
        {
          role: 'system',
          content: this.getSystemPrompt()
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: this.config.getMaxTokens(),
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    return completion.choices[0]?.message?.content || '{}';
  }

  /**
   * Review code using Anthropic
   */
  private async reviewWithAnthropic(prompt: string): Promise<string> {
    if (!this.anthropicClient) {
      throw new Error('Anthropic client not initialized');
    }

    const message = await this.anthropicClient.messages.create({
      model: this.config.getAnthropicModel(),
      max_tokens: this.config.getMaxTokens(),
      temperature: 0.3,
      system: this.getSystemPrompt(),
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const content = message.content[0];
    if (content.type === 'text') {
      return content.text;
    }

    return '{}';
  }

  /**
   * Generate PR description using OpenAI
   */
  private async generateWithOpenAI(prompt: string): Promise<string> {
    if (!this.openaiClient) {
      throw new Error('OpenAI client not initialized');
    }

    const completion = await this.openaiClient.chat.completions.create({
      model: this.config.getOpenAIModel(),
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: this.config.getMaxTokens(),
      temperature: 0.5
    });

    return completion.choices[0]?.message?.content || '';
  }

  /**
   * Generate PR description using Anthropic
   */
  private async generateWithAnthropic(prompt: string): Promise<string> {
    if (!this.anthropicClient) {
      throw new Error('Anthropic client not initialized');
    }

    const message = await this.anthropicClient.messages.create({
      model: this.config.getAnthropicModel(),
      max_tokens: this.config.getMaxTokens(),
      temperature: 0.5,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const content = message.content[0];
    if (content.type === 'text') {
      return content.text;
    }

    return '';
  }

  /**
   * Review code using Google Gemini
   */
  private async reviewWithGemini(prompt: string): Promise<string> {
    if (!this.geminiClient) {
      throw new Error('Gemini client not initialized');
    }

    const model = this.geminiClient.getGenerativeModel({
      model: `models/${this.config.getGeminiModel()}`
    });

    const fullPrompt = `${this.getSystemPrompt()}\n\n${prompt}`;
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;

    return response.text() || '{}';
  }

  /**
   * Generate PR description using Google Gemini
   */
  private async generateWithGemini(prompt: string): Promise<string> {
    if (!this.geminiClient) {
      throw new Error('Gemini client not initialized');
    }

    const model = this.geminiClient.getGenerativeModel({
      model: `models/${this.config.getGeminiModel()}`
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;

    return response.text() || '';
  }

  /**
   * Get system prompt (custom or default)
   */
  private getSystemPrompt(): string {
    const customPrompt = this.config.getCustomPrompt();
    if (customPrompt) {
      return customPrompt;
    }

    // Import default prompt
    const { REVIEW_SYSTEM_PROMPT } = require('../prompts/reviewPrompt');
    return REVIEW_SYSTEM_PROMPT;
  }

  /**
   * Parse AI review response
   */
  private parseReviewResponse(response: string): ReviewResult {
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || 
                       response.match(/```\s*([\s\S]*?)\s*```/);
      
      const jsonStr = jsonMatch ? jsonMatch[1] : response;
      const parsed = JSON.parse(jsonStr);

      return {
        riskLevel: parsed.riskLevel || 'MEDIUM',
        summary: parsed.summary || 'No summary provided',
        blockingIssues: parsed.blockingIssues || [],
        suggestions: parsed.suggestions || [],
        notes: parsed.notes || []
      };
    } catch (error) {
      throw new Error(`Failed to parse AI response: ${error}\n\nResponse: ${response}`);
    }
  }
}
