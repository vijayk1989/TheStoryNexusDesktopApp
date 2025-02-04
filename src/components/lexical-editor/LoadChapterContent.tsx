//// src/components/lexical-editor/LoadChapterContent.tsx
import React, { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useChapterStore } from '@/features/chapters/stores/useChapterStore';

export default function LoadChapterContent() {
    const [editor] = useLexicalComposerContext();
    const currentChapter = useChapterStore((state) => state.currentChapter);
    const [hasLoaded, setHasLoaded] = useState(false);

    useEffect(() => {
        if (!hasLoaded && currentChapter && currentChapter.content) {
            console.log(`Attempting to load chapter content for chapter id: ${currentChapter.id}`);
            try {
                // Parse the serialized editor state from the stored chapter content.
                const parsedState = editor.parseEditorState(currentChapter.content);
                console.log('Parsed editor state:', parsedState);
                // Set the editor state to the parsed state.
                editor.setEditorState(parsedState);
                console.log('Editor state set successfully from serialized content.');
            } catch (error) {
                console.error('Failed to set editor state from chapter content', error);
            }
            setHasLoaded(true);
        } else {
            if (!currentChapter) {
                console.log('No current chapter available in LoadChapterContent.');
            } else if (!currentChapter.content) {
                console.log('Current chapter has no saved content to load.');
            } else if (hasLoaded) {
                console.log('Chapter content already loaded in LoadChapterContent.');
            }
        }
    }, [editor, currentChapter, hasLoaded]);

    return null;
}