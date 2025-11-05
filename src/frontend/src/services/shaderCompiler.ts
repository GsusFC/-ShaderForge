import { CompileRequest, CompileResponse } from '../types/shaderTypes'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/**
 * Transform Shadertoy-style shader (mainImage) to standard GLSL (main)
 */
export function transformShaderToStandardGLSL(shadertoyCode: string): string {
  // If code already has a main() function, return as-is
  if (shadertoyCode.includes('void main()')) {
    return shadertoyCode
  }

  // Check if it's a Shadertoy-style shader with mainImage
  if (!shadertoyCode.includes('void mainImage')) {
    // If no mainImage and no main, wrap it in a basic shader
    return `
precision highp float;

uniform vec2 iResolution;
uniform float iTime;
uniform vec2 iMouse;
varying vec2 vUv;

void main() {
  vec2 fragCoord = vUv * iResolution;
  vec4 fragColor = vec4(0.0);

  ${shadertoyCode}

  gl_FragColor = fragColor;
}
`
  }

  // Transform mainImage to main
  let transformedCode = shadertoyCode

  // Replace mainImage signature with main
  transformedCode = transformedCode.replace(
    /void\s+mainImage\s*\(\s*out\s+vec4\s+fragColor\s*,\s*in\s+vec2\s+fragCoord\s*\)/g,
    'void main()'
  )

  // Add varying vUv at the top if not present
  if (!transformedCode.includes('varying vec2 vUv')) {
    transformedCode = 'varying vec2 vUv;\n\n' + transformedCode
  }

  // Calculate fragCoord from vUv inside main
  transformedCode = transformedCode.replace(
    /void\s+main\s*\(\s*\)\s*\{/,
    `void main() {
  vec2 fragCoord = vUv * iResolution;
  vec4 fragColor = vec4(0.0);
`
  )

  // Replace fragColor assignments with gl_FragColor at the end
  // Find the last closing brace of main() and add gl_FragColor assignment
  const mainBodyMatch = transformedCode.match(/void\s+main\s*\(\s*\)\s*\{([\s\S]*)\}/)
  if (mainBodyMatch) {
    let mainBody = mainBodyMatch[1]

    // If fragColor is assigned, copy it to gl_FragColor at the end
    if (mainBody.includes('fragColor')) {
      mainBody = mainBody.trim()
      // Add gl_FragColor assignment before the last closing brace
      transformedCode = transformedCode.replace(
        /void\s+main\s*\(\s*\)\s*\{[\s\S]*\}/,
        `void main() {
${mainBody}
  gl_FragColor = fragColor;
}`
      )
    }
  }

  return transformedCode
}

/**
 * Compile a shader graph to GLSL code
 */
export async function compileShaderGraph(request: CompileRequest): Promise<CompileResponse> {
  const response = await fetch(`${API_URL}/api/v1/nodes/graph/compile-and-validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(`Compilation failed: ${response.statusText}`)
  }

  const data: CompileResponse = await response.json()
  return data
}

/**
 * Compile and transform shader graph to standard GLSL
 */
export async function compileAndTransformShaderGraph(
  request: CompileRequest
): Promise<{ shader: string; uniforms: any[]; error?: string }> {
  try {
    const result = await compileShaderGraph(request)

    if (!result.success || result.compilation.error) {
      return {
        shader: '',
        uniforms: [],
        error: result.compilation.error || 'Compilation failed',
      }
    }

    // Transform the compiled code to standard GLSL
    const transformedCode = transformShaderToStandardGLSL(result.compilation.code)

    return {
      shader: transformedCode,
      uniforms: result.compilation.uniforms || [],
      error: undefined,
    }
  } catch (error) {
    console.error('Shader compilation error:', error)
    return {
      shader: '',
      uniforms: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Validate GLSL shader code
 */
export async function validateShaderCode(code: string): Promise<{
  is_valid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
}> {
  const response = await fetch(`${API_URL}/api/v1/nodes/shader/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  })

  if (!response.ok) {
    throw new Error(`Validation failed: ${response.statusText}`)
  }

  return await response.json()
}
