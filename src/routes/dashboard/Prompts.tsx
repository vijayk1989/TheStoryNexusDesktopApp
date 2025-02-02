import { Button } from "@/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card";
import { MessageSquare, Plus } from "lucide-react";

export default function Prompts() {
    const dummyPrompts = [
        {
            id: 1,
            title: "Character Development",
            description: "Generate detailed character backgrounds and personalities",
            prompt: "Create a character profile for a complex protagonist who...",
        },
        {
            id: 2,
            title: "Plot Outline",
            description: "Generate story plot points and story arcs",
            prompt: "Develop a story outline with three major plot points that...",
        },
        {
            id: 3,
            title: "World Building",
            description: "Create rich and detailed story settings",
            prompt: "Design a unique fantasy world with its own cultural systems...",
        },
    ];

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Story Prompts</h1>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Prompt
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dummyPrompts.map((prompt) => (
                    <Card key={prompt.id}>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <MessageSquare className="mr-2 h-5 w-5" />
                                {prompt.title}
                            </CardTitle>
                            <CardDescription>{prompt.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-3">
                                {prompt.prompt}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
} 