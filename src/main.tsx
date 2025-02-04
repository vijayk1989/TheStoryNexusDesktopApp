import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router";
import Home from "./routes/Home.tsx";
import Dashboard from "./dashboard.tsx";
import ChapterData from "./routes/ChapterData.tsx";
import About from "./routes/About.tsx";
import Chapters from "./routes/dashboard/Chapters.tsx";
import Prompts from "./routes/dashboard/Prompts.tsx";
import Chats from "./routes/dashboard/Chats.tsx";
import DefaultSettings from "./routes/dashboard/DefaultSettings.tsx";
import AISettings from "./routes/dashboard/AISettings.tsx";
import { ThemeProvider } from "./lib/theme-provider";
import { MainLayout } from "./components/main-layout.tsx";
import "./index.css";
import { ToastContainer } from 'react-toastify';

// biome-ignore lint/style/noNonNullAssertion: <explanation>
ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<ThemeProvider defaultTheme="dark" storageKey="app-theme">
			<BrowserRouter>
				<Routes>
					<Route element={<MainLayout />}>
						<Route path="/" element={<Home />} />
						<Route path="/about" element={<About />} />
					</Route>
					<Route path="/dashboard" element={<Dashboard />}>
						<Route path=":storyId" element={<Navigate to="chapters" replace />} />
						<Route path=":storyId/chapters" element={<Chapters />} />
						<Route path=":storyId/chapters/write" element={<ChapterData />} />
						<Route path=":storyId/prompts" element={<Prompts />} />
						<Route path=":storyId/chats" element={<Chats />} />
						<Route path=":storyId/settings" element={<DefaultSettings />} />

						<Route path="ai-settings" element={<AISettings />} />
					</Route>
				</Routes>
				<ToastContainer />
			</BrowserRouter>
		</ThemeProvider>
	</React.StrictMode>,
);

// Use contextBridge
window.ipcRenderer.on("main-process-message", (_event, message) => {
	console.log(message);
});
