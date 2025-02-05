import react from "@vitejs/plugin-react";

import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	test: {
		globals: true,
		environment: "happy-dom",
		setupFiles: ["./src/__tests__/setup.ts"],
		coverage: {
			provider: "istanbul",
			reporter: ["text", "json", "html"],
			enabled: true,
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	server: {
		port: 51204,
		host: "0.0.0.0",
	},
});
