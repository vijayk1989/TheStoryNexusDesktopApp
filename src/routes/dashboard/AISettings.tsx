import { Button } from "@/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select";
import { Separator } from "@/components/separator";
import { Slider } from "@/components/slider";

export default function AISettings() {
    return (
        <div className="p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">AI Settings</h1>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>API Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="api-key">OpenAI API Key</Label>
                                <Input
                                    id="api-key"
                                    type="password"
                                    placeholder="Enter your OpenAI API key"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="model">AI Model</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select AI model" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                                        <SelectItem value="claude-3">Claude 3</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Generation Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Temperature</Label>
                                <Slider
                                    defaultValue={[0.7]}
                                    max={1}
                                    step={0.1}
                                    className="w-full"
                                />
                                <p className="text-sm text-muted-foreground">
                                    Controls randomness: Lower values are more focused, higher values more creative.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label>Max Tokens</Label>
                                <Slider
                                    defaultValue={[2000]}
                                    max={4000}
                                    step={100}
                                    className="w-full"
                                />
                                <p className="text-sm text-muted-foreground">
                                    Maximum length of generated text.
                                </p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="writing-style">Writing Style</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select writing style" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="creative">Creative</SelectItem>
                                        <SelectItem value="formal">Formal</SelectItem>
                                        <SelectItem value="casual">Casual</SelectItem>
                                        <SelectItem value="technical">Technical</SelectItem>
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