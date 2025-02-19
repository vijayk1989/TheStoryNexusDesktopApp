import { AIModel, Prompt } from "@/types/story";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger } from "./menubar";
import { Loader2, ChevronDown } from "lucide-react";

interface AIGenerateMenuProps {
    isGenerating: boolean;
    isLoading: boolean;
    error: string | null;
    prompts: Prompt[];
    availableModels: AIModel[];
    promptType: string;
    buttonText: string;
    onGenerate: (prompt: Prompt) => Promise<void>;
}

export function AIGenerateMenu({
    isGenerating,
    isLoading,
    error,
    prompts,
    promptType,
    buttonText,
    onGenerate
}: Omit<AIGenerateMenuProps, 'availableModels'>) {
    const filteredPrompts = prompts.filter(p => p.promptType === promptType);

    console.log('AIGenerateMenu Debug:', {
        promptType,
        filteredPrompts: filteredPrompts.map(p => ({
            id: p.id,
            name: p.name,
            allowedModels: p.allowedModels
        }))
    });

    return (
        <Menubar>
            <MenubarMenu>
                <MenubarTrigger className="gap-2" disabled={isGenerating}>
                    {isGenerating ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            {buttonText}
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
                                        {prompt.allowedModels.map((modelId) => (
                                            <MenubarItem
                                                key={modelId}
                                                onClick={() => onGenerate(prompt)}
                                                disabled={isGenerating}
                                            >
                                                <div className="flex flex-col">
                                                    <span>{modelId}</span>
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