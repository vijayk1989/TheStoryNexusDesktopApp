import React, { useState } from 'react';
import {
    DecoratorNode,
    EditorConfig,
    NodeKey,
    SerializedLexicalNode,
    $getRoot,
    $createParagraphNode,
    $createTextNode,
    $getNodeByKey,
} from 'lexical';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

export type SerializedHelloWorldNode = SerializedLexicalNode & {
    type: 'helloworld';
    version: 1;
};

export class HelloWorldNode extends DecoratorNode<JSX.Element> {
    static getType(): string {
        return 'helloworld';
    }

    static clone(node: HelloWorldNode): HelloWorldNode {
        return new HelloWorldNode(node.__key);
    }

    // Implement the importJSON method as required by Lexical.
    static importJSON(_serializedNode: SerializedHelloWorldNode): HelloWorldNode {
        return new HelloWorldNode();
    }

    // In order to support JSON serialization, exportJSON should be implemented.
    exportJSON(): SerializedHelloWorldNode {
        return {
            ...super.exportJSON(),
            type: 'helloworld',
            version: 1,
        };
    }

    constructor(key?: NodeKey) {
        super(key);
    }

    /**
     * Since this is a decorator node, createDOM() only needs to return a container element.
     * Avoid adding inner text here to prevent duplicate rendering since `decorate()` returns the UI.
     */
    createDOM(config: EditorConfig): HTMLElement {
        const div = document.createElement('div');
        div.className = 'hello-world-node-container';
        // Optionally, apply minimal styling; the rendered content comes from `decorate()`.
        div.style.border = '2px solid transparent';
        return div;
    }

    updateDOM(prevNode: HelloWorldNode, dom: HTMLElement, config: EditorConfig): boolean {
        return false;
    }

    // Block-level behavior.
    isInline(): boolean {
        return false;
    }

    // Render the custom React component.
    decorate(): JSX.Element {
        return <HelloWorldComponent nodeKey={this.__key} />;
    }
}

interface HelloWorldComponentProps {
    nodeKey: NodeKey;
}

function HelloWorldComponent({ nodeKey }: HelloWorldComponentProps): JSX.Element {
    const [editor] = useLexicalComposerContext();
    const [collapsed, setCollapsed] = useState(false);
    const [command, setCommand] = useState('');
    const [streamedText, setStreamedText] = useState('');
    const [streamComplete, setStreamComplete] = useState(false);
    const [streaming, setStreaming] = useState(false);

    const handleGenerateProse = () => {
        // Log all text in the editor above this HelloWorldNode.
        editor.getEditorState().read(() => {
            const currentNode = $getNodeByKey(nodeKey);
            if (currentNode) {
                const parent = currentNode.getParent();
                if (parent) {
                    const siblings = parent.getChildren();
                    let textAbove = '';
                    for (const sibling of siblings) {
                        if (sibling === currentNode) break;
                        textAbove += sibling.getTextContent() + "\n";
                    }
                    console.log("Text above HelloWorldNode:", textAbove);
                }
            }
        });

        setStreamedText('');
        setStreamComplete(false);
        setStreaming(true);

        // Dummy 250-word story imitation. (Later, replace this by OpenAI streaming API)
        const dummyStory =
            "Once upon a time, in a magical land filled with wonder and mystery.";

        let index = 0;
        // Simulate streaming: append one character at a time.
        const intervalId = setInterval(() => {
            index++;
            setStreamedText(dummyStory.slice(0, index));
            if (index >= dummyStory.length) {
                clearInterval(intervalId);
                setStreaming(false);
                setStreamComplete(true);
            }
        }, 1); // 50ms per character (adjust as needed)
    };

    const handleAccept = () => {
        editor.update(() => {
            const paragraphNode = $createParagraphNode();
            paragraphNode.append($createTextNode(streamedText));
            const currentNode = $getNodeByKey(nodeKey);
            // Inserts the new paragraph directly after this HelloWorldNode.
            if (currentNode) {
                currentNode.insertAfter(paragraphNode);
            } else {
                // Fallback: append to root if node not found.
                $getRoot().append(paragraphNode);
            }
        });
        // Optionally clear the streaming text (or remove this node entirely later on).
        setStreamedText('');
        setStreamComplete(false);
    };

    const handleReject = () => {
        // Clear the streamed text and reset the streaming state.
        setStreamedText('');
        setStreamComplete(false);
    };

    return (
        <div className="border-2 border-black p-2">
            <div className="flex items-center justify-between">
                <span className="font-semibold">Command Panel</span>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    aria-label="Toggle collapse"
                    className="focus:outline-none"
                >
                    {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </button>
            </div>
            {!collapsed && (
                <div className="mt-2">
                    <input
                        type="text"
                        value={command}
                        onChange={(e) => setCommand(e.target.value)}
                        className="border rounded p-1 w-full"
                        placeholder="Enter command"
                    />
                    <button
                        className="mt-2 bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 rounded"
                        onClick={handleGenerateProse}
                        disabled={streaming}
                    >
                        Generate Prose
                    </button>
                </div>
            )}
            {streamedText && (
                <div className="mt-4 p-2 border-t border-dashed">
                    {streamedText}
                </div>
            )}
            {streamComplete && (
                <div className="mt-2 flex space-x-2">
                    <button
                        className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded"
                        onClick={handleAccept}
                    >
                        Accept
                    </button>
                    <button
                        className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
                        onClick={handleReject}
                    >
                        Reject
                    </button>
                </div>
            )}
        </div>
    );
}

export function $createHelloWorldNode(): HelloWorldNode {
    return new HelloWorldNode();
}

export function $isHelloWorldNode(node: any): node is HelloWorldNode {
    return node instanceof HelloWorldNode;
} 