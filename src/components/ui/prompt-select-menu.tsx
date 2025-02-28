import { AIModel, Prompt, AllowedModel } from "@/types/story";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger } from "./menubar";
import { ChevronDown } from "lucide-react";

interface PromptSelectMenuProps {
    isLoading: boolean;
    error: string | null;
    prompts: Prompt[];
    promptType: string;
    selectedPrompt?: Prompt;
    selectedModel?: AllowedModel;
    onSelect: (prompt: Prompt, model: AllowedModel) => void;
}

export function PromptSelectMenu({
    isLoading,
    error,
    prompts,
    promptType,
    selectedPrompt,
    selectedModel,
    onSelect
}: PromptSelectMenuProps) {
    const filteredPrompts = prompts.filter(p => p.promptType === promptType);

    return (
        <Menubar>
            <MenubarMenu>
                <MenubarTrigger className="gap-2">
                    {selectedPrompt && selectedModel ? (
                        <>
                            <div className="flex flex-col items-start">
                                <span className="text-sm">{selectedPrompt.name}</span>
                                <span className="text-xs text-muted-foreground">{selectedModel.name}</span>
                            </div>
                            <ChevronDown className="h-4 w-4" />
                        </>
                    ) : (
                        <>
                            Select Prompt
                            <ChevronDown className="h-4 w-4" />
                        </>
                    )}
                </MenubarTrigger>
                <MenubarContent>
                    {isLoading ? (
                        <MenubarItem disabled>Loading prompts...</MenubarItem>
                    ) : error ? (
                        <MenubarItem disabled>Error loading prompts</MenubarItem>
                    ) : filteredPrompts.length === 0 ? (
                        <MenubarItem disabled>No {promptType} prompts available</MenubarItem>
                    ) : (
                        <>
                            {filteredPrompts.map((prompt) => (
                                <MenubarSub key={prompt.id}>
                                    <MenubarSubTrigger>
                                        <div className="flex flex-col">
                                            <span>{prompt.name}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {prompt.messages.length} messages
                                            </span>
                                        </div>
                                    </MenubarSubTrigger>
                                    <MenubarSubContent className="max-h-[300px] overflow-y-auto">
                                        {prompt.allowedModels.map((model) => (
                                            <MenubarItem
                                                key={model.id}
                                                onClick={() => onSelect(prompt, model)}
                                                className={
                                                    selectedPrompt?.id === prompt.id &&
                                                        selectedModel?.id === model.id ?
                                                        "bg-accent" : ""
                                                }
                                            >
                                                <div className="flex flex-col">
                                                    <span>{model.name}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {model.provider}
                                                    </span>
                                                </div>
                                            </MenubarItem>
                                        ))}
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
    );
} 