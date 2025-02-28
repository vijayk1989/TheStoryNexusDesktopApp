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
import { ChevronRight, Loader2, User, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';
import { usePromptStore } from '@/features/prompts/store/promptStore';
import { AIModel, Prompt, PromptParserConfig, AllowedModel, PromptMessage } from '@/types/story';
import { useAIStore } from '@/features/ai/stores/useAIStore';
import { toast } from "react-toastify";
import { Textarea } from "@/components/ui/textarea";
import { useStoryContext } from '@/features/stories/context/StoryContext';
import { useLorebookStore } from '@/features/lorebook/stores/useLorebookStore';
import { PromptSelectMenu } from '@/components/ui/prompt-select-menu';
import { PromptPreviewDialog } from '@/components/ui/prompt-preview-dialog';
import { debounce } from 'lodash';
import { LorebookEntry } from '@/types/story';
import { SceneBeatMatchedEntries } from './SceneBeatMatchedEntries';
import { createPromptParser } from '@/features/prompts/services/promptParser';
import { useChapterStore } from '@/features/chapters/stores/useChapterStore';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export type SerializedSceneBeatNode = Spread<
    {
        type: 'scene-beat';
        version: 1;
        command: string;
        povType?: 'First Person' | 'Third Person Limited' | 'Third Person Omniscient';
        povCharacter?: string;
    },
    SerializedLexicalNode
>;

function SceneBeatComponent({ nodeKey }: { nodeKey: NodeKey }): JSX.Element {
    const [editor] = useLexicalComposerContext();
    const { currentStoryId, currentChapterId } = useStoryContext();
    const { currentChapter } = useChapterStore();
    const [collapsed, setCollapsed] = useState(false);
    const [command, setCommand] = useState('');
    const [streamedText, setStreamedText] = useState('');
    const [streamComplete, setStreamComplete] = useState(false);
    const [streaming, setStreaming] = useState(false);
    const { prompts, fetchPrompts, isLoading, error } = usePromptStore();
    const { generateWithPrompt, processStreamedResponse } = useAIStore();
    const { tagMap, chapterMatchedEntries, entries } = useLorebookStore();
    const [localMatchedEntries, setLocalMatchedEntries] = useState<Map<string, LorebookEntry>>(new Map());
    const [useChapterOrScenebeatMatchedEntries, setUseChapterOrScenebeatMatchedEntries] = useState<string>('chapter');
    const [showMatchedEntries, setShowMatchedEntries] = useState(false);
    const [selectedPrompt, setSelectedPrompt] = useState<Prompt>();
    const [selectedModel, setSelectedModel] = useState<AllowedModel>();
    const [showPreviewDialog, setShowPreviewDialog] = useState(false);
    const [previewMessages, setPreviewMessages] = useState<PromptMessage[]>();
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const [povType, setPovType] = useState<'First Person' | 'Third Person Limited' | 'Third Person Omniscient' | undefined>(
        'Third Person Omniscient'
    );
    const [povCharacter, setPovCharacter] = useState<string | undefined>();
    const [showPovPopover, setShowPovPopover] = useState(false);
    const [tempPovType, setTempPovType] = useState<'First Person' | 'Third Person Limited' | 'Third Person Omniscient' | undefined>(
        'Third Person Omniscient'
    );
    const [tempPovCharacter, setTempPovCharacter] = useState<string | undefined>();

    // Get character entries from lorebook
    const characterEntries = useMemo(() => {
        return entries.filter(entry => entry.category === 'character');
    }, [entries]);

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
                setPovType(node.getPovType() || currentChapter?.povType || 'Third Person Omniscient');
                setPovCharacter(node.getPovCharacter() || currentChapter?.povCharacter);

                // Initialize temp values for the popover
                setTempPovType(node.getPovType() || currentChapter?.povType || 'Third Person Omniscient');
                setTempPovCharacter(node.getPovCharacter() || currentChapter?.povCharacter);
            }
        });
    }, [editor, nodeKey, currentChapter]);

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

            Object.entries(tagMap).forEach(([tag, entry]) => {
                if (command.toLowerCase().includes(tag.toLowerCase())) {
                    matchedEntries.set(entry.id, entry);
                }
            });

            setLocalMatchedEntries(matchedEntries);
        };

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

    const handlePromptSelect = (prompt: Prompt, model: AllowedModel) => {
        setSelectedPrompt(prompt);
        setSelectedModel(model);
        // Reset preview state when selecting a new prompt
        setPreviewMessages(undefined);
        setPreviewError(null);
    };

    const handlePovTypeChange = (value: 'First Person' | 'Third Person Limited' | 'Third Person Omniscient') => {
        setTempPovType(value);
        // If switching to omniscient, clear character
        if (value === 'Third Person Omniscient') {
            setTempPovCharacter(undefined);
        }
    };

    const handlePovCharacterChange = (value: string) => {
        setTempPovCharacter(value);
    };

    const handleSavePov = () => {
        setPovType(tempPovType);
        setPovCharacter(tempPovCharacter);

        // Update the node with new POV settings
        editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if (node instanceof SceneBeatNode) {
                node.setPovType(tempPovType);
                node.setPovCharacter(tempPovCharacter);
            }
        });

        setShowPovPopover(false);
        toast.success('POV settings saved');
    };

    // Reset temp values when opening the popover
    const handleOpenPovPopover = (open: boolean) => {
        if (open) {
            setTempPovType(povType);
            setTempPovCharacter(povCharacter);
        }
        setShowPovPopover(open);
    };

    const createPromptConfig = (prompt: Prompt): PromptParserConfig => {
        if (!currentStoryId || !currentChapterId) {
            throw new Error('No story or chapter context found');
        }

        let previousText = '';
        editor.getEditorState().read(() => {
            const node = $getNodeByKey(nodeKey);
            if (node) {
                const textNodes: string[] = [];
                let currentNode = node.getPreviousSibling();

                while (currentNode) {
                    if ('getTextContent' in currentNode) {
                        textNodes.unshift(currentNode.getTextContent());
                    }
                    currentNode = currentNode.getPreviousSibling();
                }

                previousText = textNodes.join('\n');
            }
        });

        const matchedEntries = useChapterOrScenebeatMatchedEntries === 'chapter' ? chapterMatchedEntries : localMatchedEntries;

        return {
            promptId: prompt.id,
            storyId: currentStoryId,
            chapterId: currentChapterId,
            scenebeat: command.trim(),
            previousWords: previousText,
            matchedEntries: new Set(matchedEntries.values()),
            chapterMatchedEntries: new Set(chapterMatchedEntries.values()),
            sceneBeatMatchedEntries: new Set(localMatchedEntries.values()),
            povType,
            povCharacter: povType !== 'Third Person Omniscient' ? povCharacter : undefined
        };
    };

    const handlePreviewPrompt = async () => {
        if (!selectedPrompt) {
            toast.error('Please select a prompt first');
            return;
        }

        setPreviewLoading(true);
        setPreviewError(null);
        setPreviewMessages(undefined);

        try {
            const promptParser = createPromptParser();
            const config = createPromptConfig(selectedPrompt);
            const result = await promptParser.parse(config);

            if (result.error) {
                setPreviewError(result.error);
            } else {
                setPreviewMessages(result.messages);
            }
        } catch (error) {
            console.error('Error previewing prompt:', error);
            setPreviewError(error instanceof Error ? error.message : 'Failed to preview prompt');
        } finally {
            setPreviewLoading(false);
            setShowPreviewDialog(true);
        }
    };

    const handleGenerateWithPrompt = async () => {
        if (!selectedPrompt || !selectedModel) {
            toast.error('Please select a prompt and model first');
            return;
        }

        if (!command.trim()) {
            toast.error('Please enter a scene beat description');
            return;
        }

        setStreaming(true);
        setStreamedText('');
        setStreamComplete(false);

        try {
            const config = createPromptConfig(selectedPrompt);
            const response = await generateWithPrompt(config, selectedModel);

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
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="flex items-center justify-center hover:bg-accent/50 rounded-md w-6 h-6"
                    >
                        <ChevronRight className={cn(
                            "h-4 w-4 transition-transform",
                            !collapsed && "rotate-90"
                        )} />
                    </button>
                    <span className="font-medium">Scene Beat</span>
                </div>
                <div className="flex items-center gap-2">
                    <Popover open={showPovPopover} onOpenChange={handleOpenPovPopover}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8"
                            >
                                <User className="h-4 w-4 mr-2" />
                                <span>POV: {povType === 'Third Person Omniscient' ? 'Omniscient' : povCharacter || 'Select'}</span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">Point of View</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Set the POV for this scene beat
                                    </p>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="povType">POV Type</Label>
                                    <Select
                                        value={tempPovType}
                                        onValueChange={(value) => handlePovTypeChange(value as any)}
                                    >
                                        <SelectTrigger id="povType">
                                            <SelectValue placeholder="Select POV type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="First Person">First Person</SelectItem>
                                            <SelectItem value="Third Person Limited">Third Person Limited</SelectItem>
                                            <SelectItem value="Third Person Omniscient">Third Person Omniscient</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {tempPovType !== 'Third Person Omniscient' && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="povCharacter">POV Character</Label>
                                        <Select
                                            value={tempPovCharacter}
                                            onValueChange={handlePovCharacterChange}
                                        >
                                            <SelectTrigger id="povCharacter">
                                                <SelectValue placeholder="Select character" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {characterEntries.length === 0 ? (
                                                    <SelectItem value="" disabled>
                                                        No characters available
                                                    </SelectItem>
                                                ) : (
                                                    characterEntries.map((character) => (
                                                        <SelectItem key={character.id} value={character.name}>
                                                            {character.name}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                                <Button
                                    className="w-full mt-2"
                                    onClick={handleSavePov}
                                >
                                    <Check className="h-4 w-4 mr-2" />
                                    Save POV Settings
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowMatchedEntries(true)}
                        className="h-8"
                        disabled={localMatchedEntries.size === 0}
                    >
                        <span>Matched Entries</span>
                        {localMatchedEntries.size > 0 && (
                            <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                {localMatchedEntries.size}
                            </span>
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDelete}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
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
                    </div>

                    {streamedText && (
                        <div className="border-t border-border p-2">
                            {streamedText}
                        </div>
                    )}

                    <div className="flex justify-between items-center border-t border-border p-2">
                        <div className="flex gap-2 items-center">
                            <PromptSelectMenu
                                isLoading={isLoading}
                                error={error}
                                prompts={prompts}
                                promptType="scene_beat"
                                selectedPrompt={selectedPrompt}
                                selectedModel={selectedModel}
                                onSelect={handlePromptSelect}
                            />
                            {selectedPrompt && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePreviewPrompt}
                                >
                                    Preview Prompt
                                </Button>
                            )}
                            <Button
                                onClick={handleGenerateWithPrompt}
                                disabled={streaming || !selectedPrompt || !selectedModel}
                            >
                                {streaming ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Generating...
                                    </>
                                ) : (
                                    "Generate Prose"
                                )}
                            </Button>
                        </div>

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

            <SceneBeatMatchedEntries
                open={showMatchedEntries}
                onOpenChange={setShowMatchedEntries}
                matchedEntries={new Set(localMatchedEntries.values())}
            />

            <PromptPreviewDialog
                open={showPreviewDialog}
                onOpenChange={setShowPreviewDialog}
                messages={previewMessages}
                isLoading={previewLoading}
                error={previewError}
            />
        </div>
    );
}

export class SceneBeatNode extends DecoratorNode<JSX.Element> {
    __command: string;
    __povType?: 'First Person' | 'Third Person Limited' | 'Third Person Omniscient';
    __povCharacter?: string;

    constructor(
        command: string = '',
        povType?: 'First Person' | 'Third Person Limited' | 'Third Person Omniscient',
        povCharacter?: string,
        key?: NodeKey
    ) {
        super(key);
        this.__command = command;
        this.__povType = povType;
        this.__povCharacter = povCharacter;
    }

    static getType(): string {
        return 'scene-beat';
    }

    static clone(node: SceneBeatNode): SceneBeatNode {
        return new SceneBeatNode(
            node.__command,
            node.__povType,
            node.__povCharacter,
            node.__key
        );
    }

    static importJSON(serializedNode: SerializedSceneBeatNode): SceneBeatNode {
        const node = $createSceneBeatNode(
            serializedNode.command || '',
            serializedNode.povType,
            serializedNode.povCharacter
        );
        return node;
    }

    exportJSON(): SerializedSceneBeatNode {
        return {
            type: 'scene-beat',
            version: 1,
            command: this.__command,
            povType: this.__povType,
            povCharacter: this.__povCharacter,
        };
    }

    setCommand(command: string): void {
        const writable = this.getWritable();
        writable.__command = command;
    }

    getCommand(): string {
        return this.__command;
    }

    setPovType(povType?: 'First Person' | 'Third Person Limited' | 'Third Person Omniscient'): void {
        const writable = this.getWritable();
        writable.__povType = povType;
    }

    getPovType(): 'First Person' | 'Third Person Limited' | 'Third Person Omniscient' | undefined {
        return this.__povType;
    }

    setPovCharacter(povCharacter?: string): void {
        const writable = this.getWritable();
        writable.__povCharacter = povCharacter;
    }

    getPovCharacter(): string | undefined {
        return this.__povCharacter;
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

export function $createSceneBeatNode(
    command: string = '',
    povType?: 'First Person' | 'Third Person Limited' | 'Third Person Omniscient',
    povCharacter?: string
): SceneBeatNode {
    return $applyNodeReplacement(new SceneBeatNode(command, povType, povCharacter));
}

export function $isSceneBeatNode(
    node: LexicalNode | null | undefined,
): node is SceneBeatNode {
    return node instanceof SceneBeatNode;
}
