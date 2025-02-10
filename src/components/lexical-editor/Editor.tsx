import React, { useEffect, useState, useContext, useRef } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { LexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import Toolbar from './Toolbar';
import WordCountPlugin from './WordCountPlugin';
import UnderlinePlugin from './UnderlinePlugin';
import SaveChapterButton from './SaveChapterButton';
import { HelloWorldNode } from './HelloWorldNode';
import { useStoryContext } from '@/features/stories/context/StoryContext';
import { useChapterStore } from '@/features/chapters/stores/useChapterStore';
import FloatingTextFormatToolbarPlugin from './plugins/FloatingToolbar';

const initialConfig = {
    namespace: 'MyEditor',
    theme: {
        text: {
            underline: 'underline',
        },
    },
    nodes: [HelloWorldNode],
    onError: console.error,
};

/**
 * Custom hook that exposes the Lexical editor instance from LexicalComposerContext.
 * LexicalComposerContext returns an array where the first element is the editor instance.
 */
function useLexicalComposerContextCustom() {
    const context = useContext(LexicalComposerContext);
    if (!context) {
        throw new Error(
            'useLexicalComposerContextCustom must be used within a LexicalComposer'
        );
    }
    return context;
}

export default function Editor() {
    return (
        <LexicalComposer initialConfig={initialConfig}>
            <EditorInternal />
        </LexicalComposer>
    );
}

/**
 * EditorInternal uses our custom hook to grab the editor.
 * It then checks if the currently stored chapter (provided via React Context and Zustand)
 * has serialized content that needs to be loaded.
 */
function EditorInternal() {
    const [editor] = useLexicalComposerContextCustom();
    const { currentChapterId } = useStoryContext();
    const storedChapter = useChapterStore((state) => state.currentChapter);
    const [hasLoaded, setHasLoaded] = useState(false);
    const editorRef = useRef<HTMLDivElement>(null);

    // State to handle link edit mode required by the toolbar plugin
    const [isLinkEditMode, setIsLinkEditMode] = useState(false);

    useEffect(() => {
        if (
            !hasLoaded &&
            currentChapterId &&
            storedChapter &&
            storedChapter.id === currentChapterId &&
            storedChapter.content
        ) {
            try {
                const parsedState = editor.parseEditorState(storedChapter.content);
                editor.setEditorState(parsedState);
                console.log('Chapter content loaded successfully via context.');
            } catch (error) {
                console.error('Failed to load chapter content:', error);
            }
            setHasLoaded(true);
        }
    }, [currentChapterId, storedChapter, editor, hasLoaded]);

    return (
        <div className="flex flex-col h-full" ref={editorRef}>
            <Toolbar />
            <RichTextPlugin
                contentEditable={<ContentEditable className="flex-1 p-2" />}
                placeholder={
                    <div className="p-2 text-gray-500">
                        Enter some text...
                    </div>
                }
                ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <WordCountPlugin />
            <UnderlinePlugin />
            <FloatingTextFormatToolbarPlugin
                setIsLinkEditMode={setIsLinkEditMode}
                anchorElem={editorRef.current ?? document.body}
            />
            <div className="p-2">
                <SaveChapterButton />
            </div>
        </div>
    );
}
