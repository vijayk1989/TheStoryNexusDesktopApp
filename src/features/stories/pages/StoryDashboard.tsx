import { Link, Outlet, useParams } from "react-router";
import {
    Settings,
    Home,
    Bot,
    Sparkles,
    Sliders,
    BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useStoryStore } from "@/features/stories/stores/useStoryStore";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router";

export default function StoryDashboard() {
    const { storyId } = useParams();
    const { currentStory, getStory } = useStoryStore();
    const location = useLocation();


    useEffect(() => {
        if (storyId) {
            getStory(storyId);
        }
    }, [storyId, getStory]);

    const isActive = (path: string) => {
        // Remove trailing slash for consistency
        const currentPath = location.pathname.replace(/\/$/, '');
        const targetPath = path.replace(/\/$/, '');

        // For write path, check if we're in a chapter editor
        if (currentPath.includes('/write') && targetPath.includes('/chapters')) {
            return true;
        }

        return currentPath === targetPath;
    };

    const navButton = (icon: React.ReactNode, to: string, label: string) => (
        <Button
            variant="ghost"
            size="icon"
            className={cn(
                "h-9 w-9 relative group",
                isActive(to) && "bg-accent"
            )}
            asChild
        >
            <Link to={to}>
                {icon}
                <span className="sr-only">{label}</span>
                {/* Tooltip */}
                <span className="absolute left-12 px-2 py-1 ml-1 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 bg-popover text-popover-foreground rounded shadow-md transition-opacity">
                    {label}
                </span>
            </Link>
        </Button>
    );

    return (
        <div className="h-screen flex bg-background">
            {/* Thin Icon Navigation */}
            <div className="w-12 border-r bg-muted/50 flex flex-col items-center py-4">
                {/* Top Navigation Icons */}
                <div className="flex-1 flex flex-col items-center space-y-4">
                    {storyId && (
                        <>
                            {/* Chapters List */}
                            {navButton(<BookOpen className="h-5 w-5" />, `/dashboard/${storyId}/chapters`, "Chapters")}
                            {/* Prompts */}
                            {navButton(<Sparkles className="h-5 w-5" />, `/dashboard/${storyId}/prompts`, "Prompts")}
                            {/* Chats */}
                            {navButton(<Bot className="h-5 w-5" />, `/dashboard/${storyId}/chats`, "AI Chats")}
                            {/* Default Settings */}
                            {navButton(<Settings className="h-5 w-5" />, `/dashboard/${storyId}/settings`, "Story Settings")}
                        </>
                    )}
                </div>

                {/* Bottom Navigation */}
                <div className="flex flex-col items-center space-y-4 pb-4">
                    <ThemeToggle />
                    {navButton(<Home className="h-5 w-5" />, "/", "Home")}
                    {navButton(<Sliders className="h-5 w-5" />, "/dashboard/ai-settings", "AI Settings")}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
                {/* Header with Story Title */}
                {currentStory && (
                    <div className="h-12 border-b bg-muted/50 flex items-center px-4">
                        <h1 className="text-lg font-semibold">{currentStory.title}</h1>
                    </div>
                )}
                <div className="flex-1">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
