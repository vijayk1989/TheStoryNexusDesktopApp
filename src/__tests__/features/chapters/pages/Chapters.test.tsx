import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Chapters from "@/features/chapters/pages/Chapters";
import { useChapterStore } from "@/features/chapters/stores/useChapterStore";
import { BrowserRouter, Routes, Route } from "react-router";
import userEvent from "@testing-library/user-event";
import { ChapterProvider } from "@/features/chapters/context/ChapterContext";

// Mock the store
vi.mock("@/features/chapters/stores/useChapterStore", () => ({
    useChapterStore: vi.fn()
}));

// Mock react-toastify
vi.mock('react-toastify', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn()
    }
}));

// Mock useParams
vi.mock('react-router', async () => {
    const actual = await vi.importActual('react-router');
    return {
        ...actual as any,
        useParams: () => ({
            storyId: 'story1'
        })
    }
});

describe("Chapters page", () => {
    const mockFetchChapters = vi.fn();
    const mockCreateChapter = vi.fn();

    const mockChapters = [
        {
            id: "1",
            storyId: "story1",
            title: "Chapter 1",
            content: "",
            order: 1,
            createdAt: new Date(),
            wordCount: 0,
            outline: { beats: [] }
        },
        {
            id: "2",
            storyId: "story1",
            title: "Chapter 2",
            content: "",
            order: 2,
            createdAt: new Date(),
            wordCount: 0,
            outline: { beats: [] }
        }
    ];

    const renderChapters = () => {
        return render(
            <BrowserRouter>
                <ChapterProvider>
                    <Routes>
                        <Route path="/" element={<Chapters />} />
                    </Routes>
                </ChapterProvider>
            </BrowserRouter>
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should show loading state", async () => {
        (useChapterStore as any).mockReturnValue({
            chapters: [],
            loading: true,
            error: null,
            fetchChapters: mockFetchChapters
        });

        renderChapters();

        await waitFor(() => {
            expect(screen.getByText(/Loading chapters/i)).toBeInTheDocument();
        });
    });

    it("should show empty state when no chapters exist", async () => {
        (useChapterStore as any).mockReturnValue({
            chapters: [],
            loading: false,
            error: null,
            fetchChapters: mockFetchChapters
        });

        renderChapters();

        await waitFor(() => {
            expect(screen.getByText(/No chapters yet/i)).toBeInTheDocument();
        });
        expect(mockFetchChapters).toHaveBeenCalledWith('story1');
    });

    it("should render chapters when they exist", async () => {
        (useChapterStore as any).mockReturnValue({
            chapters: mockChapters,
            loading: false,
            error: null,
            fetchChapters: mockFetchChapters
        });

        renderChapters();

        await waitFor(() => {
            expect(screen.getByText(/Chapter 1/i)).toBeInTheDocument();
            expect(screen.getByText(/Chapter 2/i)).toBeInTheDocument();
        });
    });

    it("should show error state", async () => {
        const errorMessage = "Failed to fetch chapters";
        (useChapterStore as any).mockReturnValue({
            chapters: [],
            loading: false,
            error: errorMessage,
            fetchChapters: mockFetchChapters
        });

        renderChapters();

        await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
        });
    });

    it("should open create chapter dialog and create new chapter", async () => {
        const user = userEvent.setup();

        (useChapterStore as any).mockReturnValue({
            chapters: [],
            loading: false,
            error: null,
            fetchChapters: mockFetchChapters,
            createChapter: mockCreateChapter
        });

        renderChapters();

        // Open dialog
        const newChapterButton = await screen.findByRole('button', { name: /New Chapter/i });
        await user.click(newChapterButton);

        // Fill form
        const titleInput = await screen.findByLabelText(/Title/i);
        const povCharacterInput = await screen.findByLabelText(/POV Character/i);

        await user.type(titleInput, "New Test Chapter");
        await user.type(povCharacterInput, "Test Character");

        // Submit form
        const createButton = await screen.findByRole("button", { name: /Create Chapter/i });
        await user.click(createButton);

        await waitFor(() => {
            expect(mockCreateChapter).toHaveBeenCalledWith(expect.objectContaining({
                title: "New Test Chapter",
                povCharacter: "Test Character",
                content: "",
                storyId: "story1"
            }));
        });
    });
}); 