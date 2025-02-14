// Base types for common fields
interface BaseEntity {
    id: string;
    createdAt: Date;
}

// Core story type
export interface Story extends BaseEntity {
    title: string;
    author: string;
    language: string;
    synopsis?: string;
}

// Chapter structure
export interface Chapter extends BaseEntity {
    storyId: string;
    title: string;
    summary?: string;
    order: number;
    content: string;
    outline?: ChapterOutline;
    wordCount: number;
    povCharacter?: string;
    povType?: 'First Person' | 'Third Person Limited' | 'Third Person Omniscient';
}

export interface ChapterOutline {
    beats: Array<{
        id: string;
        description: string;
        completed: boolean;
        notes?: string;
    }>;
}

// World building types
export interface WorldData extends BaseEntity {
    storyId: string;
    name: string;
}

export type WorldDataEntryType =
    | 'character'
    | 'location'
    | 'item'
    | 'timeline'
    | 'synopsis'
    | 'relationship'
    | 'style';

export interface WorldDataEntry extends BaseEntity {
    worldDataId: string;
    name: string;
    type: WorldDataEntryType;
    description: string;
    tags: string[];
    metadata?: Record<string, unknown>;
}

// AI Chat types
export interface AIChat extends BaseEntity {
    storyId: string;
    title: string;
    messages: ChatMessage[];
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

// Prompt related types
export interface PromptMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface Prompt extends BaseEntity {
    name: string;
    description?: string;
    promptType: 'scene_beat' | 'gen_summary' | 'selection_specific' | 'continue_writing' | 'other';
    messages: PromptMessage[];
    allowedModels: string[];
    storyId?: string; // Optional: for story-specific prompts
}

// AI Provider and Model types
export type AIProvider = 'openai' | 'openrouter' | 'local';

export interface AIModel {
    id: string;
    name: string;
    provider: AIProvider;
    contextLength: number;
    enabled: boolean;
}

export interface AISettings extends BaseEntity {
    openaiKey?: string;
    openrouterKey?: string;
    availableModels: AIModel[];
    lastModelsFetch?: Date;
}

// Lorebook types
export interface LorebookEntry extends BaseEntity {
    storyId: string;
    name: string;
    description: string;
    category: 'character' | 'location' | 'item' | 'event' | 'note';
    // Tags are stored as an array of strings, can contain spaces and special characters
    tags: string[];
    metadata?: {
        type?: string;
        importance?: 'major' | 'minor' | 'background';
        status?: 'active' | 'inactive' | 'historical';
        relationships?: Array<{
            targetId: string;
            type: string;
            description?: string;
        }>;
        customFields?: Record<string, unknown>;
    };
}
