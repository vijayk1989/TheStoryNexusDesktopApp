import React from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { FORMAT_TEXT_COMMAND, $getSelection, $createParagraphNode } from 'lexical';
import type { TextFormatType } from 'lexical';
import { Bold, Italic, Underline, Strikethrough, Plus } from 'lucide-react';
import { $createHelloWorldNode } from './HelloWorldNode';

export default function Toolbar() {
    const [editor] = useLexicalComposerContext();

    const applyFormat = (format: TextFormatType) => {
        // Dispatch the text formatting command.
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    };

    const insertHelloWorld = () => {
        editor.update(() => {
            const helloNode = $createHelloWorldNode();
            // Create an empty paragraph node to insert after the hello world element.
            const paragraphNode = $createParagraphNode();
            const selection = $getSelection();
            if (selection) {
                // Insert the HelloWorldNode followed by an empty paragraph.
                selection.insertNodes([helloNode, paragraphNode]);
            }
        });
    };

    return (
        <div className="toolbar flex items-center space-x-2 p-2 border-b border-gray-300">
            <button
                onClick={() => applyFormat('bold')}
                aria-label="Bold"
                className="hover:bg-gray-200 p-1 rounded"
            >
                <Bold size={16} />
            </button>
            <button
                onClick={() => applyFormat('italic')}
                aria-label="Italic"
                className="hover:bg-gray-200 p-1 rounded"
            >
                <Italic size={16} />
            </button>
            <button
                onClick={() => applyFormat('underline')}
                aria-label="Underline"
                className="hover:bg-gray-200 p-1 rounded"
            >
                <Underline size={16} />
            </button>
            <button
                onClick={() => applyFormat('strikethrough')}
                aria-label="Strikethrough"
                className="hover:bg-gray-200 p-1 rounded"
            >
                <Strikethrough size={16} />
            </button>
            <button
                onClick={insertHelloWorld}
                aria-label="Insert Hello World"
                className="hover:bg-gray-200 p-1 rounded"
            >
                <Plus size={16} />
            </button>
        </div>
    );
} 