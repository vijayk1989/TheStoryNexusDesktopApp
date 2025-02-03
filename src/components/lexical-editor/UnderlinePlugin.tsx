import React, { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $createTextNode, TextNode } from 'lexical';
import debounce from 'lodash/debounce';

// Dummy object mapping words to descriptions (not used here, but could be later for tooltips, etc.)
const underlineMap = {
    Harry: "the boy who lived",
    Hermione: "The brightest witch of her age"
};

// Updated helper function to recursively collect all TextNodes.
// This version checks if the node is a TextNode or if it supports getChildren().
function getAllTextNodes(node: any): TextNode[] {
    // If it's already a TextNode, return it in an array.
    if (node instanceof TextNode) {
        return [node];
    }
    // If the node doesn't support getChildren (i.e. not an element) return empty.
    if (typeof node.getChildren !== 'function') {
        return [];
    }
    // Otherwise recursively retrieve text nodes from its children.
    let nodes: TextNode[] = [];
    const children = node.getChildren();
    for (const child of children) {
        nodes = nodes.concat(getAllTextNodes(child));
    }
    return nodes;
}

export default function UnderlinePlugin() {
    const [editor] = useLexicalComposerContext();

    // Construct regex that matches any key in the underlineMap with word boundaries.
    const keys = Object.keys(underlineMap);
    const regex = new RegExp(`\\b(${keys.join('|')})\\b`, 'g');
    console.log("UnderlinePlugin mounted. Underline keys:", keys);
    console.log("Constructed regex:", regex);

    useEffect(() => {
        // Debounce the transform so we only do it after the user stops typing for 500ms.
        const debouncedTransform = debounce(() => {
            console.log("UnderlinePlugin transform triggered");
            // Perform an update so we can modify nodes.
            editor.update(() => {
                const root = $getRoot();
                const textNodes = getAllTextNodes(root);
                console.log("Found text nodes count:", textNodes.length);
                textNodes.forEach(textNode => {
                    const text = textNode.getTextContent();
                    console.log("Processing text node with content:", text);

                    // Skip processing if this text node already has underline formatting.
                    if (textNode.hasFormat('underline')) {
                        console.log("Already underlined, skipping text node:", text);
                        return;
                    }
                    if (!text) return;
                    if (regex.test(text)) {
                        console.log(`Regex matched in text: "${text}"`);
                        // Reset regex state since we're reusing it.
                        regex.lastIndex = 0;
                        // Split text using a capturing group so that matches are included in the results.
                        const parts = text.split(new RegExp(`(${keys.join('|')})`, 'g'));
                        console.log("Split parts:", parts);
                        if (parts.length > 1) {
                            const newNodes: TextNode[] = [];
                            parts.forEach(part => {
                                if (keys.includes(part)) {
                                    console.log(`Match found for part: "${part}"`);
                                    // Create a new text node with the matching word.
                                    const matchedNode = $createTextNode(part);
                                    // Apply underline formatting if not already set.
                                    if (!matchedNode.hasFormat('underline')) {
                                        matchedNode.toggleFormat('underline');
                                        console.log(`Underlined node created for: "${part}"`);
                                    }
                                    newNodes.push(matchedNode);
                                } else if (part !== '') {
                                    newNodes.push($createTextNode(part));
                                } else {
                                    console.log("Encountered an empty string part.");
                                }
                            });
                            // Insert the new text nodes before the original node.
                            newNodes.forEach(newNode => {
                                textNode.insertBefore(newNode);
                            });
                            // Remove the original text node.
                            textNode.remove();
                            console.log("Replaced original text node with new nodes.");
                        }
                    }
                });
            });
        }, 500);

        // Register the update listener.
        const unregister = editor.registerUpdateListener(() => {
            console.log("Editor update detected; scheduling underline transform");
            debouncedTransform();
        });

        // Cleanup on unmount.
        return () => {
            unregister();
            debouncedTransform.cancel();
        };
    }, [editor]);

    return null;
} 