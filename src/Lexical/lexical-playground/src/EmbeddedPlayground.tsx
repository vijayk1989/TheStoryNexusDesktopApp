import { useStoryContext } from '@/features/stories/context/StoryContext';
import { useChapterStore } from '@/features/chapters/stores/useChapterStore';
import { useEffect } from 'react';
import PlaygroundApp from './App' // using the lexical playground App component
import './index.css' // Ensure the CSS is imported

export default function EmbeddedPlayground() {
    const { currentChapterId } = useStoryContext();
    const { getChapter, currentChapter } = useChapterStore();

    useEffect(() => {
        if (currentChapterId) {
            getChapter(currentChapterId);
        }
    }, [currentChapterId, getChapter]);

    if (!currentChapterId || !currentChapter) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Select a chapter to start editing</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="p-2 border-b">
                <h2 className="text-lg font-semibold">{currentChapter.title}</h2>
            </div>
            <div className="flex-1 overflow-auto">
                <PlaygroundApp />
            </div>
        </div>
    );
}
