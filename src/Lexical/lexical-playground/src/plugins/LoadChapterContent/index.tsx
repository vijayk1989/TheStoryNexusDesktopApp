import { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useChapterStore } from '@/features/chapters/stores/useChapterStore';
import { useStoryContext } from '@/features/stories/context/StoryContext';

export function LoadChapterContentPlugin(): null {
    const [editor] = useLexicalComposerContext();
    const { currentChapterId } = useStoryContext();
    const { getChapter, currentChapter } = useChapterStore();
    const [hasLoaded, setHasLoaded] = useState(false);

    // Debug logging
    useEffect(() => {
        console.log('LoadChapterContent - Current Chapter ID:', currentChapterId);
        console.log('LoadChapterContent - Current Chapter:', currentChapter);
        console.log('LoadChapterContent - Has Loaded:', hasLoaded);
    }, [currentChapterId, currentChapter, hasLoaded]);

    useEffect(() => {
        if (currentChapterId) {
            console.log('LoadChapterContent - Fetching chapter:', currentChapterId);
            getChapter(currentChapterId);
            setHasLoaded(false);
        }
    }, [currentChapterId, getChapter]);

    useEffect(() => {
        if (!hasLoaded && currentChapter?.content && currentChapter.id === currentChapterId) {
            console.log('LoadChapterContent - Attempting to load content for:', currentChapter.id);
            try {
                const parsedState = editor.parseEditorState(currentChapter.content);
                editor.setEditorState(parsedState);
                console.log('LoadChapterContent - Content loaded successfully');
                setHasLoaded(true);
            } catch (error) {
                console.error('LoadChapterContent - Failed to load content:', error);
            }
        }
    }, [editor, currentChapter, currentChapterId, hasLoaded]);

    // Reset hasLoaded when chapter changes
    useEffect(() => {
        if (currentChapterId) {
            console.log('LoadChapterContent - Resetting hasLoaded for new chapter');
            setHasLoaded(false);
        }
    }, [currentChapterId]);

    return null;
}
