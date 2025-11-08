import { useCallback, useState, useEffect, useRef } from 'react'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  Panel,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { ChevronDown, Trash2, Code2, Eye, EyeOff, Layers, FileCode } from 'lucide-react'
import CustomNode from './nodes/CustomNode'
import NodePalette from './NodePalette'
import ShaderPreview from './ShaderPreview'
import ImportGLSL from './ImportGLSL'
import ShaderGallery from './ShaderGallery'
import { NODE_DEFINITIONS } from '../types/nodes'
import { useShaderStore } from '../stores/shaderStore'
import '../styles/NodeEditor.css'

const nodeTypes = {
  shaderNode: CustomNode,
}

export default function NodeEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([])
  const [showPalette, setShowPalette] = useState(false)
  const [compiledCode, setCompiledCode] = useState<string>('')
  const [compiledUniforms, setCompiledUniforms] = useState<any[]>([])
  const [showPreview, setShowPreview] = useState(true)
  const [isCompiling, setIsCompiling] = useState(false)
  const [autoCompile, setAutoCompile] = useState(true)
  const isCompilingRef = useRef(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [validationWarnings, setValidationWarnings] = useState<string[]>([])
  const [showValidation, setShowValidation] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showGallery, setShowGallery] = useState(false)

  const { currentShaderCode, currentShaderName, currentShaderUniforms, isFromSearch, clearShader } = useShaderStore()

  // Load shader from search into preview
  useEffect(() => {
    if (isFromSearch && currentShaderCode) {
      setCompiledCode(currentShaderCode)
      setCompiledUniforms(currentShaderUniforms || [])
      setShowPreview(true)
    }
  }, [isFromSearch, currentShaderCode, currentShaderUniforms])

  // Auto-compile with debounce when nodes/edges change
  useEffect(() => {
    if (!autoCompile || nodes.length === 0) return

    const timeoutId = setTimeout(async () => {
      // Use ref to prevent concurrent compilations
      if (isCompilingRef.current) return

      isCompilingRef.current = true
      setIsCompiling(true)

      try {
        const nodesWithParams = nodes.map((node: any) => ({
          ...node,
          parameters: node.data?.parameters || {},
        }))

        // Usar el nuevo endpoint que compila Y valida
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/nodes/graph/compile-and-validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            graph: { nodes: nodesWithParams, edges },
            language: 'glsl',
            optimize: true,
          }),
        })

        if (response.ok) {
          const data = await response.json()

          if (data.compilation) {
            setCompiledCode(data.compilation.code)
            setCompiledUniforms(data.compilation.uniforms || [])
          }

          // Guardar resultados de validación
          if (data.validation) {
            setValidationErrors(data.validation.errors || [])
            setValidationWarnings(data.validation.warnings || [])
            setShowValidation(data.validation.errors.length > 0 || data.validation.warnings.length > 0)
          }
        }
      } catch (error) {
        console.error('Auto-compile error:', error)
      } finally {
        isCompilingRef.current = false
        setIsCompiling(false)
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [nodes, edges, autoCompile])

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds))
    },
    [setEdges]
  )

  const handleAddNode = useCallback(
    (nodeType: string) => {
      const nodeId = `node-${Date.now()}`
      const definition = NODE_DEFINITIONS[nodeType as keyof typeof NODE_DEFINITIONS]

      if (!definition) return

      // Initialize parameters with defaults
      const parametersDefault: Record<string, any> = {}
      definition.parameters.forEach((param) => {
        parametersDefault[param.name] = param.default
      })

      const newNode: Node = {
        id: nodeId,
        type: 'shaderNode',
        position: { x: Math.random() * 500, y: Math.random() * 500 },
        data: {
          label: definition.label,
          description: definition.description,
          category: definition.category,
          type: nodeType,
          color: definition.color,
          parameters: parametersDefault,
        },
      }

      setNodes((nds) => [...nds, newNode])
      setShowPalette(false)
    },
    [setNodes]
  )

  const handleClearGraph = useCallback(() => {
    if (confirm('¿Eliminar todos los nodos? Esta acción no se puede deshacer.')) {
      setNodes([])
      setEdges([])
      setCompiledCode('')
      setCompiledUniforms([])
    }
  }, [setNodes, setEdges])

  const handleImportGLSL = useCallback((importedNodes: any[], importedEdges: any[]) => {
    // Replace current graph with imported nodes
    setNodes(importedNodes)
    setEdges(importedEdges)
  }, [setNodes, setEdges])

  const handleCompile = useCallback(async () => {
    if (isCompilingRef.current || nodes.length === 0) return

    isCompilingRef.current = true
    setIsCompiling(true)

    try {
      // Prepare nodes with their parameters for compilation
      const nodesWithParams = nodes.map((node: any) => ({
        ...node,
        parameters: node.data?.parameters || {},
      }))

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/nodes/graph/compile-and-validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          graph: { nodes: nodesWithParams, edges },
          language: 'glsl',
          optimize: true,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.compilation) {
          setCompiledCode(data.compilation.code)
          setCompiledUniforms(data.compilation.uniforms || [])
        }
        if (data.validation) {
          setValidationErrors(data.validation.errors || [])
          setValidationWarnings(data.validation.warnings || [])
          setShowValidation(data.validation.errors.length > 0 || data.validation.warnings.length > 0)
        }
      } else {
        console.error('Error compilando shader')
      }
    } catch (error) {
      console.error('Compile error:', error)
    } finally {
      isCompilingRef.current = false
      setIsCompiling(false)
    }
  }, [nodes, edges])

  return (
    <div className="w-full h-screen flex" style={{ backgroundColor: '#0a0a0a' }}>
      {/* Node Palette */}
      <div className={`transition-all duration-300 ${showPalette ? 'w-64' : 'w-0'} overflow-hidden`}>
        <NodePalette onAddNode={handleAddNode} onClose={() => setShowPalette(false)} />
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="node-editor-toolbar">
          <div className="toolbar-left">
            <button
              onClick={() => setShowPalette(!showPalette)}
              className="btn btn-primary"
            >
              <ChevronDown size={18} />
              Nodos
            </button>
            <button
              onClick={() => setShowGallery(true)}
              className="btn btn-primary"
              title="Abrir galería de shaders"
            >
              <Layers size={18} />
              Galería
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="btn btn-primary"
              title="Importar GLSL con IA"
            >
              <FileCode size={18} />
              Importar
            </button>
            <div className="stats-badge">
              Nodos: <span>{nodes.length}</span>
              {' | '}
              Conexiones: <span>{edges.length}</span>
            </div>
          </div>

          <div className="toolbar-right">
            {currentShaderName && isFromSearch && (
              <div style={{ backgroundColor: 'rgba(0, 255, 136, 0.1)', borderColor: '#00ff88', color: '#00ff88' }} className="px-3 py-1.5 border rounded flex items-center gap-2 text-sm font-mono">
                <Eye size={16} />
                <span>Shader: {currentShaderName}</span>
                <button
                  onClick={() => {
                    clearShader()
                    setCompiledCode('')
                    setCompiledUniforms([])
                  }}
                  className="ml-2 hover:opacity-80"
                  title="Cerrar shader"
                >
                  ×
                </button>
              </div>
            )}
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`btn ${showPreview ? 'btn-success' : 'btn-primary'}`}
              title="Toggle Preview"
            >
              {showPreview ? <Eye size={18} /> : <EyeOff size={18} />}
              Preview
            </button>
            <button
              onClick={() => setAutoCompile(!autoCompile)}
              className={`btn ${autoCompile ? 'btn-success' : 'btn-primary'}`}
              title={autoCompile ? 'Auto-compilación activa' : 'Auto-compilación desactivada'}
            >
              {autoCompile ? '⚡' : '⏸️'} Auto
            </button>
            <button
              onClick={handleCompile}
              className="btn btn-success"
              title="Compilar a GLSL manualmente"
              disabled={isCompiling}
              style={{ opacity: isCompiling ? 0.6 : 1 }}
            >
              <Code2 size={18} />
              {isCompiling ? 'Compilando...' : 'Compilar'}
            </button>
            <button
              onClick={handleClearGraph}
              className="btn btn-danger"
              title="Eliminar todos los nodos"
            >
              <Trash2 size={18} />
              Limpiar
            </button>
          </div>
        </div>

        {/* Main Layout: Top (Canvas + Preview) | Bottom (Code) */}
        <div className="node-editor-main" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>

          {/* Top Section: Canvas + Preview */}
          <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

            {/* Editor Canvas */}
            <div className="canvas-area" style={{ width: showPreview ? '50%' : '100%', position: 'relative' }}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
              >
                <Background color="#2a2a2a" gap={16} />
                <Controls />

                <Panel position="top-left" className="info-panel">
                  <div className="info-panel-title">ShaderForge Node Editor</div>
                  <p className="info-panel-hint">
                    Arrastra desde el panel izquierdo o haz click en "Nodos"
                  </p>
                </Panel>
              </ReactFlow>
            </div>

            {/* Shader Preview Panel */}
            {showPreview && (
              <div className="preview-panel" style={{ width: '50%', borderLeft: '1px solid #333' }}>
                <ShaderPreview shaderCode={compiledCode} uniforms={compiledUniforms} />
              </div>
            )}
          </div>

          {/* Bottom Section: Code Panel (2 columnas: Código + Validación) */}
          <div style={{
            height: '250px',
            borderTop: '2px solid #444',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#1a1a1a',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div className="code-panel-header" style={{
              padding: '8px 16px',
              borderBottom: '1px solid #333',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#1e1e1e'
            }}>
              <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>📋 Código GLSL</h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {/* Validation indicator */}
                {showValidation && (
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    fontSize: '11px',
                    marginRight: '12px'
                  }}>
                    {validationErrors.length > 0 && (
                      <span style={{ color: '#ff4444' }}>
                        ❌ {validationErrors.length} error{validationErrors.length > 1 ? 's' : ''}
                      </span>
                    )}
                    {validationWarnings.length > 0 && (
                      <span style={{ color: '#ffa500' }}>
                        ⚠️ {validationWarnings.length} warning{validationWarnings.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                )}
                {!showValidation && compiledCode && (
                  <span style={{ color: '#00ff88', fontSize: '11px' }}>
                    ✓ Válido
                  </span>
                )}
                {compiledCode && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(compiledCode)
                      alert('✓ Copiado')
                    }}
                    className="btn btn-primary"
                    style={{ padding: '4px 8px', fontSize: '11px' }}
                  >
                    Copiar
                  </button>
                )}
              </div>
            </div>

            {/* Content: 2 columnas (Código + Validación) */}
            <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

              {/* Left: Code Block */}
              <div className="code-block" style={{
                flex: showValidation ? '0 0 70%' : '1',
                overflowY: 'auto',
                padding: '12px',
                backgroundColor: '#0d0d0d',
                borderRight: showValidation ? '1px solid #333' : 'none'
              }}>
                {compiledCode ? (
                  <pre style={{ fontSize: '11px', margin: 0, whiteSpace: 'pre', overflowX: 'auto' }}>{compiledCode}</pre>
                ) : (
                  <p style={{ color: '#666', padding: '20px', textAlign: 'center' }}>
                    Compila un shader para ver el código aquí
                  </p>
                )}
              </div>

              {/* Right: Validation Panel */}
              {showValidation && (
                <div style={{
                  flex: '0 0 30%',
                  padding: '12px',
                  backgroundColor: '#1a1a1a',
                  overflowY: 'auto'
                }}>
                  {validationErrors.length > 0 && (
                    <div style={{ marginBottom: validationWarnings.length > 0 ? '16px' : '0' }}>
                      <div style={{
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: '#ff4444',
                        marginBottom: '8px'
                      }}>
                        Errores:
                      </div>
                      {validationErrors.map((error, idx) => (
                        <div key={idx} style={{
                          fontSize: '10px',
                          color: '#ff8888',
                          padding: '6px 8px',
                          backgroundColor: 'rgba(255, 68, 68, 0.1)',
                          border: '1px solid rgba(255, 68, 68, 0.3)',
                          borderRadius: '3px',
                          marginBottom: '6px',
                          fontFamily: 'monospace',
                          lineHeight: '1.4'
                        }}>
                          • {error}
                        </div>
                      ))}
                    </div>
                  )}

                  {validationWarnings.length > 0 && (
                    <div>
                      <div style={{
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: '#ffa500',
                        marginBottom: '8px'
                      }}>
                        Advertencias:
                      </div>
                      {validationWarnings.map((warning, idx) => (
                        <div key={idx} style={{
                          fontSize: '10px',
                          color: '#ffcc88',
                          padding: '6px 8px',
                          backgroundColor: 'rgba(255, 165, 0, 0.1)',
                          border: '1px solid rgba(255, 165, 0, 0.3)',
                          borderRadius: '3px',
                          marginBottom: '6px',
                          fontFamily: 'monospace',
                          lineHeight: '1.4'
                        }}>
                          • {warning}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Import GLSL Modal */}
      <ImportGLSL
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportGLSL}
      />

      {/* Shader Gallery Modal */}
      <ShaderGallery
        isOpen={showGallery}
        onClose={() => setShowGallery(false)}
        onLoadExample={(nodes, edges) => {
          setNodes(nodes)
          setEdges(edges)
        }}
      />
    </div>
  )
}
