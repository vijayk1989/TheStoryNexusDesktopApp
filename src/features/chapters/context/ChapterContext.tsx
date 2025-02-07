import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ChapterContextType {
    currentChapterId: string | null;
    setCurrentChapterId: (chapterId: string | null) => void;
}

const ChapterContext = createContext<ChapterContextType | undefined>(undefined);

export function ChapterProvider({ children }: { children: ReactNode }) {
    const [currentChapterId, setCurrentChapterId] = useState<string | null>(null);

    return (
        <ChapterContext.Provider value={{ currentChapterId, setCurrentChapterId }}>
            {children}
        </ChapterContext.Provider>
    );
}

export function useChapterContext() {
    const context = useContext(ChapterContext);
    if (!context) {
        throw new Error('useChapterContext must be used within a ChapterProvider');
    }
    return context;
}
