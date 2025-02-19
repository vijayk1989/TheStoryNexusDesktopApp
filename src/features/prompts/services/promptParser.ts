import { StoryDatabase, db } from '@/services/database';
import {
    Chapter,
    LorebookEntry,
    Prompt,
    PromptMessage,
    PromptParserConfig,
    ParsedPrompt,
    PromptContext,
    VariableResolver
} from '@/types/story';

export class PromptParser {
    private readonly variableResolvers: Record<string, VariableResolver>;

    constructor(private database: StoryDatabase) {
        this.variableResolvers = {
            'matched_entries_chapter': this.resolveMatchedEntriesChapter.bind(this),
            'lorebook_chapter_matched_entries': this.resolveMatchedEntriesChapter.bind(this),
            'lorebook_scenebeat_matched_entries': this.resolveLorebookSceneBeatEntries.bind(this),
            'summaries': this.resolveChapterSummaries.bind(this),
            'previous_words': this.resolvePreviousWords.bind(this),
            'pov': this.resolvePoV.bind(this),
            'chapter_content': this.resolveChapterContent.bind(this),
        };
    }

    async parse(config: PromptParserConfig): Promise<ParsedPrompt> {
        try {
            console.log('Parsing prompt with config:', {
                promptId: config.promptId,
                storyId: config.storyId,
                chapterId: config.chapterId,
                scenebeat: config.scenebeat,
                previousWordsLength: config.previousWords?.length
            });

            const prompt = await this.database.prompts.get(config.promptId);
            if (!prompt) throw new Error('Prompt not found');

            console.log('Found prompt:', {
                name: prompt.name,
                type: prompt.promptType,
                messageCount: prompt.messages.length
            });

            const context = await this.buildContext(config);
            const parsedMessages = await this.parseMessages(prompt.messages, context);

            console.log('Parsed prompt result:', {
                messageCount: parsedMessages.length,
                preview: parsedMessages.map(m => ({
                    role: m.role,
                    contentPreview: m.content
                }))
            });

            return { messages: parsedMessages };
        } catch (error) {
            console.error('Error parsing prompt:', error);
            return {
                messages: [],
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    private async buildContext(config: PromptParserConfig): Promise<PromptContext> {
        const [chapters, currentChapter] = await Promise.all([
            this.database.chapters.where('storyId').equals(config.storyId).toArray(),
            config.chapterId ? this.database.chapters.get(config.chapterId) : undefined
        ]);

        return {
            ...config,
            chapters,
            currentChapter,
            matchedEntries: config.matchedEntries
        };
    }

    private async parseMessages(messages: PromptMessage[], context: PromptContext): Promise<PromptMessage[]> {
        return Promise.all(messages.map(async message => ({
            ...message,
            content: await this.parseContent(message.content, context)
        })));
    }

    private async parseContent(content: string, context: PromptContext): Promise<string> {
        // First remove comments
        let parsedContent = content.replace(/\/\*[\s\S]*?\*\//g, '');

        console.log('Parsing content with variables:', {
            originalLength: content.length,
            withoutComments: parsedContent.length,
            variables: parsedContent.match(/\{\{[^}]+\}\}/g)
        });

        // Handle function-style variables first
        const functionRegex = /\{\{(\w+)\((.*?)\)\}\}/g;
        const matches = Array.from(parsedContent.matchAll(functionRegex));

        for (const match of matches) {
            const [fullMatch, func, args] = match;
            if (func === 'previous_words') {
                const resolved = await this.resolvePreviousWords(context, args.trim());
                parsedContent = parsedContent.replace(fullMatch, resolved);
            }
        }

        // Handle regular variables
        parsedContent = await this.parseRegularVariables(parsedContent, context);

        // Clean up any extra whitespace from comment removal
        parsedContent = parsedContent.replace(/\n\s*\n\s*\n/g, '\n\n').trim();

        return parsedContent;
    }

    private async parseRegularVariables(content: string, context: PromptContext): Promise<string> {
        const variableRegex = /\{\{([^}]+)\}\}/g;
        let result = content;

        const matches = Array.from(content.matchAll(variableRegex));
        console.log('Found variables to parse:', matches.map(m => m[1]));

        for (const match of matches) {
            const [fullMatch, variable] = match;
            const [varName, ...params] = variable.trim().split(' ');

            if (varName === 'scenebeat' && context.scenebeat) {
                result = result.replace(fullMatch, context.scenebeat);
                continue;
            }

            const resolver = this.variableResolvers[varName];
            if (resolver) {
                const resolved = await resolver(context, ...params);
                result = result.replace(fullMatch, resolved);
            } else {
                console.warn(`No resolver found for variable: ${varName}`);
            }
        }

        return result;
    }

    // Variable resolvers
    private async resolveLorebookChapterEntries(context: PromptContext): Promise<string> {
        return this.resolveMatchedEntriesChapter(context);
    }

    private async resolveLorebookSceneBeatEntries(context: PromptContext): Promise<string> {
        if (!context.scenebeat) return '';
        // Implementation pending based on how scene beat tags are tracked
        return '';
    }

    private async resolveChapterSummaries(context: PromptContext): Promise<string> {
        if (!context.chapters) return '';
        const summaries = context.chapters
            .filter(ch => ch.summary && ch.order < (context.currentChapter?.order ?? Infinity))
            .map(ch => `Chapter ${ch.order}: ${ch.summary}`)
            .join('\n\n');
        return summaries;
    }

    private async resolvePreviousWords(context: PromptContext, count: string = '1000'): Promise<string> {
        console.log('Resolving previous words:', {
            requestedCount: count,
            availableText: context.previousWords?.length || 0
        });

        if (!context.previousWords) return '';

        // Parse the count parameter - default to 1000 if not a valid number
        const requestedWordCount = parseInt(count, 10) || 1000;

        // Split into words and take the last N words
        const words = context.previousWords.split(/\s+/);
        const selectedWords = words.slice(-(requestedWordCount + 1));

        console.log('Selected words:', {
            total: words.length,
            requested: requestedWordCount,
            selected: selectedWords.length
        });

        return selectedWords.join(' ');
    }

    private async resolvePoV(context: PromptContext): Promise<string> {
        if (!context.currentChapter?.povType) return '';
        const pov = `${context.currentChapter.povType}${context.currentChapter.povCharacter
            ? ` (${context.currentChapter.povCharacter})`
            : ''
            }`;
        return pov;
    }

    private async resolveCharacter(name: string, context: PromptContext): Promise<string> {
        const entries = await this.database.lorebookEntries
            .where('[storyId+category+name]')
            .equals([context.storyId, 'character', name])
            .first();

        return entries ? this.formatLorebookEntries([entries]) : '';
    }

    private async resolveMatchedEntriesChapter(context: PromptContext): Promise<string> {
        console.log('Resolving matched entries chapter:', {
            hasMatchedEntries: !!context.matchedEntries,
            entriesSize: context.matchedEntries?.size,
            entries: Array.from(context.matchedEntries || []).map(e => ({
                id: e.id,
                name: e.name,
                category: e.category,
                importance: e.metadata?.importance
            }))
        });

        if (!context.matchedEntries || context.matchedEntries.size === 0) {
            console.log('No matched entries found');
            return '';
        }

        // Sort entries by importance
        const entries = Array.from(context.matchedEntries);
        entries.sort((a, b) => {
            const importanceOrder = { 'major': 0, 'minor': 1, 'background': 2 };
            const aImportance = a.metadata?.importance || 'background';
            const bImportance = b.metadata?.importance || 'background';
            return importanceOrder[aImportance] - importanceOrder[bImportance];
        });

        const formatted = this.formatLorebookEntries(entries);
        console.log('Formatted entries:', {
            entriesCount: entries.length,
            formattedLength: formatted.length,
            preview: formatted
        });

        return formatted;
    }

    private formatLorebookEntries(entries: LorebookEntry[]): string {
        return entries.map(entry => {
            const metadata = entry.metadata;
            return `${entry.category.toUpperCase()}: ${entry.name}
Type: ${metadata?.type || 'Unknown'}
Importance: ${metadata?.importance || 'Unknown'}
Status: ${metadata?.status || 'Unknown'}
Description: ${entry.description}
${metadata?.relationships?.length ? '\nRelationships:\n' +
                    metadata.relationships.map(r => `- ${r.type}: ${r.description}`).join('\n')
                    : ''}`;
        }).join('\n\n');
    }

    private async resolveChapterContent(context: PromptContext): Promise<string> {
        if (!context.currentChapter) return '';

        // Use the plain text content if available in additionalContext
        if (context.additionalContext?.plainTextContent) {
            console.log('Using plain text content for chapter:', {
                chapterId: context.currentChapter.id,
                contentLength: context.additionalContext.plainTextContent.length,
                preview: context.additionalContext.plainTextContent.slice(0, 100) + '...'
            });
            return context.additionalContext.plainTextContent;
        }

        console.warn('No plain text content found for chapter:', context.currentChapter.id);
        return '';
    }
}

export const createPromptParser = () => new PromptParser(db); 