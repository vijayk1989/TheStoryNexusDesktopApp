import { useState } from "react";
import { useStoryStore } from "@/stores/useStoryStore";
import { Button } from "./button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./dialog";
import { Input } from "./input";
import { Label } from "./label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { PlusCircle } from "lucide-react";

export function CreateStoryDialog() {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [language, setLanguage] = useState("English");
    const [synopsis, setSynopsis] = useState("");
    const createStory = useStoryStore((state) => state.createStory);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createStory({
                title,
                author,
                language,
                synopsis,
            });
            setOpen(false);
            // Reset form
            setTitle("");
            setAuthor("");
            setLanguage("English");
            setSynopsis("");
        } catch (error) {
            console.error("Failed to create story:", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="lg" className="w-64">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Create New Story
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create New Story</DialogTitle>
                        <DialogDescription>
                            Fill in the details for your new story. You can edit these later.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter story title"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="author">Author</Label>
                            <Input
                                id="author"
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                                placeholder="Enter author name"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="language">Language</Label>
                            <Select value={language} onValueChange={setLanguage}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="English">English</SelectItem>
                                    <SelectItem value="Spanish">Spanish</SelectItem>
                                    <SelectItem value="French">French</SelectItem>
                                    <SelectItem value="German">German</SelectItem>
                                    <SelectItem value="Chinese">Chinese</SelectItem>
                                    <SelectItem value="Japanese">Japanese</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="synopsis">Synopsis</Label>
                            <Input
                                id="synopsis"
                                value={synopsis}
                                onChange={(e) => setSynopsis(e.target.value)}
                                placeholder="Enter a brief synopsis (optional)"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Create Story</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
} 