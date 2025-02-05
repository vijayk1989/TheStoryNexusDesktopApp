import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Home from "@/features/stories/pages/Home";
import { useStoryStore } from "@/features/stories/stores/useStoryStore";
import { BrowserRouter } from "react-router";

// Mock the store
vi.mock("@/features/stories/stores/useStoryStore", () => ({
    useStoryStore: vi.fn()
}));

// Mock Dexie
vi.mock('dexie', () => ({
    default: class Dexie {
        constructor() {
            return {
                version: () => ({ stores: () => { } }),
                table: () => ({
                    toArray: () => Promise.resolve([]),
                    add: () => Promise.resolve(),
                    delete: () => Promise.resolve(),
                    update: () => Promise.resolve()
                })
            };
        }
    }
}));

describe("Home page", () => {
    const mockFetchStories = vi.fn();

    const mockStories = [
        {
            id: "1",
            title: "Test Story 1",
            author: "Test Author",
            language: "English",
            synopsis: "Test Synopsis 1",
            createdAt: new Date().toISOString()
        },
        {
            id: "2",
            title: "Test Story 2",
            author: "Test Author",
            language: "English",
            synopsis: "Test Synopsis 2",
            createdAt: new Date().toISOString()
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderHome = () => {
        return render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );
    };

    it("should render empty state when no stories exist", () => {
        (useStoryStore as any).mockReturnValue({
            stories: [],
            fetchStories: mockFetchStories
        });

        renderHome();

        expect(screen.getByText("Story Writing App")).toBeInTheDocument();
        expect(screen.getByText("No stories yet. Create your first story to get started!")).toBeInTheDocument();
        expect(mockFetchStories).toHaveBeenCalledTimes(1);
    });

    it("should render stories grid when stories exist", () => {
        (useStoryStore as any).mockReturnValue({
            stories: mockStories,
            fetchStories: mockFetchStories
        });

        renderHome();

        expect(screen.getByText("Test Story 1")).toBeInTheDocument();
        expect(screen.getByText("Test Story 2")).toBeInTheDocument();
        expect(mockFetchStories).toHaveBeenCalledTimes(1);
    });

    it("should open edit dialog when edit button is clicked", () => {
        (useStoryStore as any).mockReturnValue({
            stories: mockStories,
            fetchStories: mockFetchStories
        });

        renderHome();

        // Find and click the first edit button using the text content
        const editButtons = screen.getAllByText("Edit");
        fireEvent.click(editButtons[0]);

        // The dialog should be open with the story title
        expect(screen.getByText("Edit Story")).toBeInTheDocument();
    });
});
