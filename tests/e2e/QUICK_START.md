# Quick Start: Chrome DevTools MCP with ShaderForge

Get started with browser automation testing in 5 minutes.

## Prerequisites

- Node.js >= 20.19
- Chrome browser
- ShaderForge running (frontend + backend)

## Step 1: Setup (One-time)

### For Claude Code Users

```bash
claude mcp add chrome-devtools npx chrome-devtools-mcp@latest
```

That's it! The MCP server is now available to your AI assistant.

### For Other Editors

See `mcp-config.json` for configuration.

## Step 2: Start Your Services

```bash
# Terminal 1: Start Docker services
docker-compose up -d

# Terminal 2: Start backend
cd src/backend
uvicorn main:app --reload

# Terminal 3: Start frontend
cd src/frontend
npm run dev
```

## Step 3: Run Tests

### Option A: With AI Assistant (Recommended)

Just ask:

**Basic test:**
> "Navigate to http://localhost:5173 and check the page performance"

**Full workflow:**
> "Execute the shader editor workflow test for ShaderForge"

**API testing:**
> "Monitor the ShaderForge frontend network activity and test all API endpoints"

### Option B: Manual Testing

```bash
cd tests/e2e
node basic-frontend-test.js
node shader-editor-test.js
node api-integration-test.js
```

## What to Test

### 1. Basic Frontend Load
- Page loads successfully
- No console errors
- UI elements present
- Performance metrics

### 2. Shader Editor Workflow
- Add nodes to canvas
- Connect nodes
- Compile shader
- Verify preview

### 3. API Integration
- Health check
- Search shaders
- Compile shader
- AI generation

## Example Session

```
You: Navigate to http://localhost:5173 and check performance

AI: I'll navigate to ShaderForge and analyze its performance.
    [Uses Chrome DevTools MCP to:]
    - Launch Chrome
    - Navigate to URL
    - Record performance metrics
    - Capture screenshot
    - Check console

    Results:
    ✓ Page loaded in 2.3s
    ✓ First Contentful Paint: 1.1s
    ✓ Time to Interactive: 2.1s
    ✓ No console errors
    ✓ All UI elements present
```

## Common Commands

Ask your AI assistant:

### Performance
- "Check the performance of http://localhost:5173"
- "Measure load time of the shader editor"
- "Profile the Three.js rendering performance"

### Debugging
- "Capture a screenshot of the current state"
- "Show me the console logs"
- "Monitor network requests"
- "Check for JavaScript errors"

### Automation
- "Navigate to the editor and add a UV node"
- "Create a shader with noise and output nodes"
- "Test the compile button"
- "Verify the preview updates"

### Network Analysis
- "Monitor API calls to the backend"
- "Check response times for shader compilation"
- "Test error handling with invalid input"

## Troubleshooting

### "Cannot connect to Chrome"
- Ensure Chrome is installed
- Try: `google-chrome --version`

### "Page not loading"
- Verify frontend is running: `curl http://localhost:5173`
- Check backend: `curl http://localhost:8000/api/v1/health`

### "Tests timing out"
- Increase timeout in test configs
- Check if services are responsive

### "MCP not working"
- Restart your AI assistant
- Verify Node.js version: `node --version`
- Check configuration: `cat mcp-config.json`

## Next Steps

1. Read full guide: `cat ../TESTING_GUIDE.md`
2. Explore test scripts: `ls -la *.js`
3. Customize for your needs
4. Add your own test scenarios

## Tips

- Start with basic tests before complex workflows
- Use screenshots to debug UI issues
- Monitor console for error messages
- Check network tab for API issues
- Performance test regularly during development

## Resources

- [Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp)
- [Testing Guide](../TESTING_GUIDE.md)
- [ShaderForge Docs](../../files/)

---

Happy testing! 🚀
