import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChapterCard } from "@/components/chapter-card";
import { useChapterStore } from "@/stores/useChapterStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { toast } from 'react-toastify';

interface CreateChapterForm {
    title: string;
    povCharacter?: string;
    povType?: 'First Person' | 'Third Person Limited' | 'Third Person Omniscient';
}

export default function Chapters() {
    const { storyId } = useParams();
    const { chapters, loading, error, fetchChapters, createChapter } = useChapterStore();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const form = useForm<CreateChapterForm>();

    useEffect(() => {
        if (storyId) {
            fetchChapters(storyId);
        }
    }, [storyId, fetchChapters]);

    const handleCreateChapter = async (data: CreateChapterForm) => {
        if (!storyId) return;

        try {
            const nextOrder = chapters.length > 0
                ? Math.max(...chapters.map(c => c.order)) + 1
                : 1;

            await createChapter({
                storyId,
                title: data.title,
                content: '',
                povCharacter: data.povCharacter,
                povType: data.povType,
                order: nextOrder,
                outline: { beats: [] }
            });
            setIsCreateDialogOpen(false);
            form.reset();
            toast.success('Chapter created successfully');
        } catch (error) {
            console.error('Failed to create chapter:', error);
            toast.error('Failed to create chapter');
        }
    };

    if (!storyId) return null;

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">Loading chapters...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full flex items-center justify-center">
                <p className="text-destructive">{error}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-4xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Chapters</h1>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            New Chapter
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <form onSubmit={form.handleSubmit(handleCreateChapter)}>
                            <DialogHeader>
                                <DialogTitle>Create New Chapter</DialogTitle>
                                <DialogDescription>
                                    Add a new chapter to your story. You can edit the content after creating it.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        placeholder="Enter chapter title"
                                        {...form.register("title", { required: true })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="povCharacter">POV Character</Label>
                                    <Input
                                        id="povCharacter"
                                        placeholder="Enter POV character name"
                                        {...form.register("povCharacter")}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="povType">POV Type</Label>
                                    <Select onValueChange={(value) => form.setValue("povType", value as any)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select POV type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="First Person">First Person</SelectItem>
                                            <SelectItem value="Third Person Limited">Third Person Limited</SelectItem>
                                            <SelectItem value="Third Person Omniscient">Third Person Omniscient</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Create Chapter</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <ScrollArea className="h-[calc(100vh-10rem)]">
                {chapters.length === 0 ? (
                    <div className="h-[200px] flex flex-col items-center justify-center text-center p-6">
                        <p className="text-muted-foreground mb-4">
                            No chapters yet. Start writing your story by creating a new chapter.
                        </p>
                        <Button onClick={() => setIsCreateDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create First Chapter
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {chapters.map((chapter) => (
                            <ChapterCard
                                key={chapter.id}
                                chapter={chapter}
                                storyId={storyId}
                            />
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
} 