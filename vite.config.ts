import { defineConfig } from "vite";
import path from "node:path";
import electron from "vite-plugin-electron/simple";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		electron({
			main: {
				// Shortcut of `build.lib.entry`.
				entry: "electron/main.ts",
			},
			preload: {
				// Shortcut of `build.rollupOptions.input`.
				// Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
				input: path.join(__dirname, "electron/preload.ts"),
			},
			// Ployfill the Electron and Node.js API for Renderer process.
			// If you want use Node.js in Renderer process, the `nodeIntegration` needs to be enabled in the Main process.
			// See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
			renderer:
				process.env.NODE_ENV === "test"
					? // https://github.com/electron-vite/vite-plugin-electron-renderer/issues/78#issuecomment-2053600808
					undefined
					: {},
		}),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			'@lexical-playground': path.resolve(__dirname, 'src/Lexical/lexical-playground/src'),
			'shared': path.resolve(__dirname, 'src/Lexical/shared/src'),
			// Add this to resolve Lexical packages properly
			'lexical': path.resolve(__dirname, 'node_modules/lexical'),
			'@lexical/react': path.resolve(__dirname, 'node_modules/@lexical/react'),
		},
	},
	optimizeDeps: {
		include: [
			'prismjs',
			'lexical',
			'@lexical/react',
			'@lexical/code',
			'@lexical/rich-text',
			'@lexical/list',
			'@lexical/table',
			'@lexical/file',
			'@lexical/clipboard',
			'@lexical/hashtag',
			'@lexical/link',
			'@lexical/overflow',
			'@lexical/markdown',
		],
	},
	define: {
		__DEV__: process.env.NODE_ENV !== 'production',
	},
	build: {
		rollupOptions: {
			external: ["electron"], // This ensures electron modules are externalized
		},
	},

});
