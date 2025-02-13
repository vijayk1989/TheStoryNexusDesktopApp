import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router";
import Home from "./features/stories/pages/Home.tsx";
import About from "./routes/About.tsx";
import Chapters from "./features/chapters/pages/Chapters.tsx";
import ChapterEditorPage from "./features/chapters/pages/ChapterEditorPage.tsx";
import PromptsPage from "./features/prompts/pages/PromptsPage.tsx";
import AISettingsPage from "./features/ai/pages/AISettingsPage.tsx";
import { ThemeProvider } from "./lib/theme-provider";
import { MainLayout } from "./components/MainLayout.tsx";
import "./index.css";
import { ToastContainer } from 'react-toastify';
import StoryDashboard from "./features/stories/pages/StoryDashboard.tsx";
import { StoryProvider } from '@/features/stories/context/StoryContext';

// biome-ignore lint/style/noNonNullAssertion: <explanation>
ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<ThemeProvider defaultTheme="dark" storageKey="app-theme">
			<StoryProvider>
				<BrowserRouter>
					<Routes>
						<Route element={<MainLayout />}>
							<Route path="/" element={<Home />} />
							<Route path="/about" element={<About />} />
						</Route>
						<Route path="/dashboard" element={<StoryDashboard />}>
							<Route path=":storyId" element={<Navigate to="chapters" replace />} />
							<Route path=":storyId/chapters" element={<Chapters />} />
							<Route path=":storyId/chapters/:chapterId" element={<ChapterEditorPage />} />
							<Route path=":storyId/prompts" element={<PromptsPage />} />
							<Route path="ai-settings" element={<AISettingsPage />} />
						</Route>
					</Routes>
					<ToastContainer />
				</BrowserRouter>
			</StoryProvider>
		</ThemeProvider>
	</React.StrictMode>,
);

// Use contextBridge
window.ipcRenderer.on("main-process-message", (_event, message) => {
	console.log(message);
});
