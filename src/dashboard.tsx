import { Link, Outlet, useParams } from "react-router";
import { Settings, BookOpen, Home } from "lucide-react";
import { Button } from "./components/button";
import { ThemeToggle } from "./components/theme-toggle";
import { useStoryStore } from "./stores/useStoryStore";
import { useEffect } from "react";

export default function Dashboard() {
    const { storyId } = useParams();
    const { currentStory, getStory } = useStoryStore();

    useEffect(() => {
        if (storyId) {
            getStory(storyId);
        }
    }, [storyId, getStory]);

    return (
        <div className="h-screen flex bg-background">
            {/* Thin Icon Navigation */}
            <div className="w-12 border-r bg-muted/50 flex flex-col items-center py-4">
                {/* Top Navigation Icons */}
                <div className="flex-1 flex flex-col space-y-4">
                    <Link to="/">
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                            <Home className="h-5 w-5" />
                        </Button>
                    </Link>
                    <Link to="/dashboard/settings">
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                            <Settings className="h-5 w-5" />
                        </Button>
                    </Link>
                    <Link to="/dashboard/guides">
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                            <BookOpen className="h-5 w-5" />
                        </Button>
                    </Link>
                </div>

                {/* Theme Toggle at Bottom */}
                <div className="pb-4">
                    <ThemeToggle />
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
