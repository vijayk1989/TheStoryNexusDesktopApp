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

// Complex types for JSON data
export interface ChapterContent {
    blocks: Array<{
        id: string;
        type: 'paragraph' | 'dialogue' | 'action' | 'description';
        content: string;
        metadata?: Record<string, unknown>;
    }>;
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