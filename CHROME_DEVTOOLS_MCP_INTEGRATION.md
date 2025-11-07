# Chrome DevTools MCP Integration for ShaderForge

## Overview

ShaderForge now includes Chrome DevTools MCP integration for automated browser testing and performance analysis. This enables AI-powered testing and debugging workflows.

## What's Been Added

### Directory Structure

```
ShaderForge/
├── tests/
│   ├── TESTING_GUIDE.md              # Comprehensive testing guide
│   └── e2e/
│       ├── README.md                 # E2E testing overview
│       ├── QUICK_START.md            # 5-minute quick start guide
│       ├── package.json              # Test scripts
│       ├── mcp-config.json           # MCP server configuration
│       ├── basic-frontend-test.js    # Basic load & performance test
│       ├── shader-editor-test.js     # Shader editor workflow test
│       └── api-integration-test.js   # API integration test
└── GETTING_STARTED.md                # Updated with testing section
```

### Test Files

#### 1. `basic-frontend-test.js`
Tests basic page loading and performance:
- Page loads successfully
- No console errors
- Expected UI elements present
- Load time within thresholds

#### 2. `shader-editor-test.js`
Tests complete shader editor workflow:
- Node creation and deletion
- Node connections
- Shader compilation
- Preview updates
- UI responsiveness

#### 3. `api-integration-test.js`
Tests frontend-backend API integration:
- API endpoint availability
- Request/response cycles
- Error handling
- Network performance
- CORS configuration

### Documentation

#### `TESTING_GUIDE.md`
Comprehensive testing guide covering:
- Testing strategy
- Chrome DevTools MCP setup
- E2E tests
- Backend tests
- Frontend tests
- Performance testing
- CI/CD integration
- Troubleshooting

#### `QUICK_START.md`
Quick reference for getting started:
- Setup instructions
- Common commands
- Example usage
- Troubleshooting tips

#### `README.md` (in tests/e2e)
Overview of E2E testing:
- What is Chrome DevTools MCP
- Installation instructions
- Usage examples
- Test scenarios

## Installation

### For Claude Code CLI

```bash
claude mcp add chrome-devtools npx chrome-devtools-mcp@latest
```

### For Other AI Assistants

See `tests/e2e/mcp-config.json` for configuration.

## Usage

### With AI Assistant

Ask your AI assistant:

**Performance testing:**
> "Navigate to http://localhost:5173 and check the page performance"

**Workflow testing:**
> "Execute the shader editor workflow test for ShaderForge"

**API testing:**
> "Monitor the ShaderForge frontend network activity and test all API endpoints"

### Manual Testing

```bash
cd tests/e2e

# Run individual tests
node basic-frontend-test.js
node shader-editor-test.js
node api-integration-test.js

# Run all tests
npm run test:all
```

## Prerequisites

Before running tests:

1. **Backend running:**
   ```bash
   cd src/backend
   uvicorn main:app --reload
   ```

2. **Frontend running:**
   ```bash
   cd src/frontend
   npm run dev
   ```

3. **Services running:**
   ```bash
   docker-compose up -d
   ```

## Features

### Performance Analysis
- Record execution traces
- Measure load times
- Profile rendering performance
- Generate performance insights

### Browser Debugging
- Inspect network activity
- Capture screenshots
- Monitor console messages
- Track JavaScript errors

### Reliable Automation
- Execute browser actions
- Automatic result validation
- Element interaction
- Form filling

## Test Scenarios

### 1. Basic Frontend Load
Tests that the frontend loads correctly with good performance.

### 2. Shader Editor Workflow
Tests the complete workflow of creating and compiling a shader:
1. Open editor
2. Add UV node
3. Add Noise node
4. Connect nodes
5. Add Output node
6. Compile shader
7. Verify preview

### 3. API Integration
Tests all API endpoints:
- Health check
- Search shaders
- Get stats
- Compile shader
- AI generate shader

## Performance Targets

### Frontend
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Total Load Time: < 5s
- Shader Compilation: < 2s

### Backend
- Health check: < 100ms
- Search query: < 500ms
- Stats query: < 300ms
- Shader compilation: < 2s
- AI generation: < 5s

## Integration Benefits

1. **Automated Testing**: AI can run comprehensive tests automatically
2. **Performance Monitoring**: Track performance metrics over time
3. **Visual Debugging**: Capture screenshots at any point
4. **Network Analysis**: Monitor all API calls and responses
5. **Error Detection**: Catch console errors and JavaScript issues
6. **Workflow Validation**: Test complete user workflows end-to-end

## Example Commands

### Performance
```
"Check the performance of http://localhost:5173"
"Measure load time of the shader editor"
"Profile the Three.js rendering performance"
```

### Debugging
```
"Capture a screenshot of the current state"
"Show me the console logs"
"Monitor network requests"
"Check for JavaScript errors"
```

### Automation
```
"Navigate to the editor and add a UV node"
"Create a shader with noise and output nodes"
"Test the compile button"
"Verify the preview updates"
```

### Network Analysis
```
"Monitor API calls to the backend"
"Check response times for shader compilation"
"Test error handling with invalid input"
```

## Troubleshooting

### Common Issues

**Cannot connect to Chrome**
- Ensure Chrome is installed
- Check version: `google-chrome --version`

**Page not loading**
- Verify frontend: `curl http://localhost:5173`
- Check backend: `curl http://localhost:8000/api/v1/health`

**Tests timing out**
- Increase timeout in test configs
- Check if services are responsive

**MCP not working**
- Restart AI assistant
- Verify Node.js: `node --version` (>= 20.19)
- Check config: `cat tests/e2e/mcp-config.json`

## Security Note

The Chrome DevTools MCP server exposes browser content to MCP clients. Avoid using it with sensitive information during test sessions.

## Future Enhancements

- [ ] CI/CD integration with GitHub Actions
- [ ] Visual regression testing
- [ ] Performance regression detection
- [ ] Automated accessibility testing
- [ ] Load testing scenarios
- [ ] Multi-browser support
- [ ] Test coverage reporting

## Resources

- [Chrome DevTools MCP GitHub](https://github.com/ChromeDevTools/chrome-devtools-mcp)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Testing Guide](./tests/TESTING_GUIDE.md)
- [Quick Start](./tests/e2e/QUICK_START.md)

## Contributing

To add new tests:

1. Create test file in `tests/e2e/`
2. Follow existing test structure
3. Add documentation
4. Update test guides
5. Submit PR

---

For questions or issues, please open an issue on GitHub.
