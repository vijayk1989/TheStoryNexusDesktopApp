import Dexie, { Table } from 'dexie';
import {
    Story,
    Chapter,
    WorldData,
    WorldDataEntry,
    AIChat
} from '../types/story';

export class StoryDatabase extends Dexie {
    stories!: Table<Story>;
    chapters!: Table<Chapter>;
    worldData!: Table<WorldData>;
    worldDataEntries!: Table<WorldDataEntry>;
    aiChats!: Table<AIChat>;

    constructor() {
        super('StoryDatabase');

        this.version(1).stores({
            stories: 'id, title, createdAt, language',
            chapters: 'id, storyId, order, createdAt',
            worldData: 'id, storyId, createdAt',
            worldDataEntries: 'id, worldDataId, type, *tags',
            aiChats: 'id, storyId, createdAt'
        });
    }

    // Helper method to create a new story with initial structure
    async createNewStory(storyData: Omit<Story, 'id' | 'createdAt'>): Promise<string> {
        return await this.transaction('rw',
            [this.stories, this.worldData],
            async () => {
                const storyId = crypto.randomUUID();

                // Create the story
                await this.stories.add({
                    id: storyId,
                    createdAt: new Date(),
                    ...storyData
                });

                // Create initial world data
                await this.worldData.add({
                    id: crypto.randomUUID(),
                    storyId,
                    name: 'Story World',
                    createdAt: new Date()
                });

                return storyId;
            });
    }

    // Helper method to get complete story structure
    async getFullStory(storyId: string) {
        const story = await this.stories.get(storyId);
        if (!story) return null;

        const chapters = await this.chapters
            .where('storyId')
            .equals(storyId)
            .sortBy('order');

        const worldData = await this.worldData
            .where('storyId')
            .equals(storyId)
            .first();

        const worldDataEntries = worldData
            ? await this.worldDataEntries
                .where('worldDataId')
                .equals(worldData.id)
                .toArray()
            : [];

        return {
            ...story,
            chapters,
            worldBuilding: worldData ? {
                ...worldData,
                entries: worldDataEntries
            } : null
        };
    }
}

export const db = new StoryDatabase(); 