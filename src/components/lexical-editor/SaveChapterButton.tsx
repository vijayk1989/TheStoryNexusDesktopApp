import React from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Button } from '@/components/ui/button';
import { useChapterStore } from '@/features/chapters/stores/useChapterStore';
import { useStoryContext } from '@/features/stories/context/StoryContext';
import { toast } from 'react-toastify';
import { Save } from 'lucide-react';
import { TOAST_CLOSE_TIMER, TOAST_POSITION } from '@/constants';


export default function SaveChapterButton() {
    const [editor] = useLexicalComposerContext();
    const { currentChapterId } = useStoryContext();
    const currentChapter = useChapterStore((state) => state.currentChapter);
    const updateChapter = useChapterStore((state) => state.updateChapter);

    const handleSave = async () => {
        if (!currentChapterId || !currentChapter || currentChapter.id !== currentChapterId) {
            toast.error('No valid chapter to save. Please select or create a chapter first.', {
                position: TOAST_POSITION,
                autoClose: TOAST_CLOSE_TIMER,
            });

            return;
        }


        try {
            editor.update(() => {
                const editorState = editor.getEditorState();
                const serializedState = JSON.stringify(editorState.toJSON());

                updateChapter(currentChapterId, { content: serializedState })
                    .then(() => {
                        toast.success('Chapter saved successfully!', {
                            position: TOAST_POSITION,
                            autoClose: TOAST_CLOSE_TIMER,
                        });
                    })
                    .catch((error) => {
                        console.error('Failed to update chapter:', error);
                        toast.error('Failed to save chapter', {
                            position: TOAST_POSITION,
                            autoClose: TOAST_CLOSE_TIMER,
                        });


                    });
            });
        } catch (error) {
            console.error('Editor update failed in SaveChapterButton:', error);
            toast.error('Failed to save chapter content', {
                position: TOAST_POSITION,
                autoClose: TOAST_CLOSE_TIMER,
            });

        }
    };


    return (
        <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Chapter
        </Button>
    );
} 