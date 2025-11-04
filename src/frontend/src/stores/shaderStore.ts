import { create } from 'zustand'

interface ShaderState {
  currentShaderCode: string | null
  currentShaderName: string | null
  currentShaderId: string | null
  isFromSearch: boolean
  setShader: (code: string, name: string, id: string) => void
  clearShader: () => void
}

export const useShaderStore = create<ShaderState>((set) => ({
  currentShaderCode: null,
  currentShaderName: null,
  currentShaderId: null,
  isFromSearch: false,
  setShader: (code, name, id) => set({
    currentShaderCode: code,
    currentShaderName: name,
    currentShaderId: id,
    isFromSearch: true
  }),
  clearShader: () => set({
    currentShaderCode: null,
    currentShaderName: null,
    currentShaderId: null,
    isFromSearch: false
  }),
}))
