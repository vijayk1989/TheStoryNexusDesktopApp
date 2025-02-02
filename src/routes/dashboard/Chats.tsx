import { Button } from "@/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card";
import { MessageCircle, Plus } from "lucide-react";

export default function Chats() {
    const dummyChats = [
        {
            id: 1,
            title: "Character Development - Hero",
            lastMessage: "Let's explore the protagonist's motivations...",
            timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
            messageCount: 24,
        },
        {
            id: 2,
            title: "Plot Brainstorming",
            lastMessage: "What if we introduce a twist where...",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            messageCount: 15,
        },
        {
            id: 3,
            title: "World Building Session",
            lastMessage: "The magic system could be based on...",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
            messageCount: 42,
        },
    ];

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">AI Chats</h1>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Chat
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dummyChats.map((chat) => (
                    <Card key={chat.id} className="hover:bg-accent/50 cursor-pointer transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <MessageCircle className="mr-2 h-5 w-5" />
                                {chat.title}
                            </CardTitle>
                            <CardDescription>
                                {chat.messageCount} messages • {chat.timestamp.toLocaleDateString()}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {chat.lastMessage}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
} 