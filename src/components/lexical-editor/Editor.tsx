import React from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import Toolbar from './Toolbar';
import WordCountPlugin from './WordCountPlugin';
import UnderlinePlugin from './UnderlinePlugin';
import { HelloWorldNode } from './HelloWorldNode';

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

export default function Editor() {
    return (
        <LexicalComposer initialConfig={initialConfig}>
            <div className="flex flex-col h-full">
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
            </div>
        </LexicalComposer>
    );
}
