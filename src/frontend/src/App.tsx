import { useState, useEffect } from 'react'
import { Search, Zap, Sparkles, Network } from 'lucide-react'
import ShaderSearch from './components/ShaderSearch'
import NodeEditor from './components/NodeEditor'
import './App.css'

type View = 'search' | 'editor'

function App() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [currentView, setCurrentView] = useState<View>('editor')

  useEffect(() => {
    const checkApi = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/health`)
        if (response.ok) {
          setApiStatus('online')
        } else {
          setApiStatus('offline')
        }
      } catch (error) {
        setApiStatus('offline')
      }
    }

    checkApi()
    const interval = setInterval(checkApi, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      {/* Header */}
      <header style={{ borderBottomColor: '#3a3a3a' }} className="border-b backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div style={{ backgroundColor: '#1a1a1a', borderColor: '#3a3a3a' }} className="w-10 h-10 border rounded-lg flex items-center justify-center">
                <Sparkles size={24} style={{ color: '#00ff88' }} />
              </div>
              <div>
                <h1 style={{ color: '#e5e5e5' }} className="text-2xl font-bold font-mono">ShaderForge AI</h1>
                <p style={{ color: '#a0a0a0' }} className="text-xs font-mono">Editor de Shaders con IA</p>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentView('search')}
                style={{
                  backgroundColor: currentView === 'search' ? '#00ff88' : '#1a1a1a',
                  color: currentView === 'search' ? '#0a0a0a' : '#a0a0a0',
                  borderColor: currentView === 'search' ? '#00ff88' : '#3a3a3a'
                }}
                className="px-4 py-2 rounded-lg flex items-center gap-2 transition border font-mono font-semibold"
              >
                <Search size={18} />
                Buscar
              </button>
              <button
                onClick={() => setCurrentView('editor')}
                style={{
                  backgroundColor: currentView === 'editor' ? '#00ff88' : '#1a1a1a',
                  color: currentView === 'editor' ? '#0a0a0a' : '#a0a0a0',
                  borderColor: currentView === 'editor' ? '#00ff88' : '#3a3a3a'
                }}
                className="px-4 py-2 rounded-lg flex items-center gap-2 transition border font-mono font-semibold"
              >
                <Network size={18} />
                Editor
              </button>
            </div>
          </div>

          {/* API Status */}
          <div className="flex items-center gap-2">
            <div
              style={{
                backgroundColor:
                  apiStatus === 'online' ? '#00ff88' :
                  apiStatus === 'checking' ? '#ffaa00' : '#ff4444'
              }}
              className="w-3 h-3 rounded-full"
            />
            <span style={{ color: '#a0a0a0' }} className="text-sm font-mono">
              {apiStatus === 'online' ? '🟢 API Online' :
               apiStatus === 'checking' ? '🟡 Verificando...' :
               '🔴 API Offline'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {currentView === 'editor' ? (
        <NodeEditor />
      ) : (
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="mb-12 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Zap style={{ color: '#00ff88' }} size={28} />
              <h2 style={{ color: '#e5e5e5' }} className="text-4xl font-bold font-mono">
                Crea Shaders con IA
              </h2>
              <Zap style={{ color: '#00ff88' }} size={28} />
            </div>
            <p style={{ color: '#a0a0a0' }} className="text-lg font-mono max-w-2xl mx-auto">
              Genera shaders profesionales solo describiendo lo que quieres. Busca en nuestra base de datos masiva de shaders y aprende de los mejores.
            </p>
          </div>

          {/* Search Component */}
          <div className="mb-8">
            <ShaderSearch onNavigateToEditor={() => setCurrentView('editor')} />
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div style={{ backgroundColor: '#1a1a1a', borderColor: '#3a3a3a' }} className="border rounded-lg p-6 transition hover:border-neon-green">
              <div className="flex items-center gap-3 mb-2">
                <Search style={{ color: '#00ff88' }} size={24} />
                <h3 style={{ color: '#e5e5e5' }} className="text-xl font-semibold font-mono">Búsqueda Semántica</h3>
              </div>
              <p style={{ color: '#a0a0a0' }} className="font-mono">Encuentra shaders por descripción, técnica o estilo</p>
            </div>

            <div style={{ backgroundColor: '#1a1a1a', borderColor: '#3a3a3a' }} className="border rounded-lg p-6 transition hover:border-neon-green">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles style={{ color: '#00ff88' }} size={24} />
                <h3 style={{ color: '#e5e5e5' }} className="text-xl font-semibold font-mono">Generación con IA</h3>
              </div>
              <p style={{ color: '#a0a0a0' }} className="font-mono">Genera shaders profesionales con descripciones en lenguaje natural</p>
            </div>

            <div style={{ backgroundColor: '#1a1a1a', borderColor: '#3a3a3a' }} className="border rounded-lg p-6 transition hover:border-neon-green">
              <div className="flex items-center gap-3 mb-2">
                <Zap style={{ color: '#00ff88' }} size={24} />
                <h3 style={{ color: '#e5e5e5' }} className="text-xl font-semibold font-mono">Multi-Plataforma</h3>
              </div>
              <p style={{ color: '#a0a0a0' }} className="font-mono">Exporta a GLSL, HLSL, Metal, WGSL, Unity y Unreal</p>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-12 text-center" style={{ color: '#6a6a6a' }}>
            <p className="text-sm font-mono">ShaderForge AI v0.1.0 • Proyecto en desarrollo</p>
            <p className="mt-1 font-mono text-sm">
              <a href="/docs" style={{ color: '#00ff88' }} className="hover:opacity-80">API Docs</a>
              {' • '}
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" style={{ color: '#00ff88' }} className="hover:opacity-80">GitHub</a>
            </p>
          </div>
        </main>
      )}
    </div>
  )
}

export default App
