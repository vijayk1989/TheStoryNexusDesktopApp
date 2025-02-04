import React from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Button } from '@/components/ui/button';
import { useChapterStore } from '@/features/chapters/stores/useChapterStore';

export default function SaveChapterButton() {
    const [editor] = useLexicalComposerContext();
    const currentChapter = useChapterStore((state) => state.currentChapter);
    const updateChapter = useChapterStore((state) => state.updateChapter);

    const handleSave = async () => {
        if (!currentChapter) {
            console.warn('No current chapter to save. Please select or create a chapter first.');
            return;
        }

        console.log(`Attempting to save chapter with id: ${currentChapter.id}`);

        try {
            editor.update(() => {
                console.log('Editor update started for saving chapter.');
                // Get the complete editor state and serialize it
                const editorState = editor.getEditorState();
                const serializedState = JSON.stringify(editorState.toJSON());
                console.log('Serialized editor state:', serializedState);

                // Persist the serialized state into the current chapter in the database.
                updateChapter(currentChapter.id, { content: serializedState })
                    .then(() => console.log('Chapter updated successfully.'))
                    .catch((error) => console.error('Failed to update chapter', error));
            });
        } catch (error) {
            console.error('Editor update failed in SaveChapterButton', error);
        }
    };

    return (
        <Button onClick={handleSave}>
            Save Chapter
        </Button>
    );
} 