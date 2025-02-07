import { WorldDataList } from "./WorldDataList";
import { StoryOutline } from "./StoryOutline";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Editor from "@/components/lexical-editor/Editor";
import { useStoryContext } from "@/features/stories/context/StoryContext";

export function StoryEditor() {
    const { currentStoryId, currentChapterId } = useStoryContext();
    const [worldDataOpen, setWorldDataOpen] = useState(true);
    const [outlineOpen, setOutlineOpen] = useState(true);

    return (
        <div className="h-full flex">
            {/* World Data Sidebar */}
            <div className="relative">
                <div
                    className={`h-full border-r overflow-hidden transition-all duration-300 ${worldDataOpen ? "w-64" : "w-0"
                        }`}
                >
                    <div className="h-full w-64">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h2 className="font-semibold">World Data</h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setWorldDataOpen(false)}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        </div>
                        <WorldDataList />
                    </div>
                </div>
                {!worldDataOpen && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -right-9 top-4"
                        onClick={() => setWorldDataOpen(true)}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Main Editor Area */}
            <div className="flex-1">
                <div className="h-full flex flex-col">
                    <h1>Editor</h1>
                    <Editor />
                </div>
            </div>

            {/* Story Outline Sidebar */}
            <div className="relative">
                <div
                    className={`h-full border-l overflow-hidden transition-all duration-300 ${outlineOpen ? "w-64" : "w-0"
                        }`}
                >
                    <div className="h-full w-64">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h2 className="font-semibold">Story Outline</h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setOutlineOpen(false)}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                        <StoryOutline />
                    </div>
                </div>
                {!outlineOpen && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -left-9 top-4"
                        onClick={() => setOutlineOpen(true)}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
} 