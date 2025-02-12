import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { PromptForm } from './PromptForm';
import { PromptsList } from './PromptList';
import { Plus, ArrowLeft } from 'lucide-react';
import type { Prompt } from '@/types/story';
import { cn } from '@/lib/utils';

export function PromptsManager() {
    const [selectedPrompt, setSelectedPrompt] = useState<Prompt | undefined>(undefined);
    const [isCreating, setIsCreating] = useState(false);
    const [showMobileForm, setShowMobileForm] = useState(false);

    const handleNewPrompt = () => {
        setSelectedPrompt(undefined);
        setIsCreating(true);
        setShowMobileForm(true);
    };

    const handlePromptSelect = (prompt: Prompt) => {
        setSelectedPrompt(prompt);
        setIsCreating(false);
        setShowMobileForm(true);
    };

    const handleBack = () => {
        setShowMobileForm(false);
        if (!selectedPrompt) {
            setIsCreating(false);
        }
    };

    const handleSave = () => {
        setShowMobileForm(false);
    };

    const handlePromptDelete = (promptId: string) => {
        if (selectedPrompt?.id === promptId) {
            setSelectedPrompt(undefined);
            setIsCreating(false);
        }
    };

    return (
        <div className="flex flex-1 overflow-hidden relative mt-14 lg:mt-0">
            {/* Left panel - Prompts List */}
            <div className={cn(
                "w-full md:w-[300px] border-r border-input bg-muted flex flex-col",
                showMobileForm ? "hidden md:flex" : "flex"
            )}>
                <div className="p-4 border-b border-input">
                    <Button
                        onClick={handleNewPrompt}
                        className="w-full flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        New Prompt
                    </Button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <PromptsList
                        onPromptSelect={handlePromptSelect}
                        selectedPromptId={selectedPrompt?.id}
                        onPromptDelete={handlePromptDelete}
                    />
                </div>
            </div>

            {/* Right panel - Prompt Form/Editor */}
            <div className={cn(
                "absolute md:relative inset-0 md:inset-auto flex-1 bg-background transition-transform duration-300",
                showMobileForm ? "translate-x-0" : "translate-x-full md:translate-x-0",
                (isCreating || selectedPrompt) ? "block" : "hidden md:block"
            )}>
                {/* Mobile back button */}
                <div className="md:hidden p-4 border-b border-input">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Prompts
                    </Button>
                </div>

                <div className="max-w-3xl mx-auto p-6">
                    {(isCreating || selectedPrompt) ? (
                        <PromptForm
                            key={selectedPrompt?.id || 'new'}
                            prompt={selectedPrompt}
                            onSave={handleSave}
                            onCancel={() => {
                                setIsCreating(false);
                                setShowMobileForm(false);
                            }}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                            <p>Select a prompt to edit or create a new one</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 