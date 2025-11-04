import React from 'react'
import '../styles/ShaderPreview.css'

interface ShaderPreviewProps {
  shaderCode?: string
}

export default function ShaderPreview({ shaderCode }: ShaderPreviewProps) {
  return (
    <div className="shader-preview-container">
      <div className="shader-preview-header">
        <h2>Preview Shader</h2>
      </div>
      <div className="shader-preview-canvas-container">
        <div className="shader-preview-placeholder">
          <div className="placeholder-content">
            <p>Three.js Preview - En desarrollo</p>
            <p className="hint">Compilador activo</p>
          </div>
        </div>
      </div>
    </div>
  )
}
