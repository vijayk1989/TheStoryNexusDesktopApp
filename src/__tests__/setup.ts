import { cleanup } from "@testing-library/react";
import { expect, afterEach, vi } from "vitest";
import matchers from '@testing-library/jest-dom/matchers';
import 'fake-indexeddb/auto';  // This will handle all IndexedDB mocking

// Extend Vitest's expect with Testing Library matchers
expect.extend(matchers);

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});
