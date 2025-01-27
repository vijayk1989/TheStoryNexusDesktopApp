export function MainEditor() {
    return (
        <div className="h-full flex flex-col">
            <div className="border-b p-4">
                <h1 className="text-2xl font-bold ml-8">Chapter 1: The Beginning</h1>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-3xl mx-auto prose prose-sm">
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
                        tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                    {/* Add more content */}
                </div>
            </div>
        </div>
    );
} 