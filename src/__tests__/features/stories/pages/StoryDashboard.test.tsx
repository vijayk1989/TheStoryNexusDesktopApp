import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import StoryDashboard from "@/features/stories/pages/StoryDashboard";
import { useStoryStore } from "@/features/stories/stores/useStoryStore";
import { BrowserRouter, useParams, useLocation } from "react-router";
import userEvent from "@testing-library/user-event";

// Mock the stores and hooks
vi.mock("@/features/stories/stores/useStoryStore", () => ({
    useStoryStore: vi.fn()
}));

vi.mock("react-router", async () => {
    const actual = await vi.importActual("react-router");
    return {
        ...actual,
        useParams: vi.fn(),
        useLocation: vi.fn()
    };
});

describe("StoryDashboard", () => {
    const mockGetStory = vi.fn();
    const user = userEvent.setup();
    const mockStory = {
        id: "1",
        title: "Test Story",
        author: "Test Author",
        language: "English",
        synopsis: "Test Synopsis",
        createdAt: new Date()
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useStoryStore as any).mockReturnValue({
            currentStory: mockStory,
            getStory: mockGetStory
        });
        (useParams as any).mockReturnValue({ storyId: "1" });
        (useLocation as any).mockReturnValue({ pathname: "/dashboard/1/chapters" });
    });

    const renderDashboard = () => {
        return render(
            <BrowserRouter>
                <StoryDashboard />
            </BrowserRouter>
        );
    };

    it("should render dashboard with story title when story exists", () => {
        renderDashboard();
        expect(screen.getByText("Test Story")).toBeInTheDocument();
        expect(mockGetStory).toHaveBeenCalledWith("1");
    });

    it("should render navigation buttons", () => {
        renderDashboard();

        // Check for navigation buttons
        expect(screen.getByRole("link", { name: /Chapters/i })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /Prompts/i })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /AI Chats/i })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /Story Settings/i })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /Home/i })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /AI Settings/i })).toBeInTheDocument();
    });

    it("should highlight active navigation item", async () => {
        renderDashboard();

        const chaptersLink = screen.getByRole("link", { name: /Chapters/i });
        expect(chaptersLink).toHaveClass("bg-accent");
    });

    it("should not fetch story when storyId is not present", () => {
        (useParams as any).mockReturnValue({ storyId: undefined });
        renderDashboard();

        expect(mockGetStory).not.toHaveBeenCalled();
    });

    it("should handle write path as active for chapters", () => {
        (useLocation as any).mockReturnValue({ pathname: "/dashboard/1/write" });
        renderDashboard();

        const chaptersLink = screen.getByRole("link", { name: /Chapters/i });
        expect(chaptersLink).toHaveClass("bg-accent");
    });

    it("should navigate to correct routes when clicking navigation buttons", async () => {
        renderDashboard();

        const promptsLink = screen.getByRole("link", { name: /Prompts/i });
        await user.click(promptsLink);
        expect(promptsLink.getAttribute("href")).toBe("/dashboard/1/prompts");

        const chatsLink = screen.getByRole("link", { name: /AI Chats/i });
        await user.click(chatsLink);
        expect(chatsLink.getAttribute("href")).toBe("/dashboard/1/chats");
    });
}); 