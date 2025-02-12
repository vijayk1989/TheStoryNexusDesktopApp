import type {
    DOMConversionMap,
    DOMExportOutput,
    EditorConfig,
    LexicalNode,
    NodeKey,
    SerializedLexicalNode,
    Spread,
} from 'lexical';

import { $applyNodeReplacement, $createParagraphNode, $createTextNode, $getNodeByKey, DecoratorNode } from 'lexical';
import { Suspense, useState, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Loader2 } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { usePromptStore } from '@/features/prompts/store/promptStore';
import { AIModel, Prompt } from '@/types/story';
import { aiService } from '@/services/ai/AIService';
import {
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarTrigger,
    MenubarSub,
    MenubarSubContent,
    MenubarSubTrigger,
    Menubar
} from "@/components/ui/menubar";
import { toast } from "react-toastify";
import { Textarea } from "@/components/ui/textarea";

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
    const [collapsed, setCollapsed] = useState(false);
    const [command, setCommand] = useState('');
    const [streamedText, setStreamedText] = useState('');
    const [streamComplete, setStreamComplete] = useState(false);
    const [streaming, setStreaming] = useState(false);
    const { prompts, fetchPrompts, isLoading, error } = usePromptStore();
    const [availableModels, setAvailableModels] = useState<AIModel[]>([]);

    // Simplified model groups
    const modelGroups = useMemo(() => {
        const groups: { [key: string]: AIModel[] } = {
            'Local': [],
            'OpenAI': [],
            'Anthropic': [],
            'Other': []
        };

        // Add local model
        groups['Local'].push({
            id: 'local/llama-3.2-3b-instruct',
            name: 'Llama 3.2 3B Instruct',
            provider: 'local',
            contextLength: 4096,
            enabled: true
        });

        availableModels.forEach(model => {
            if (model.provider === 'openai') {
                groups['OpenAI'].push(model);
            } else if (model.provider === 'openrouter') {
                if (model.name.includes('Anthropic')) {
                    groups['Anthropic'].push(model);
                } else {
                    groups['Other'].push(model);
                }
            }
        });

        return Object.fromEntries(
            Object.entries(groups).filter(([_, models]) => models.length > 0)
        );
    }, [availableModels]);

    // Fetch prompts on component mount
    useEffect(() => {
        fetchPrompts().catch(error => {
            toast.error('Failed to load prompts');
            console.error('Error loading prompts:', error);
        });
    }, [fetchPrompts]);

    // Fetch models on mount
    useEffect(() => {
        aiService.getAvailableModels()
            .then(models => setAvailableModels(models))
            .catch(error => {
                console.error('Error fetching models:', error);
                toast.error('Failed to load AI models');
            });
    }, []);

    // Filter only scene_beat prompts
    const sceneBeatPrompts = useMemo(() =>
        prompts.filter(p => p.promptType === 'scene_beat'),
        [prompts]
    );

    // Initialize command from node state
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

    const handleDelete = () => {
        editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if (node) {
                node.remove();
            }
        });
    };

    const handleGenerateWithPrompt = async (prompt: Prompt, model: AIModel) => {
        if (!command.trim()) {
            toast.error('Please enter a scene beat description');
            return;
        }

        setStreaming(true);
        setStreamedText('');
        setStreamComplete(false);

        try {
            // For now, only handle local model and just send the raw command
            if (model.provider === 'local') {
                const response = await aiService.generateWithLocalModel(command);

                await aiService.processStreamedResponse(
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
            } else {
                toast.error('Only local models are supported at the moment');
            }
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
                    <Textarea
                        value={command}
                        onChange={(e) => setCommand(e.target.value)}
                        className="min-h-[100px] resize-none"
                    />

                    {streamedText && (
                        <div className="border-t border-border p-2">
                            {streamedText}
                        </div>
                    )}

                    <div className="flex justify-between items-center border-t border-border p-2">
                        <Menubar>
                            <MenubarMenu>
                                <MenubarTrigger className="gap-2">
                                    {streaming ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            Generate Prose
                                            <ChevronDown className="h-4 w-4" />
                                        </>
                                    )}
                                </MenubarTrigger>
                                <MenubarContent>
                                    {isLoading ? (
                                        <MenubarItem disabled>Loading prompts...</MenubarItem>
                                    ) : error ? (
                                        <MenubarItem disabled>Error loading prompts</MenubarItem>
                                    ) : sceneBeatPrompts.length === 0 ? (
                                        <MenubarItem disabled>No scene beat prompts available</MenubarItem>
                                    ) : (
                                        <>
                                            {sceneBeatPrompts.map((prompt) => (
                                                <MenubarSub key={prompt.id}>
                                                    <MenubarSubTrigger>
                                                        <div className="flex flex-col">
                                                            <span>{prompt.name}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {prompt.messages.length} messages
                                                            </span>
                                                        </div>
                                                    </MenubarSubTrigger>
                                                    <MenubarSubContent
                                                        className="max-h-[300px] overflow-y-auto"
                                                    >
                                                        {Object.entries(modelGroups).map(([provider, models]) => {
                                                            const allowedModels = models.filter(model =>
                                                                prompt.allowedModels.includes(model.id)
                                                            );
                                                            if (allowedModels.length === 0) return null;

                                                            return (
                                                                <div key={provider}>
                                                                    <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted sticky top-0">
                                                                        {provider}
                                                                    </div>
                                                                    {allowedModels.map((model) => (
                                                                        <MenubarItem
                                                                            key={model.id}
                                                                            onClick={() => handleGenerateWithPrompt(prompt, model)}
                                                                            disabled={streaming}
                                                                        >
                                                                            <div className="flex flex-col">
                                                                                <span>{model.name}</span>
                                                                                <span className="text-xs text-muted-foreground">
                                                                                    {model.contextLength.toLocaleString()} tokens
                                                                                </span>
                                                                            </div>
                                                                        </MenubarItem>
                                                                    ))}
                                                                </div>
                                                            );
                                                        })}
                                                    </MenubarSubContent>
                                                </MenubarSub>
                                            ))}
                                            <MenubarSeparator />
                                            <MenubarItem>Configure Prompts...</MenubarItem>
                                        </>
                                    )}
                                </MenubarContent>
                            </MenubarMenu>
                        </Menubar>

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