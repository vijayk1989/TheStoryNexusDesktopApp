import { create } from 'zustand';
import {
    AIModel,
    AIProvider,
    AISettings,
    PromptParserConfig,
    PromptMessage
} from '@/types/story';
import { aiService } from '@/services/ai/AIService';
import { db } from '@/services/database';
import { createPromptParser } from '@/features/prompts/services/promptParser';

interface AIState {
    settings: AISettings | null;
    isInitialized: boolean;
    isLoading: boolean;
    error: string | null;

    // Initialize AI service and load settings
    initialize: () => Promise<void>;

    // Model management
    getAvailableModels: (provider?: AIProvider) => Promise<AIModel[]>;
    updateProviderKey: (provider: AIProvider, key: string) => Promise<void>;

    // Generation methods
    generateWithLocalModel: (messages: PromptMessage[]) => Promise<Response>;
    processStreamedResponse: (
        response: Response,
        onToken: (text: string) => void,
        onComplete: () => void,
        onError: (error: Error) => void
    ) => Promise<void>;

    generateWithPrompt: (config: PromptParserConfig) => Promise<Response>;
}

export const useAIStore = create<AIState>((set, get) => ({
    settings: null,
    isInitialized: false,
    isLoading: false,
    error: null,

    initialize: async () => {
        set({ isLoading: true, error: null });
        try {
            await aiService.initialize();
            const settings = await db.aiSettings.toArray();
            set({
                settings: settings[0] || null,
                isInitialized: true,
                isLoading: false
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to initialize AI',
                isLoading: false
            });
        }
    },

    getAvailableModels: async (provider?: AIProvider) => {
        if (!get().isInitialized) {
            await get().initialize();
        }
        return aiService.getAvailableModels(provider);
    },

    updateProviderKey: async (provider: AIProvider, key: string) => {
        set({ isLoading: true, error: null });
        try {
            await aiService.updateKey(provider, key);
            const settings = await db.aiSettings.toArray();
            set({ settings: settings[0], isLoading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to update API key',
                isLoading: false
            });
            throw error;
        }
    },

    generateWithLocalModel: async (messages: PromptMessage[]) => {
        if (!get().isInitialized) {
            await get().initialize();
        }
        return aiService.generateWithLocalModel(messages);
    },

    processStreamedResponse: async (response, onToken, onComplete, onError) => {
        await aiService.processStreamedResponse(response, onToken, onComplete, onError);
    },

    generateWithPrompt: async (config: PromptParserConfig) => {
        if (!get().isInitialized) {
            await get().initialize();
        }

        const promptParser = createPromptParser();
        const { messages, error } = await promptParser.parse(config);

        if (error || !messages.length) {
            throw new Error(error || 'Failed to parse prompt');
        }

        return get().generateWithLocalModel(messages);
    }
}));
