# ShaderForge Testing Guide

This guide covers testing strategies and tools for ShaderForge AI, including the Chrome DevTools MCP integration for automated browser testing.

## Table of Contents

1. [Testing Strategy](#testing-strategy)
2. [Chrome DevTools MCP](#chrome-devtools-mcp)
3. [E2E Tests](#e2e-tests)
4. [Backend Tests](#backend-tests)
5. [Frontend Tests](#frontend-tests)

## Testing Strategy

ShaderForge uses a multi-layer testing approach:

- **Unit Tests**: Individual component/function testing
- **Integration Tests**: API and component interaction testing
- **E2E Tests**: Full user workflow testing with browser automation
- **Performance Tests**: Load time and render performance testing

## Chrome DevTools MCP

### What is Chrome DevTools MCP?

Chrome DevTools MCP is a Model Context Protocol server that enables AI coding assistants to control and inspect live Chrome browser instances. It's particularly useful for:

- Automated UI testing
- Performance profiling
- Network monitoring
- Screenshot capture
- Console log inspection

### Installation

#### For Claude Code CLI

```bash
claude mcp add chrome-devtools npx chrome-devtools-mcp@latest
```

#### For Other AI Assistants

Add to your MCP configuration:

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"]
    }
  }
}
```

### Configuration

The MCP configuration is located at: `tests/e2e/mcp-config.json`

## E2E Tests

End-to-end tests are located in `tests/e2e/` and cover complete user workflows.

### Available Tests

#### 1. Basic Frontend Test (`basic-frontend-test.js`)

Tests basic page loading and performance:

```bash
cd tests/e2e
node basic-frontend-test.js
```

**Or with AI assistant:**
> "Navigate to http://localhost:5173 and check the page performance"

**What it tests:**
- Page loads successfully
- No console errors
- Expected UI elements present
- Load time within threshold

#### 2. Shader Editor Test (`shader-editor-test.js`)

Tests the complete shader editor workflow:

```bash
cd tests/e2e
node shader-editor-test.js
```

**Or with AI assistant:**
> "Execute the shader editor workflow test for ShaderForge"

**What it tests:**
- Node creation and deletion
- Node connections
- Shader compilation
- Preview updates
- UI responsiveness

#### 3. API Integration Test (`api-integration-test.js`)

Tests frontend-backend API integration:

```bash
cd tests/e2e
node api-integration-test.js
```

**Or with AI assistant:**
> "Monitor the ShaderForge frontend network activity and test all API endpoints"

**What it tests:**
- API endpoint availability
- Request/response cycles
- Error handling
- Network performance
- CORS configuration

### Running All E2E Tests

```bash
cd tests/e2e
npm run test:all
```

### Prerequisites for E2E Tests

Before running E2E tests, ensure:

1. **Backend is running:**
   ```bash
   cd src/backend
   uvicorn main:app --reload
   ```

2. **Frontend is running:**
   ```bash
   cd src/frontend
   npm run dev
   ```

3. **Services are running:**
   ```bash
   docker-compose up -d
   ```

## Backend Tests

Backend tests use pytest and are located in `src/backend/`.

### Running Backend Tests

```bash
cd src/backend
pytest test_compiler.py -v
```

### Test Coverage

- Shader compilation
- Node graph validation
- API endpoints
- Database operations

## Frontend Tests

Frontend tests use Vitest and are configured in `src/frontend/`.

### Running Frontend Tests

```bash
cd src/frontend
npm run test
```

### Running with UI

```bash
cd src/frontend
npm run test:ui
```

### Test Coverage

- React components
- State management (Zustand)
- ReactFlow interactions
- Three.js shader rendering

## Manual Testing Checklist

### Frontend

- [ ] Page loads without errors
- [ ] Node palette opens/closes
- [ ] Nodes can be added to canvas
- [ ] Nodes can be connected
- [ ] Nodes can be deleted
- [ ] Shader compiles successfully
- [ ] Preview updates correctly
- [ ] UI is responsive
- [ ] No console errors

### Backend

- [ ] Health check responds
- [ ] Search API works
- [ ] Stats API works
- [ ] Compile API works
- [ ] AI generate API works
- [ ] Error handling works
- [ ] CORS configured correctly

### Integration

- [ ] Frontend connects to backend
- [ ] API calls succeed
- [ ] Data flows correctly
- [ ] Error messages display
- [ ] Loading states work

## Performance Testing

### Frontend Performance Targets

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Total Load Time: < 5s
- Shader Compilation: < 2s

### Backend Performance Targets

- Health check: < 100ms
- Search query: < 500ms
- Stats query: < 300ms
- Shader compilation: < 2s
- AI generation: < 5s

### Measuring Performance

#### With Chrome DevTools MCP

Ask your AI assistant:
> "Check the performance of http://localhost:5173"

#### Manual with DevTools

1. Open Chrome DevTools (F12)
2. Go to Lighthouse tab
3. Run performance audit
4. Check metrics

## Continuous Integration

### GitHub Actions (Future)

Add `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - uses: actions/setup-python@v2
      - run: npm install
      - run: npm test
      - run: pytest
```

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

#### Tests Timing Out

- Increase timeout in test config
- Check if services are running
- Verify network connectivity

#### Chrome DevTools MCP Not Working

- Ensure Node.js >= 20.19
- Verify Chrome is installed
- Check MCP configuration
- Restart AI assistant

#### CORS Errors

- Check backend CORS settings in `main.py`
- Verify frontend URL in CORS origins
- Check browser console for details

## Best Practices

1. **Always run tests locally before pushing**
2. **Write tests for new features**
3. **Keep tests independent**
4. **Use descriptive test names**
5. **Mock external dependencies**
6. **Test both success and failure cases**
7. **Keep test data separate**
8. **Document complex test scenarios**

## Resources

- [Chrome DevTools MCP GitHub](https://github.com/ChromeDevTools/chrome-devtools-mcp)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Vitest Documentation](https://vitest.dev)
- [Pytest Documentation](https://docs.pytest.org)
- [React Testing Library](https://testing-library.com/react)

## Contributing

When adding new tests:

1. Follow existing test structure
2. Add documentation
3. Update this guide
4. Ensure tests pass locally
5. Submit PR with test coverage

---

For questions or issues with testing, please open an issue on GitHub.
