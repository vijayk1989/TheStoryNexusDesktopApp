import type {
    LexicalNode,
    NodeKey,
    SerializedLexicalNode,
    Spread,
} from 'lexical';

import { $applyNodeReplacement, $createParagraphNode, $createTextNode, $getNodeByKey, DecoratorNode } from 'lexical';
import { Suspense, useState, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';
import { usePromptStore } from '@/features/prompts/store/promptStore';
import { AIModel, Prompt, PromptParserConfig } from '@/types/story';
import { useAIStore } from '@/features/ai/stores/useAIStore';
import { toast } from "react-toastify";
import { Textarea } from "@/components/ui/textarea";
import { useStoryContext } from '@/features/stories/context/StoryContext';
import { useLorebookStore } from '@/features/lorebook/stores/useLorebookStore';
import { AIGenerateMenu } from '@/components/ui/ai-generate-menu';
import { AllowedModel } from '@/types/story';
import { debounce } from 'lodash';
import { LorebookEntry } from '@/types/story';

export type SerializedSceneBeatNode = Spread<
    {
        type: 'scene-beat';
        version: 1;
        command: string;
    },
    SerializedLexicalNode
>;

function SceneBeatComponent({ nodeKey }: { nodeKey: NodeKey }): JSX.Element {
    const [editor] = useLexicalComposerContext();
    const { currentStoryId, currentChapterId } = useStoryContext();
    const [collapsed, setCollapsed] = useState(false);
    const [command, setCommand] = useState('');
    const [streamedText, setStreamedText] = useState('');
    const [streamComplete, setStreamComplete] = useState(false);
    const [streaming, setStreaming] = useState(false);
    const { prompts, fetchPrompts, isLoading, error } = usePromptStore();
    const { generateWithPrompt, processStreamedResponse } = useAIStore();
    const { matchedEntries, tagMap, setMatchedEntries } = useLorebookStore();
    const [localMatchedEntries, setLocalMatchedEntries] = useState<Map<string, LorebookEntry>>(new Map());

    useEffect(() => {
        fetchPrompts().catch(error => {
            toast.error('Failed to load prompts');
            console.error('Error loading prompts:', error);
        });
    }, [fetchPrompts]);

    useEffect(() => {
        editor.getEditorState().read(() => {
            const node = $getNodeByKey(nodeKey);
            if (node instanceof SceneBeatNode) {
                setCommand(node.getCommand());
            }
        });
    }, [editor, nodeKey]);

    // Register transform to sync command changes
    useEffect(() => {
        return editor.registerNodeTransform(SceneBeatNode, (node) => {
            if (node.getKey() === nodeKey) {
                const currentCommand = node.getCommand();
                if (currentCommand !== command) {
                    node.setCommand(command);
                }
            }
        });
    }, [editor, nodeKey, command]);

    // Add debounced tag matching effect for the command textarea
    useEffect(() => {
        const matchTags = () => {
            const matchedEntries = new Map<string, LorebookEntry>();

            // Check each tag against the command text
            Object.entries(tagMap).forEach(([tag, entry]) => {
                if (command.toLowerCase().includes(tag.toLowerCase())) {
                    matchedEntries.set(entry.id, entry);
                }
            });

            setLocalMatchedEntries(matchedEntries);
        };

        // Debounce the matching to avoid excessive updates
        const debouncedMatch = debounce(matchTags, 500);
        debouncedMatch();

        return () => {
            debouncedMatch.cancel();
        };
    }, [command, tagMap]);

    const handleDelete = () => {
        editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if (node) {
                node.remove();
            }
        });
    };

    const handleGenerateWithPrompt = async (prompt: Prompt, model: AllowedModel) => {
        if (!command.trim()) {
            toast.error('Please enter a scene beat description');
            return;
        }

        if (!currentStoryId || !currentChapterId) {
            toast.error('No story or chapter context found');
            return;
        }

        setStreaming(true);
        setStreamedText('');
        setStreamComplete(false);

        try {
            const editorState = editor.getEditorState();
            let previousText = '';

            editorState.read(() => {
                const node = $getNodeByKey(nodeKey);
                if (node) {
                    const textNodes: string[] = [];
                    let currentNode = node.getPreviousSibling();

                    // Get all previous text nodes
                    while (currentNode) {
                        if ('getTextContent' in currentNode) {
                            textNodes.unshift(currentNode.getTextContent());
                        }
                        currentNode = currentNode.getPreviousSibling();
                    }

                    previousText = textNodes.join('\n');
                    console.log('Previous text collected from scene beat node:', {
                        totalLength: previousText.length,
                        preview: previousText,
                    });
                }
            });

            const config: PromptParserConfig = {
                promptId: prompt.id,
                storyId: currentStoryId,
                chapterId: currentChapterId,
                scenebeat: command.trim(),
                previousWords: previousText,
                matchedEntries: new Set(matchedEntries.values())
            };

            const response = await generateWithPrompt(config, model);

            await processStreamedResponse(
                response,
                (token) => {
                    setStreamedText(prev => prev + token);
                },
                () => {
                    setStreamComplete(true);
                },
                (error) => {
                    console.error('Error streaming response:', error);
                    toast.error('Failed to generate text');
                }
            );
        } catch (error) {
            console.error('Error generating text:', error);
            toast.error('Failed to generate text');
        } finally {
            setStreaming(false);
        }
    };

    const handleAccept = () => {
        editor.update(() => {
            const paragraphNode = $createParagraphNode();
            paragraphNode.append($createTextNode(streamedText));
            const currentNode = $getNodeByKey(nodeKey);
            if (currentNode) {
                currentNode.insertAfter(paragraphNode);
            }
        });
        setStreamedText('');
        setStreamComplete(false);
    };

    const handleReject = () => {
        setStreamedText('');
        setStreamComplete(false);
    };

    return (
        <div className="relative my-4 rounded-lg border border-border bg-card">
            {/* Collapsible Header */}
            <div className="flex items-center justify-between p-2">
                <div
                    className="flex items-center gap-2 flex-1 cursor-pointer hover:bg-accent/50"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    <ChevronRight className={cn(
                        "h-4 w-4 transition-transform",
                        !collapsed && "rotate-90"
                    )} />
                    <span className="font-medium">Scene Beat</span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDelete}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            {/* Collapsible Content */}
            {!collapsed && (
                <div className="space-y-4">
                    <div className="relative">
                        <Textarea
                            value={command}
                            onChange={(e) => setCommand(e.target.value)}
                            className="min-h-[100px] resize-none"
                        />

                        {/* Add matched entries display */}
                        {localMatchedEntries.size > 0 && (
                            <div className="mt-2 p-2 border border-border rounded-lg bg-muted/50">
                                <div className="text-sm font-medium mb-1">Matched Tags:</div>
                                <div className="space-y-1">
                                    {Array.from(localMatchedEntries.values()).map((entry) => (
                                        <div key={entry.id} className="text-sm flex items-center gap-2">
                                            <span className="font-medium">{entry.name}:</span>
                                            <span className="text-muted-foreground">{entry.tags.join(', ')}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {streamedText && (
                        <div className="border-t border-border p-2">
                            {streamedText}
                        </div>
                    )}

                    <div className="flex justify-between items-center border-t border-border p-2">
                        <AIGenerateMenu
                            isGenerating={streaming}
                            isLoading={isLoading}
                            error={error}
                            prompts={prompts}
                            promptType="scene_beat"
                            buttonText="Generate Prose"
                            onGenerate={handleGenerateWithPrompt}
                        />

                        {streamComplete && (
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleAccept}
                                >
                                    Accept
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleReject}
                                >
                                    Reject
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export class SceneBeatNode extends DecoratorNode<JSX.Element> {
    __command: string;

    constructor(command: string = '', key?: NodeKey) {
        super(key);
        this.__command = command;
    }

    static getType(): string {
        return 'scene-beat';
    }

    static clone(node: SceneBeatNode): SceneBeatNode {
        return new SceneBeatNode(node.__command, node.__key);
    }

    static importJSON(serializedNode: SerializedSceneBeatNode): SceneBeatNode {
        const node = $createSceneBeatNode();
        node.setCommand(serializedNode.command || '');
        return node;
    }

    exportJSON(): SerializedSceneBeatNode {
        return {
            type: 'scene-beat',
            version: 1,
            command: this.__command,
        };
    }

    setCommand(command: string): void {
        const writable = this.getWritable();
        writable.__command = command;
    }

    getCommand(): string {
        return this.__command;
    }

    createDOM(): HTMLElement {
        const div = document.createElement('div');
        div.className = 'scene-beat-node';
        return div;
    }

    updateDOM(): boolean {
        return false;
    }

    isInline(): boolean {
        return false;
    }

    decorate(): JSX.Element {
        return (
            <Suspense fallback={null}>
                <SceneBeatComponent nodeKey={this.__key} />
            </Suspense>
        );
    }
}

export function $createSceneBeatNode(): SceneBeatNode {
    return $applyNodeReplacement(new SceneBeatNode());
}

export function $isSceneBeatNode(
    node: LexicalNode | null | undefined,
): node is SceneBeatNode {
    return node instanceof SceneBeatNode;
}
