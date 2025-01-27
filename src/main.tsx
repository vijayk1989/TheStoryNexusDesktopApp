import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./routes/Home.tsx";
import Dashboard from "./dashboard.tsx";
import Story from "./routes/Story.tsx";
import Settings from "./routes/Settings.tsx";
import Guides from "./routes/Guides.tsx";
import About from "./routes/About.tsx";
import { ThemeProvider } from "./lib/theme-provider";
import { MainLayout } from "./components/main-layout.tsx";
import "./index.css";

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
						<Route path=":storyId" element={<Story />} />
						<Route path="settings" element={<Settings />} />
						<Route path="guides" element={<Guides />} />
					</Route>
				</Routes>
			</BrowserRouter>
		</ThemeProvider>
	</React.StrictMode>,
);

// Use contextBridge
window.ipcRenderer.on("main-process-message", (_event, message) => {
	console.log(message);
});
