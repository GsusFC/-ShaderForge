# ShaderForge E2E Testing with Chrome DevTools MCP

This directory contains end-to-end tests and automation scripts for ShaderForge AI using the Chrome DevTools MCP server.

## What is Chrome DevTools MCP?

Chrome DevTools MCP is a Model Context Protocol server that enables AI agents to control and inspect live Chrome browser instances. It provides:

- **Performance Analysis**: Record execution traces and analyze page performance
- **Browser Debugging**: Inspect network activity, capture screenshots, monitor console
- **Reliable Automation**: Execute browser actions using Puppeteer with validation

## Prerequisites

- Node.js v20.19 or newer LTS
- Chrome browser (current stable version or newer)
- npm package manager

## Installation

The Chrome DevTools MCP server runs via npx without separate installation. It's configured in `mcp-config.json`.

### For Claude Code CLI

```bash
claude mcp add chrome-devtools npx chrome-devtools-mcp@latest
```

### For Other Editors

See `mcp-config.json` for the configuration format.

## Usage

### Example Test Scenarios

1. **Frontend Load Testing**
   ```
   Check the performance of http://localhost:5173
   ```

2. **UI Automation**
   - Navigate to shader editor
   - Create a new node
   - Connect nodes
   - Compile shader

3. **Network Monitoring**
   - Capture API calls to backend
   - Validate response times
   - Check for errors

### Test Scripts

Run the example scripts:

```bash
# Basic frontend test
node basic-frontend-test.js

# Shader editor workflow test
node shader-editor-test.js

# API integration test
node api-integration-test.js
```

## Test Files

- `basic-frontend-test.js`: Simple load and performance test
- `shader-editor-test.js`: Full shader editor workflow test
- `api-integration-test.js`: Backend API integration test
- `mcp-config.json`: MCP server configuration

## Security Note

The Chrome DevTools MCP server exposes browser content to MCP clients. Avoid using it with sensitive information during test sessions.

## Documentation

- [Chrome DevTools MCP GitHub](https://github.com/ChromeDevTools/chrome-devtools-mcp)
- [Model Context Protocol](https://modelcontextprotocol.io)
