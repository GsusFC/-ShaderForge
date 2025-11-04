import { useCallback, useState, useEffect } from 'react'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  Panel,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { ChevronDown, Trash2, Code2, Eye, EyeOff } from 'lucide-react'
import CustomNode from './nodes/CustomNode'
import NodePalette from './NodePalette'
import ShaderPreview from './ShaderPreview'
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
  const [showPreview, setShowPreview] = useState(true)

  const { currentShaderCode, currentShaderName, isFromSearch, clearShader } = useShaderStore()

  // Load shader from search into preview
  useEffect(() => {
    if (isFromSearch && currentShaderCode) {
      setCompiledCode(currentShaderCode)
      setShowPreview(true)
    }
  }, [isFromSearch, currentShaderCode])

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
    }
  }, [setNodes, setEdges])

  const handleCompile = useCallback(async () => {
    try {
      // Prepare nodes with their parameters for compilation
      const nodesWithParams = nodes.map((node: any) => ({
        ...node,
        parameters: node.data?.parameters || {},
      }))

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/nodes/graph/compile`, {
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
        setCompiledCode(data.code)
      } else {
        alert('Error compilando shader')
      }
    } catch (error) {
      console.error('Compile error:', error)
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown'))
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
              onClick={handleCompile}
              className="btn btn-success"
              title="Compilar a GLSL"
            >
              <Code2 size={18} />
              Compilar
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

        {/* Editor and Preview Container */}
        <div className="node-editor-main">
          {/* Editor Canvas */}
          <div className={`canvas-area ${showPreview ? '' : 'full-width'} transition-all duration-300`} style={{ width: showPreview ? '50%' : '100%' }}>
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
              <MiniMap />

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
            <div className="preview-panel">
              <ShaderPreview shaderCode={compiledCode} />
            </div>
          )}
        </div>

        {/* Compiled Code Panel */}
        {compiledCode && !showPreview && (
          <div className="code-panel">
            <div className="code-panel-header">
              <h3>Código GLSL Generado</h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(compiledCode)
                  alert('Código copiado al portapapeles')
                }}
                className="btn btn-primary"
                style={{ padding: '4px 8px', fontSize: '11px' }}
              >
                Copiar
              </button>
            </div>
            <div className="code-block">
              {compiledCode}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
