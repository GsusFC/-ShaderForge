/**
 * API Integration Test for ShaderForge AI
 *
 * This script tests the integration between frontend and backend:
 * 1. Test API endpoints
 * 2. Verify request/response cycles
 * 3. Check error handling
 * 4. Monitor network performance
 *
 * Prerequisites:
 * - Backend running on http://localhost:8000
 * - Frontend running on http://localhost:5173
 * - Chrome DevTools MCP configured
 *
 * Usage:
 * Ask your AI assistant: "Run the API integration test"
 */

const API_TEST_CONFIG = {
  backendUrl: 'http://localhost:8000',
  frontendUrl: 'http://localhost:5173',

  // API endpoints to test
  endpoints: [
    {
      name: 'Health Check',
      method: 'GET',
      url: '/api/v1/health',
      expectedStatus: 200,
      expectedResponse: { status: 'healthy' }
    },
    {
      name: 'Search Shaders',
      method: 'GET',
      url: '/api/v1/search/shaders?q=noise&limit=5',
      expectedStatus: 200,
      expectedFields: ['results', 'total', 'query']
    },
    {
      name: 'Get Stats',
      method: 'GET',
      url: '/api/v1/search/stats',
      expectedStatus: 200,
      expectedFields: ['total_shaders', 'categories']
    },
    {
      name: 'Compile Shader',
      method: 'POST',
      url: '/api/v1/shader/compile',
      body: {
        nodes: [
          { id: '1', type: 'uv', position: { x: 0, y: 0 } },
          { id: '2', type: 'output', position: { x: 200, y: 0 } }
        ],
        connections: [
          { source: '1', target: '2' }
        ]
      },
      expectedStatus: 200,
      expectedFields: ['vertexShader', 'fragmentShader', 'success']
    },
    {
      name: 'AI Generate Shader',
      method: 'POST',
      url: '/api/v1/ai/generate',
      body: {
        prompt: 'Create a simple noise shader',
        style: 'procedural'
      },
      expectedStatus: 200,
      expectedFields: ['nodes', 'connections', 'success']
    }
  ],

  // Performance thresholds (in milliseconds)
  performance: {
    healthCheck: 100,
    search: 500,
    stats: 300,
    compile: 2000,
    aiGenerate: 5000
  },

  // Network monitoring
  monitoring: {
    captureRequests: true,
    captureResponses: true,
    captureHeaders: true,
    captureTimings: true,
    captureCookies: false
  }
};

/**
 * Test Instructions for AI Agent:
 *
 * 1. Navigate to frontend
 * 2. Open Network tab in DevTools
 * 3. For each endpoint:
 *    a. Make the request
 *    b. Verify response status
 *    c. Validate response body
 *    d. Check response time
 *    e. Look for errors
 * 4. Generate integration report
 */

module.exports = {
  API_TEST_CONFIG,

  /**
   * Test Scenarios
   */
  scenarios: [
    {
      name: 'Basic API Connectivity',
      steps: [
        'Navigate to frontend',
        'Open DevTools Network tab',
        'Trigger API calls through UI',
        'Verify all calls succeed',
        'Check response times'
      ]
    },
    {
      name: 'Shader Compilation Flow',
      steps: [
        'Create shader graph in editor',
        'Click compile button',
        'Monitor compile API call',
        'Verify shader code returned',
        'Check preview updates'
      ]
    },
    {
      name: 'AI Generation Flow',
      steps: [
        'Enter AI prompt',
        'Click generate button',
        'Monitor AI generate API call',
        'Verify nodes returned',
        'Check graph updates'
      ]
    },
    {
      name: 'Error Handling',
      steps: [
        'Test with invalid inputs',
        'Monitor error responses',
        'Verify error messages',
        'Check UI error handling',
        'Confirm graceful degradation'
      ]
    }
  ],

  /**
   * Expected Results
   */
  expectedResults: {
    allEndpointsRespond: true,
    allResponsesValid: true,
    noNetworkErrors: true,
    withinPerformanceThresholds: true,
    errorHandlingWorks: true,
    corsConfigured: true
  },

  /**
   * Common Issues and Solutions
   */
  troubleshooting: {
    'CORS errors': 'Check backend CORS configuration in main.py',
    'Connection refused': 'Verify backend is running on port 8000',
    'Timeout errors': 'Check backend logs for slow queries',
    '404 Not Found': 'Verify API route exists in backend/api/',
    '500 Server Error': 'Check backend logs for Python exceptions',
    'Invalid JSON': 'Verify request body format matches API spec'
  },

  /**
   * Manual Testing (without MCP)
   */
  manualSteps: [
    '1. Open Chrome DevTools (F12)',
    '2. Go to Network tab',
    '3. Navigate to http://localhost:5173',
    '4. Perform actions in UI (compile, generate, etc.)',
    '5. Observe API calls in Network tab',
    '6. Check Response tab for each call',
    '7. Verify status codes and response bodies',
    '8. Check Console tab for any errors'
  ],

  /**
   * Direct API Testing with curl
   */
  curlCommands: [
    'curl http://localhost:8000/api/v1/health',
    'curl "http://localhost:8000/api/v1/search/shaders?q=noise&limit=5"',
    'curl http://localhost:8000/api/v1/search/stats',
    'curl -X POST http://localhost:8000/api/v1/shader/compile -H "Content-Type: application/json" -d \'{"nodes":[],"connections":[]}\'',
    'curl -X POST http://localhost:8000/api/v1/ai/generate -H "Content-Type: application/json" -d \'{"prompt":"noise shader","style":"procedural"}\''
  ]
};

console.log('ShaderForge API Integration Test Configuration Loaded');
console.log('Endpoints to test:', API_TEST_CONFIG.endpoints.length);
console.log('Test scenarios:', module.exports.scenarios.length);
console.log('\nTo run this test, ask your AI assistant:');
console.log('"Monitor the ShaderForge frontend network activity and test all API endpoints"');
console.log('\nOr test manually with curl commands:');
module.exports.curlCommands.forEach(cmd => console.log('  ' + cmd));
