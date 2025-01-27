import { useEffect } from "react";
import { useParams } from "react-router";
import { useStoryStore } from "@/stores/useStoryStore";
import { StoryEditor } from "@/components/StoryEditor";

export default function Story() {
    const { storyId } = useParams();
    const { getStory, currentStory } = useStoryStore();

    useEffect(() => {
        if (storyId) {
            getStory(storyId);
        }
    }, [storyId, getStory]);

    if (!currentStory) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-muted-foreground">Loading story...</div>
            </div>
        );
    }

    return (
        <div className="h-full">
            <StoryEditor />
        </div>
    );
} 