import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function DefaultSettings() {
    return (
        <div className="p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Default Story Settings</h1>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Author Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="default-author">Default Author Name</Label>
                                <Input id="default-author" placeholder="Enter your pen name" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="default-language">Default Language</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="english">English</SelectItem>
                                        <SelectItem value="spanish">Spanish</SelectItem>
                                        <SelectItem value="french">French</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Story Defaults</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="pov-type">Default POV Type</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select POV type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="first">First Person</SelectItem>
                                        <SelectItem value="third-limited">Third Person Limited</SelectItem>
                                        <SelectItem value="third-omniscient">Third Person Omniscient</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="chapter-template">Chapter Template</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select template" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="basic">Basic</SelectItem>
                                        <SelectItem value="detailed">Detailed</SelectItem>
                                        <SelectItem value="custom">Custom</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Separator />

                    <div className="flex justify-end">
                        <Button>Save Settings</Button>
                    </div>
                </div>
            </div>
        </div>
    );
} 