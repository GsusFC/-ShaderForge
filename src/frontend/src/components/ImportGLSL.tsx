import { useState } from 'react'
import { X, Sparkles } from 'lucide-react'
import './ImportGLSL.css'

interface ImportGLSLProps {
  isOpen: boolean
  onClose: () => void
  onImport: (nodes: any[], edges: any[]) => void
}

export default function ImportGLSL({ isOpen, onClose, onImport }: ImportGLSLProps) {
  const [glslCode, setGlslCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])

  if (!isOpen) return null

  const handleImport = async () => {
    if (!glslCode.trim()) {
      setError('Por favor ingresa código GLSL')
      return
    }

    setLoading(true)
    setError(null)
    setAnalysis(null)
    setWarnings([])

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API_URL}/api/v1/glsl-import/parse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          glsl_code: glslCode,
          target_format: 'shadertoy',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Error al importar GLSL')
      }

      const data = await response.json()

      if (data.analysis) {
        setAnalysis(data.analysis)
      }

      if (data.warnings && data.warnings.length > 0) {
        setWarnings(data.warnings)
      }

      // Import the nodes and edges
      onImport(data.nodes, data.edges)

      // Close modal after successful import (wait longer if there are warnings)
      const delay = data.warnings && data.warnings.length > 0 ? 3000 : 1500
      setTimeout(() => {
        onClose()
        setGlslCode('')
        setAnalysis(null)
        setWarnings([])
      }, delay)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
      setGlslCode('')
      setError(null)
      setAnalysis(null)
      setWarnings([])
    }
  }

  return (
    <div className="import-modal-overlay" onClick={handleClose}>
      <div className="import-modal" onClick={(e) => e.stopPropagation()}>
        <div className="import-modal-header">
          <div className="import-modal-title">
            <Sparkles size={20} />
            Importar GLSL con IA
          </div>
          <button
            className="import-modal-close"
            onClick={handleClose}
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        <div className="import-modal-body">
          <p className="import-modal-description">
            Pega tu código GLSL y la IA lo convertirá automáticamente en nodos.
          </p>

          <textarea
            className="import-glsl-textarea"
            placeholder="void mainImage(out vec4 fragColor, in vec2 fragCoord) {&#10;  vec2 uv = fragCoord / iResolution.xy;&#10;  fragColor = vec4(uv, 0.0, 1.0);&#10;}"
            value={glslCode}
            onChange={(e) => setGlslCode(e.target.value)}
            disabled={loading}
            rows={12}
          />

          {error && (
            <div className="import-error">
              <strong>Error:</strong> {error}
            </div>
          )}

          {analysis && (
            <div className="import-analysis">
              <strong>Análisis:</strong> {analysis}
            </div>
          )}

          {warnings.length > 0 && (
            <div className="import-warnings">
              <strong>Advertencias:</strong>
              <ul>
                {warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="import-modal-footer">
          <button
            className="import-btn-cancel"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            className="import-btn-submit"
            onClick={handleImport}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="import-spinner"></span>
                Analizando con IA...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Importar con IA
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
