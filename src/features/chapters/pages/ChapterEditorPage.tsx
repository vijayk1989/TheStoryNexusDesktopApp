import { useEffect } from "react";
import { useParams } from "react-router";
import { useStoryStore } from "@/features/stories/stores/useStoryStore";
import { useChapterStore } from "@/features/chapters/stores/useChapterStore";
import { StoryEditor } from "@/features/chapters/components/StoryEditor";

export default function ChapterEditorPage() {
    const { storyId, chapterId } = useParams<{ storyId: string; chapterId: string }>();
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