import { create } from 'zustand'

interface ShaderState {
  currentShaderCode: string | null
  currentShaderName: string | null
  currentShaderId: string | null
  currentShaderUniforms: any[]
  isFromSearch: boolean
  setShader: (code: string, name: string, id: string, uniforms?: any[]) => void
  clearShader: () => void
}

export const useShaderStore = create<ShaderState>((set) => ({
  currentShaderCode: null,
  currentShaderName: null,
  currentShaderId: null,
  currentShaderUniforms: [],
  isFromSearch: false,
  setShader: (code, name, id, uniforms = []) => set({
    currentShaderCode: code,
    currentShaderName: name,
    currentShaderId: id,
    currentShaderUniforms: uniforms,
    isFromSearch: true
  }),
  clearShader: () => set({
    currentShaderCode: null,
    currentShaderName: null,
    currentShaderId: null,
    currentShaderUniforms: [],
    isFromSearch: false
  }),
}))
