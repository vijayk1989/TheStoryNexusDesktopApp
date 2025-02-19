# The Story Nexus Desktop App

A powerful AI-augmented writing environment for authors, featuring an intelligent story editor with integrated worldbuilding tools and AI assistance. Built as a local-first desktop application, ensuring your creative work remains private and accessible.

## Core Features

### 📝 Advanced Story Editor
- Built on Meta's Lexical framework for a powerful and extensible editing experience
- Custom scene beat system for structured story development
- Multiple POV support (First Person, Third Person Limited, Third Person Omniscient)
- Real-time word count and chapter management
- Smart outline tools with completion tracking

### 🌍 Lorebook System
- Comprehensive worldbuilding with categories for characters, locations, items, and events
- Intelligent tag detection that automatically surfaces relevant lorebook entries while writing
- Relationship mapping between story elements
- Customizable metadata fields for detailed world development

### 🤖 AI Integration
- Multiple AI model support (via OpenAI and OpenRouter)
- Context-aware AI assistance that understands your story's world
- Specialized AI prompts for:
  - Scene development
  - Story continuation
  - Summary generation
  - Selection-specific assistance
- AI chat system for brainstorming and story development

### 📚 Story Organization
- Multi-chapter story management
- Chapter outlining with beat tracking
- Flexible story metadata support
- Built-in synopsis and timeline tools

## Technical Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Editor**: Meta's Lexical framework with custom nodes and plugins
- **Database**: Local-first architecture using DexieJS (IndexedDB)
- **Desktop**: Electron for cross-platform support
- **Routing**: React Router for navigation
- **UI Components**: ShadcnUI for a modern, accessible interface

## Getting Started

1. **Installation**
```bash
npm install
```

2. **Development**
```bash
npm run dev
```

3. **Build**
```bash
npm run build
```

## AI Configuration

The app supports multiple AI providers:
- OpenAI (requires API key)
- OpenRouter (requires API key)

Configure your AI settings in the app's settings panel. All AI interactions are processed directly with the providers, ensuring your story data remains private.

## Data Storage

Story Nexus uses a local-first approach with IndexedDB (via DexieJS) for data storage. This means:
- All your data stays on your computer
- No account or authentication required
- Works offline
- Complete data privacy

## Contributing

Feel free to contribute! Please submit issues and pull requests on GitHub.

## License

This project is open source and available under the MIT License.