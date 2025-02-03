import Editor from "./lexical-editor/Editor";

export function MainEditor() {
    return (
        <div className="h-full flex flex-col">
            <h1>Editor</h1>
            <Editor />
        </div>
    );
}
