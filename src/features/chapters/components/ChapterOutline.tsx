import { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../components/ui/textarea";
import { useChapterStore } from "../stores/useChapterStore";
import { Save } from "lucide-react";

export function ChapterOutline() {
    const { currentChapter, updateChapterOutline } = useChapterStore();
    const [outlineContent, setOutlineContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Load outline content when current chapter changes
    useEffect(() => {
        if (currentChapter?.outline?.content) {
            setOutlineContent(currentChapter.outline.content);
        } else {
            setOutlineContent("");
        }
    }, [currentChapter]);

    const handleSave = async () => {
        if (!currentChapter) return;

        setIsSaving(true);
        try {
            await updateChapterOutline(currentChapter.id, {
                content: outlineContent,
                lastUpdated: new Date()
            });
        } catch (error) {
            console.error("Failed to save outline:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Chapter Outline</h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSave}
                        disabled={isSaving || !currentChapter}
                    >
                        <Save className="h-4 w-4 mr-1" />
                        Save
                    </Button>
                </div>
                <Textarea
                    className="flex-1 resize-none"
                    placeholder="Enter your chapter outline here..."
                    value={outlineContent}
                    onChange={(e) => setOutlineContent(e.target.value)}
                    disabled={!currentChapter}
                />
            </div>
        </div>
    );
} 