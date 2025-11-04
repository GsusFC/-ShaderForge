import { useState, useEffect } from 'react'
import { Search, Loader, AlertCircle, Zap, X, Code2, Copy, Check, Edit } from 'lucide-react'
import { useShaderStore } from '../stores/shaderStore'

interface Shader {
  id: string
  name: string
  description: string
  views: number
  likes: number
  author: string
  tags: string[]
  code?: string
}

interface ShaderSearchProps {
  onNavigateToEditor?: () => void
}

export default function ShaderSearch({ onNavigateToEditor }: ShaderSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Shader[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedShader, setSelectedShader] = useState<Shader | null>(null)
  const [loadingShader, setLoadingShader] = useState(false)
  const [copied, setCopied] = useState(false)

  const { setShader } = useShaderStore()

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    if (!query.trim()) {
      setResults([])
      setHasSearched(true)
      return
    }

    setLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const response = await fetch(
        `${apiUrl}/api/v1/search/shaders?q=${encodeURIComponent(query)}&limit=12`
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setResults(data.results || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error buscando shaders')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        handleSearch()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [query])

  const handleShaderClick = async (shader: Shader) => {
    setSelectedShader(shader)
    setLoadingShader(true)

    try {
      // Fetch full shader details if code is not included
      if (!shader.code) {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
        const response = await fetch(`${apiUrl}/api/v1/search/shaders/${shader.id}`)
        if (response.ok) {
          const data = await response.json()
          setSelectedShader(data.shader)
        }
      }
    } catch (err) {
      console.error('Error loading shader:', err)
    } finally {
      setLoadingShader(false)
    }
  }

  const handleCopyCode = () => {
    if (selectedShader?.code) {
      navigator.clipboard.writeText(selectedShader.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleOpenInEditor = () => {
    if (selectedShader?.code) {
      setShader(selectedShader.code, selectedShader.name, selectedShader.id)
      setSelectedShader(null)
      onNavigateToEditor?.()
    }
  }

  return (
    <div className="w-full">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Busca shaders... (ej: 'water', 'raymarching', 'noise')"
            className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
      </form>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="animate-spin text-blue-400 mr-2" size={24} />
          <span className="text-slate-300">Buscando shaders...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-red-300 font-medium">Error en la búsqueda</p>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {hasSearched && !loading && results.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Zap size={18} className="text-blue-400" />
            <p className="text-slate-300">
              Se encontraron <span className="font-semibold text-blue-400">{results.length}</span> shaders
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((shader) => (
              <div
                key={shader.id}
                onClick={() => handleShaderClick(shader)}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-blue-500/50 hover:bg-slate-800 transition group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition truncate flex-1">
                    {shader.name}
                  </h3>
                </div>

                <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                  {shader.description || 'Sin descripción disponible'}
                </p>

                {/* Tags */}
                {shader.tags && shader.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {shader.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-slate-700/50 text-slate-300 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {shader.tags.length > 3 && (
                      <span className="text-xs px-2 py-1 bg-slate-700/50 text-slate-400 rounded">
                        +{shader.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-700 pt-3">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <span>👁</span>
                      {shader.views.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <span>❤️</span>
                      {shader.likes}
                    </span>
                  </div>
                  <span className="text-slate-500">por {shader.author}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {hasSearched && !loading && results.length === 0 && query && (
        <div className="text-center py-12">
          <Search className="mx-auto text-slate-500 mb-4" size={48} />
          <p className="text-slate-400">No se encontraron shaders para "{query}"</p>
          <p className="text-slate-500 text-sm mt-2">Intenta con otros términos como: water, noise, raymarching</p>
        </div>
      )}

      {/* Empty State */}
      {hasSearched && !loading && results.length === 0 && !query && (
        <div className="text-center py-12">
          <Search className="mx-auto text-slate-500 mb-4" size={48} />
          <p className="text-slate-400">Comienza a buscar shaders</p>
          <p className="text-slate-500 text-sm mt-2">Prueba buscar por técnica, efecto o nombre del autor</p>
        </div>
      )}

      {/* Shader Viewer Modal */}
      {selectedShader && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedShader(null)}>
          <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedShader.name}</h2>
                <p className="text-sm text-slate-400">por {selectedShader.author}</p>
              </div>
              <button
                onClick={() => setSelectedShader(null)}
                className="p-2 hover:bg-slate-700 rounded-lg transition"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {loadingShader ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="animate-spin text-blue-400 mr-2" size={24} />
                  <span className="text-slate-300">Cargando shader...</span>
                </div>
              ) : (
                <>
                  {/* Description */}
                  <div className="mb-4">
                    <p className="text-slate-300">{selectedShader.description}</p>
                  </div>

                  {/* Tags */}
                  {selectedShader.tags && selectedShader.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedShader.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-3 py-1 bg-slate-700 text-slate-300 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-6 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <span>👁</span>
                      {selectedShader.views.toLocaleString()} vistas
                    </span>
                    <span className="flex items-center gap-1">
                      <span>❤️</span>
                      {selectedShader.likes} likes
                    </span>
                  </div>

                  {/* Code Section */}
                  {selectedShader.code ? (
                    <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-700">
                        <div className="flex items-center gap-2">
                          <Code2 size={16} className="text-blue-400" />
                          <span className="text-sm font-medium text-slate-300">Código GLSL</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleOpenInEditor}
                            className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm text-white transition"
                          >
                            <Edit size={14} />
                            Abrir en Editor
                          </button>
                          <button
                            onClick={handleCopyCode}
                            className="flex items-center gap-2 px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm text-white transition"
                          >
                            {copied ? (
                              <>
                                <Check size={14} />
                                Copiado
                              </>
                            ) : (
                              <>
                                <Copy size={14} />
                                Copiar
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      <pre className="p-4 text-sm text-slate-300 overflow-x-auto font-mono">
                        <code>{selectedShader.code}</code>
                      </pre>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <Code2 size={48} className="mx-auto mb-2 opacity-50" />
                      <p>No hay código disponible para este shader</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
