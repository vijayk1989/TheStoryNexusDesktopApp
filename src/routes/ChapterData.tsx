import { useEffect } from "react";
import { useParams, useLocation } from "react-router";
import { useStoryStore } from "@/stores/useStoryStore";
import { useChapterStore } from "@/stores/useChapterStore";
import { StoryEditor } from "@/components/StoryEditor";

export default function ChapterData() {
    const { storyId } = useParams();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const chapterId = searchParams.get("id");

    const { getStory, currentStory } = useStoryStore();
    const { currentChapter, getChapter } = useChapterStore();

    useEffect(() => {
        if (storyId) {
            console.log("Loading story with id:", storyId);
            getStory(storyId);
        }
        if (chapterId) {
            console.log("Loading chapter with id:", chapterId);
            getChapter(chapterId);
        }
    }, [storyId, chapterId, getStory, getChapter]);

    if (!currentStory) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-muted-foreground">Loading story...</div>
            </div>
        );
    }

    if (chapterId && !currentChapter) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-muted-foreground">Loading chapter...</div>
            </div>
        );
    }

    return (
        <div className="h-full">
            <StoryEditor />
        </div>
    );
} 