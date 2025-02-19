import { create } from 'zustand';
import { db } from '@/services/database';
import type { LorebookEntry } from '@/types/story';

interface LorebookState {
    entries: LorebookEntry[];
    isLoading: boolean;
    error: string | null;
    tagMap: Record<string, LorebookEntry>;
    buildTagMap: () => void;
    editorContent: string;
    setEditorContent: (content: string) => void;
    matchedEntries: Map<string, LorebookEntry>;
    setMatchedEntries: (entries: Map<string, LorebookEntry>) => void;

    // Actions
    loadEntries: (storyId: string) => Promise<void>;
    createEntry: (entry: Omit<LorebookEntry, 'id' | 'createdAt'>) => Promise<void>;
    updateEntry: (id: string, data: Partial<LorebookEntry>) => Promise<void>;
    deleteEntry: (id: string) => Promise<void>;
    updateEntryAndRebuildTags: (id: string, data: Partial<LorebookEntry>) => Promise<void>;

    // Queries
    getEntriesByTag: (tag: string) => LorebookEntry[];
    getEntriesByCategory: (category: LorebookEntry['category']) => LorebookEntry[];
}

export const useLorebookStore = create<LorebookState>((set, get) => ({
    entries: [],
    isLoading: false,
    error: null,
    tagMap: {},
    editorContent: '',
    matchedEntries: new Map(),

    buildTagMap: () => {
        const { entries } = get();
        const newTagMap: Record<string, LorebookEntry> = {};

        entries.forEach(entry => {
            entry.tags.forEach(tag => {
                // Add the full tag
                const normalizedTag = tag.toLowerCase().trim();
                newTagMap[normalizedTag] = entry;

                // If this tag is a single word, we're done
                if (!normalizedTag.includes(' ')) {
                    return;
                }

                // For multi-word tags, add individual words only if they're also standalone tags
                const words = normalizedTag.split(' ');
                words.forEach(word => {
                    // Only add individual words if they exist as standalone tags
                    if (entry.tags.some(t => t.toLowerCase() === word)) {
                        newTagMap[word] = entry;
                    }
                });
            });
        });

        console.log('Built tag map:', newTagMap);
        set({ tagMap: newTagMap });
    },

    loadEntries: async (storyId: string) => {
        set({ isLoading: true, error: null });
        try {
            const entries = await db.getLorebookEntriesByStory(storyId);
            set({ entries, isLoading: false });
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    createEntry: async (entryData) => {
        try {
            const id = crypto.randomUUID();
            const newEntry: LorebookEntry = {
                ...entryData,
                id,
                createdAt: new Date(),
            };

            await db.lorebookEntries.add(newEntry);
            set(state => ({ entries: [...state.entries, newEntry] }));
            get().buildTagMap();
        } catch (error) {
            set({ error: (error as Error).message });
            throw error;
        }
    },

    updateEntry: async (id, data) => {
        try {
            await db.lorebookEntries.update(id, data);
            set(state => ({
                entries: state.entries.map(entry =>
                    entry.id === id ? { ...entry, ...data } : entry
                ),
            }));
            get().buildTagMap();
        } catch (error) {
            set({ error: (error as Error).message });
            throw error;
        }
    },

    deleteEntry: async (id) => {
        try {
            await db.lorebookEntries.delete(id);
            set(state => ({
                entries: state.entries.filter(entry => entry.id !== id),
            }));
            get().buildTagMap();
        } catch (error) {
            set({ error: (error as Error).message });
            throw error;
        }
    },

    getEntriesByTag: (tag: string) => {
        const { entries } = get();
        return entries.filter(entry =>
            entry.tags.some(t => t.toLowerCase() === tag.toLowerCase())
        );
    },

    getEntriesByCategory: (category: LorebookEntry['category']) => {
        const { entries } = get();
        return entries.filter(entry => entry.category === category);
    },

    setEditorContent: (content: string) => set({ editorContent: content }),

    setMatchedEntries: (entries) => {
        console.log('Setting matched entries:', {
            entriesType: entries instanceof Map ? 'Map' : 'Other',
            size: entries.size,
            entries: Array.from(entries.entries())
        });
        set({ matchedEntries: entries });
    },

    // New combined action
    updateEntryAndRebuildTags: async (id, data) => {
        try {
            await db.lorebookEntries.update(id, data);
            set(state => ({
                entries: state.entries.map(entry =>
                    entry.id === id ? { ...entry, ...data } : entry
                ),
            }));
            // Rebuild tags after updating entry
            get().buildTagMap();
        } catch (error) {
            set({ error: (error as Error).message });
            throw error;
        }
    },
})); 