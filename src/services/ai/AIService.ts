import { AIModel, AIProvider, AISettings, PromptMessage } from '@/types/story';
import { db } from '../database';

export class AIService {
    private static instance: AIService;
    private settings: AISettings | null = null;
    private readonly LOCAL_API_URL = 'http://localhost:1234/v1';

    private constructor() { }

    static getInstance(): AIService {
        if (!AIService.instance) {
            AIService.instance = new AIService();
        }
        return AIService.instance;
    }

    async initialize() {
        // Load or create settings
        const settings = await db.aiSettings.toArray();
        this.settings = settings[0] || await this.createInitialSettings();
    }

    private async createInitialSettings(): Promise<AISettings> {
        const settings: AISettings = {
            id: crypto.randomUUID(),
            createdAt: new Date(),
            availableModels: [{
                id: 'local/llama-3.2-3b-instruct',
                name: 'Llama 3.2 3B Instruct',
                provider: 'local',
                contextLength: 4096,
                enabled: true
            }],
        };
        await db.aiSettings.add(settings);
        return settings;
    }

    async updateKey(provider: AIProvider, key: string) {
        if (!this.settings) throw new Error('AIService not initialized');

        const update: Partial<AISettings> = {
            ...(provider === 'openai' && { openaiKey: key }),
            ...(provider === 'openrouter' && { openrouterKey: key })
        };

        await db.aiSettings.update(this.settings.id, update);
        Object.assign(this.settings, update);

        // Fetch available models when key is updated
        await this.fetchAvailableModels(provider);
    }

    private async fetchAvailableModels(provider: AIProvider) {
        if (!this.settings) throw new Error('AIService not initialized');

        try {
            let models: AIModel[] = [];

            if (provider === 'openai' && this.settings.openaiKey) {
                models = await this.fetchOpenAIModels();
            } else if (provider === 'openrouter' && this.settings.openrouterKey) {
                models = await this.fetchOpenRouterModels();
            }

            // Update only models from this provider, keep others
            const existingModels = this.settings.availableModels.filter(m => m.provider !== provider);
            const updatedModels = [...existingModels, ...models];

            await db.aiSettings.update(this.settings.id, {
                availableModels: updatedModels,
                lastModelsFetch: new Date()
            });

            this.settings.availableModels = updatedModels;
            this.settings.lastModelsFetch = new Date();
        } catch (error) {
            console.error('Error fetching models:', error);
            throw error;
        }
    }

    private async fetchOpenAIModels(): Promise<AIModel[]> {
        // Implementation for OpenAI models fetch
        const response = await fetch('https://api.openai.com/v1/models', {
            headers: {
                'Authorization': `Bearer ${this.settings?.openaiKey}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch OpenAI models');
        const data = await response.json();

        return data.data
            .filter((model: any) => model.id.startsWith('gpt'))
            .map((model: any) => ({
                id: model.id,
                name: model.id,
                provider: 'openai' as AIProvider,
                contextLength: model.context_length || 4096,
                enabled: true
            }));
    }

    private async fetchOpenRouterModels(): Promise<AIModel[]> {
        const response = await fetch('https://openrouter.ai/api/v1/models', {
            headers: {
                'Authorization': `Bearer ${this.settings?.openrouterKey}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch OpenRouter models');
        const data = await response.json();

        return data.data.map((model: any) => ({
            id: model.id,
            name: model.name,
            provider: 'openrouter' as AIProvider,
            contextLength: model.context_length,
            enabled: true
        }));
    }

    async getAvailableModels(provider?: AIProvider): Promise<AIModel[]> {
        if (!this.settings) throw new Error('AIService not initialized');

        // Ensure settings are up to date
        const dbSettings = await db.aiSettings.get(this.settings.id);
        if (dbSettings) {
            this.settings = dbSettings;
        }

        return provider
            ? this.settings.availableModels.filter(m => m.provider === provider)
            : this.settings.availableModels;
    }

    async generateWithLocalModel(messages: PromptMessage[]): Promise<Response> {
        const response = await fetch(`${this.LOCAL_API_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages,
                stream: true,
                model: 'local/llama-3.2-3b-instruct',
                temperature: 0.7,
                max_tokens: 2048,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to generate with local model');
        }

        return response;
    }

    async processStreamedResponse(response: Response,
        onToken: (text: string) => void,
        onComplete: () => void,
        onError: (error: Error) => void
    ) {
        try {
            const reader = response.body?.getReader();
            if (!reader) throw new Error('No response body');

            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') {
                            onComplete();
                            return;
                        }

                        try {
                            const json = JSON.parse(data);
                            const content = json.choices[0]?.delta?.content;
                            if (content) {
                                onToken(content);
                            }
                        } catch (e) {
                            console.warn('Failed to parse JSON:', e);
                        }
                    }
                }
            }
            onComplete();
        } catch (error) {
            onError(error as Error);
        }
    }
}

export const aiService = AIService.getInstance(); 