import { create } from 'zustand'

export type EditorMode = 'nodes' | 'code'

interface ShaderState {
  currentShaderCode: string | null
  currentShaderName: string | null
  currentShaderId: string | null
  currentShaderUniforms: any[]
  isFromSearch: boolean
  editorMode: EditorMode
  userGLSLCode: string
  setShader: (code: string, name: string, id: string, uniforms?: any[]) => void
  clearShader: () => void
  setEditorMode: (mode: EditorMode) => void
  setUserGLSLCode: (code: string) => void
}

export const useShaderStore = create<ShaderState>((set) => ({
  currentShaderCode: null,
  currentShaderName: null,
  currentShaderId: null,
  currentShaderUniforms: [],
  isFromSearch: false,
  editorMode: 'nodes',
  userGLSLCode: `// ShaderForge AI - Code Editor
// Escribe tu código GLSL aquí o pega un shader existente

precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;

  // Ejemplo simple: gradiente animado
  vec3 color = vec3(
    0.5 + 0.5 * sin(u_time + uv.x * 3.0),
    0.5 + 0.5 * sin(u_time + uv.y * 2.0),
    0.5 + 0.5 * cos(u_time)
  );

  gl_FragColor = vec4(color, 1.0);
}
`,
  setShader: (code, name, id, uniforms = []) => set({
    currentShaderCode: code,
    currentShaderName: name,
    currentShaderId: id,
    currentShaderUniforms: uniforms,
    isFromSearch: true,
    // Auto-switch to code mode for search results
    editorMode: 'code',
    userGLSLCode: code
  }),
  clearShader: () => set({
    currentShaderCode: null,
    currentShaderName: null,
    currentShaderId: null,
    currentShaderUniforms: [],
    isFromSearch: false
  }),
  setEditorMode: (mode) => set({ editorMode: mode }),
  setUserGLSLCode: (code) => set({ userGLSLCode: code }),
}))
