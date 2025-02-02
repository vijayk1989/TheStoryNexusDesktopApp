import { create } from 'zustand';
import { db } from '../services/database';
import type { Chapter } from '../types/story';

interface ChapterState {
    chapters: Chapter[];
    currentChapter: Chapter | null;
    loading: boolean;
    error: string | null;
    summariesSoFar: string;

    // Actions
    fetchChapters: (storyId: string) => Promise<void>;
    getChapter: (id: string) => Promise<void>;
    createChapter: (chapterData: Omit<Chapter, 'id' | 'createdAt' | 'wordCount'>) => Promise<string>;
    updateChapter: (id: string, chapterData: Partial<Chapter>) => Promise<void>;
    deleteChapter: (id: string) => Promise<void>;
    setCurrentChapter: (chapter: Chapter | null) => void;
    getPreviousChapterSummaries: (storyId: string, currentOrder: number) => Promise<string>;
    clearError: () => void;
    updateChapterSummary: (id: string, summary: string) => Promise<void>;
    updateChapterSummaryOptimistic: (id: string, summary: string) => Promise<void>;
}

export const useChapterStore = create<ChapterState>((set, _get) => ({
    chapters: [],
    currentChapter: null,
    loading: false,
    error: null,
    summariesSoFar: '',

    // Fetch all chapters for a story
    fetchChapters: async (storyId: string) => {
        set({ loading: true, error: null });
        try {
            const chapters = await db.chapters
                .where('storyId')
                .equals(storyId)
                .sortBy('order');
            set({ chapters, loading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch chapters',
                loading: false
            });
        }
    },

    // Get a single chapter
    getChapter: async (id: string) => {
        set({ loading: true, error: null });
        try {
            const chapter = await db.chapters.get(id);
            if (!chapter) {
                throw new Error('Chapter not found');
            }
            set({ currentChapter: chapter, loading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch chapter',
                loading: false
            });
        }
    },

    // Create a new chapter
    createChapter: async (chapterData) => {
        set({ loading: true, error: null });
        try {
            // Get the highest order number for this story
            const highestChapter = await db.chapters
                .where('storyId')
                .equals(chapterData.storyId)
                .reverse()
                .first();

            const nextOrder = highestChapter ? highestChapter.order + 1 : 1;
            const chapterId = crypto.randomUUID();

            await db.chapters.add({
                ...chapterData,
                id: chapterId,
                order: nextOrder,
                createdAt: new Date(),
                wordCount: chapterData.content.split(/\s+/).length
            });

            const newChapter = await db.chapters.get(chapterId);
            if (!newChapter) throw new Error('Failed to create chapter');

            set(state => ({
                chapters: [...state.chapters, newChapter],
                currentChapter: newChapter,
                loading: false
            }));

            return chapterId;
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to create chapter',
                loading: false
            });
            throw error;
        }
    },

    // Update a chapter
    updateChapter: async (id: string, chapterData: Partial<Chapter>) => {
        set({ loading: true, error: null });
        try {
            // If content is being updated, recalculate word count
            if (chapterData.content) {
                chapterData.wordCount = chapterData.content.split(/\s+/).length;
            }

            await db.chapters.update(id, chapterData);
            const updatedChapter = await db.chapters.get(id);
            if (!updatedChapter) throw new Error('Chapter not found after update');

            set(state => ({
                chapters: state.chapters.map(chapter =>
                    chapter.id === id ? updatedChapter : chapter
                ),
                currentChapter: state.currentChapter?.id === id ? updatedChapter : state.currentChapter,
                loading: false
            }));
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to update chapter',
                loading: false
            });
        }
    },

    // Delete a chapter
    deleteChapter: async (id: string) => {
        set({ loading: true, error: null });
        try {
            await db.chapters.delete(id);
            set(state => ({
                chapters: state.chapters.filter(chapter => chapter.id !== id),
                currentChapter: state.currentChapter?.id === id ? null : state.currentChapter,
                loading: false
            }));
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to delete chapter',
                loading: false
            });
        }
    },

    // Set current chapter
    setCurrentChapter: (chapter) => {
        set({ currentChapter: chapter });
    },

    // Get summaries for previous chapters
    getPreviousChapterSummaries: async (storyId: string, currentOrder: number) => {
        try {
            const previousChapters = await db.chapters
                .where('storyId')
                .equals(storyId)
                .filter(chapter => chapter.order <= currentOrder)
                .sortBy('order');

            const summaries = previousChapters
                .map(chapter => chapter.summary?.trim() || '')
                .filter(Boolean)
                .join(' ');

            set({ summariesSoFar: summaries });
            return summaries;
        } catch (error) {
            console.error('Error getting previous chapter summaries:', error);
            return '';
        }
    },

    // Clear error
    clearError: () => {
        set({ error: null });
    },

    // Add new dedicated summary update function
    updateChapterSummary: async (id: string, summary: string) => {
        set({ loading: true, error: null });
        try {
            await db.chapters.update(id, { summary });
            const updatedChapter = await db.chapters.get(id);
            if (!updatedChapter) throw new Error('Chapter not found after update');

            set(state => ({
                chapters: state.chapters.map(chapter =>
                    chapter.id === id ? updatedChapter : chapter
                ),
                currentChapter: state.currentChapter?.id === id ? updatedChapter : state.currentChapter,
                loading: false
            }));
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to update chapter summary',
                loading: false
            });
        }
    },

    // Add a new action that doesn't trigger full chapter list update
    updateChapterSummaryOptimistic: async (id: string, summary: string) => {
        try {
            await db.chapters.update(id, { summary });
            // Optimistic update
            set(state => ({
                chapters: state.chapters.map(chapter =>
                    chapter.id === id
                        ? { ...chapter, summary }
                        : chapter
                )
            }));
        } catch (error) {
            console.error('Failed to update summary:', error);
            throw error;
        }
    },
})); 