import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight, Loader2 } from "lucide-react";
import { aiService } from '@/services/ai/AIService';
import { toast } from 'react-toastify';
import { AIModel } from '@/types/story';
import { cn } from '@/lib/utils';

export default function AISettingsPage() {
    const [openaiKey, setOpenaiKey] = useState('');
    const [openrouterKey, setOpenrouterKey] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [openaiModels, setOpenaiModels] = useState<AIModel[]>([]);
    const [openrouterModels, setOpenrouterModels] = useState<AIModel[]>([]);
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            console.log('Initializing AI service...');
            await aiService.initialize();

            // Set the keys using the new getter methods
            const openaiKey = aiService.getOpenAIKey();
            const openrouterKey = aiService.getOpenRouterKey();

            if (openaiKey) setOpenaiKey(openaiKey);
            if (openrouterKey) setOpenrouterKey(openrouterKey);

            console.log('Fetching available models...');
            const allModels = await aiService.getAvailableModels();
            console.log('All models:', allModels);

            const localModels = allModels.filter(m => m.provider === 'local');
            const openaiModels = allModels.filter(m => m.provider === 'openai');
            const openrouterModels = allModels.filter(m => m.provider === 'openrouter');

            console.log('Local models:', localModels);
            console.log('OpenAI models:', openaiModels);
            console.log('OpenRouter models:', openrouterModels);

            setOpenaiModels(openaiModels);
            setOpenrouterModels(openrouterModels);
        } catch (error) {
            console.error('Error loading AI settings:', error);
            toast.error('Failed to load AI settings');
        }
    };

    const handleKeyUpdate = async (provider: 'openai' | 'openrouter' | 'local', key: string) => {
        if (provider !== 'local' && !key.trim()) return;

        setIsLoading(true);
        try {
            console.log(`Updating ${provider} models...`);
            await aiService.updateKey(provider, key);
            console.log('Fetching new models...');
            const models = await aiService.getAvailableModels(provider);
            console.log(`${provider} models:`, models);

            if (provider === 'openai') {
                setOpenaiModels(models);
                setOpenSections(prev => ({ ...prev, openai: true }));
            } else if (provider === 'openrouter') {
                setOpenrouterModels(models);
                setOpenSections(prev => ({ ...prev, openrouter: true }));
            } else if (provider === 'local') {
                setOpenaiModels(prev => {
                    const filtered = prev.filter(m => m.provider !== 'local');
                    return [...filtered, ...models];
                });
                setOpenSections(prev => ({ ...prev, local: true }));
            }

            toast.success(`${provider === 'openai' ? 'OpenAI' : provider === 'openrouter' ? 'OpenRouter' : 'Local'} models updated successfully`);
        } catch (error) {
            console.error(`Error updating ${provider} models:`, error);
            toast.error(`Failed to update ${provider} models`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefreshModels = async (provider: 'openai' | 'openrouter' | 'local') => {
        setIsLoading(true);
        try {
            console.log(`Refreshing ${provider} models...`);
            const models = await aiService.getAvailableModels(provider);
            console.log(`${provider} models:`, models);

            switch (provider) {
                case 'openai':
                    setOpenaiModels(models);
                    setOpenSections(prev => ({ ...prev, openai: true }));
                    break;
                case 'openrouter':
                    setOpenrouterModels(models);
                    setOpenSections(prev => ({ ...prev, openrouter: true }));
                    break;
                case 'local':
                    setOpenaiModels(prev => {
                        const filtered = prev.filter(m => m.provider !== 'local');
                        return [...filtered, ...models];
                    });
                    setOpenSections(prev => ({ ...prev, local: true }));
                    break;
            }

            toast.success(`${provider === 'openai' ? 'OpenAI' : provider === 'openrouter' ? 'OpenRouter' : 'Local'} models refreshed`);
        } catch (error) {
            console.error(`Error refreshing ${provider} models:`, error);
            toast.error(`Failed to refresh ${provider} models`);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSection = (section: string) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    return (
        <div className="p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">AI Settings</h1>

                <div className="space-y-6">
                    {/* OpenAI Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                OpenAI Configuration
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRefreshModels('openai')}
                                    disabled={isLoading || !openaiKey.trim()}
                                >
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh Models'}
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="openai-key">OpenAI API Key</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="openai-key"
                                        type="password"
                                        placeholder="Enter your OpenAI API key"
                                        value={openaiKey}
                                        onChange={(e) => setOpenaiKey(e.target.value)}
                                    />
                                    <Button
                                        onClick={() => handleKeyUpdate('openai', openaiKey)}
                                        disabled={isLoading || !openaiKey.trim()}
                                    >
                                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                                    </Button>
                                </div>
                            </div>

                            {openaiModels.length > 0 && (
                                <Collapsible
                                    open={openSections.openai}
                                    onOpenChange={() => toggleSection('openai')}
                                >
                                    <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                                        <ChevronRight className={cn(
                                            "h-4 w-4 transition-transform",
                                            openSections.openai && "transform rotate-90"
                                        )} />
                                        Available Models
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="mt-2 space-y-2">
                                        {openaiModels.map(model => (
                                            <div key={model.id} className="text-sm pl-6">
                                                {model.name}
                                            </div>
                                        ))}
                                    </CollapsibleContent>
                                </Collapsible>
                            )}
                        </CardContent>
                    </Card>

                    {/* OpenRouter Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                OpenRouter Configuration
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRefreshModels('openrouter')}
                                    disabled={isLoading || !openrouterKey.trim()}
                                >
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh Models'}
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="openrouter-key">OpenRouter API Key</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="openrouter-key"
                                        type="password"
                                        placeholder="Enter your OpenRouter API key"
                                        value={openrouterKey}
                                        onChange={(e) => setOpenrouterKey(e.target.value)}
                                    />
                                    <Button
                                        onClick={() => handleKeyUpdate('openrouter', openrouterKey)}
                                        disabled={isLoading || !openrouterKey.trim()}
                                    >
                                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                                    </Button>
                                </div>
                            </div>

                            {openrouterModels.length > 0 && (
                                <Collapsible
                                    open={openSections.openrouter}
                                    onOpenChange={() => toggleSection('openrouter')}
                                >
                                    <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                                        <ChevronRight className={cn(
                                            "h-4 w-4 transition-transform",
                                            openSections.openrouter && "transform rotate-90"
                                        )} />
                                        Available Models
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="mt-2 space-y-2">
                                        {openrouterModels.map(model => (
                                            <div key={model.id} className="text-sm pl-6">
                                                {model.name}
                                            </div>
                                        ))}
                                    </CollapsibleContent>
                                </Collapsible>
                            )}
                        </CardContent>
                    </Card>

                    {/* Local Models Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                Local Models
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRefreshModels('local')}
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh Models'}
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Models from LM Studio</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleKeyUpdate('local', '')}
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh Models'}
                                </Button>
                            </div>

                            <Collapsible
                                open={openSections.local}
                                onOpenChange={() => toggleSection('local')}
                            >
                                <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                                    <ChevronRight className={cn(
                                        "h-4 w-4 transition-transform",
                                        openSections.local && "transform rotate-90"
                                    )} />
                                    Available Models
                                </CollapsibleTrigger>
                                <CollapsibleContent className="mt-2 space-y-2">
                                    {openaiModels
                                        .filter(m => m.provider === 'local')
                                        .map(model => (
                                            <div key={model.id} className="text-sm pl-6">
                                                {model.name}
                                            </div>
                                        ))}
                                </CollapsibleContent>
                            </Collapsible>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
} 