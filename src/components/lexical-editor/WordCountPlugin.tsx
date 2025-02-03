import React, { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot } from 'lexical';

export default function WordCountPlugin() {
    const [editor] = useLexicalComposerContext();
    const [wordCount, setWordCount] = useState(0);

    useEffect(() => {
        // Register an update listener with the editor
        const unregister = editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                // Retrieve the root node and get its text content.
                const root = $getRoot();
                const text = root.getTextContent();
                // Count words using a regex match on word characters.
                const words = text.match(/\w+/g);
                setWordCount(words ? words.length : 0);
            });
        });

        // Cleanup the listener on unmount.
        return unregister;
    }, [editor]);

    return (
        <div className="word-count p-2 text-sm text-gray-500">
            Word Count: {wordCount}
        </div>
    );
}
