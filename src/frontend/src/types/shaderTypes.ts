// Shader compilation types

export interface ShaderUniform {
  name: string
  type: 'float' | 'vec2' | 'vec3' | 'vec4' | 'sampler2D'
  value?: any
}

export interface CompiledShader {
  code: string
  uniforms: ShaderUniform[]
  functions: string[]
  error?: string
  warnings?: string[]
}

export interface ValidationResult {
  is_valid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
}

export interface CompileResponse {
  success: boolean
  compilation: {
    code: string
    uniforms: ShaderUniform[]
    functions: string[]
    error?: string
    warnings?: string[]
  }
  validation: ValidationResult | null
  totalTime: number
}

// Shader graph types for compilation
export interface ShaderNode {
  id: string
  type: string
  data: {
    type: string
    label?: string
    parameters?: Record<string, any>
  }
  position?: { x: number; y: number }
}

export interface ShaderEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
}

export interface ShaderGraph {
  nodes: ShaderNode[]
  edges: ShaderEdge[]
}

export interface CompileRequest {
  graph: ShaderGraph
  language: 'glsl'
  optimize?: boolean
}
