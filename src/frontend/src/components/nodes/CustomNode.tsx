import { Handle, Position, useReactFlow } from 'reactflow'
import { Trash2, Copy } from 'lucide-react'
import { useState, useEffect } from 'react'
import ParameterEditor from './ParameterEditor'
import { NODE_DEFINITIONS } from '../../types/nodes'
import './CustomNode.css'

interface CustomNodeProps {
  id: string
  data: {
    label: string
    description?: string
    category: 'input' | 'operation' | 'output'
    type: string
    color?: string
    parameters?: Record<string, any>
  }
  selected?: boolean
  isConnectable?: boolean
}

export default function CustomNode({ id, data, selected, isConnectable }: CustomNodeProps) {
  const { label, description, category, type, color = '#8b5cf6', parameters: initialParameters = {} } = data
  const { getNode, setNodes, setEdges } = useReactFlow()
  const [parameterValues, setParameterValues] = useState<Record<string, any>>(initialParameters)

  // Initialize parameter values with defaults
  useEffect(() => {
    const definition = NODE_DEFINITIONS[type as keyof typeof NODE_DEFINITIONS]
    if (definition && definition.parameters.length > 0) {
      const defaults: Record<string, any> = {}
      definition.parameters.forEach((param) => {
        defaults[param.name] = parameterValues[param.name] ?? param.default
      })
      setParameterValues(defaults)
    }
  }, [type])

  const handleParameterChange = (paramName: string, value: any) => {
    const newValues = { ...parameterValues, [paramName]: value }
    setParameterValues(newValues)

    // Sync with ReactFlow state
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                parameters: newValues,
              },
            }
          : node
      )
    )
  }

  const handleDelete = () => {
    setNodes((nds) => nds.filter((node) => node.id !== id))
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id))
  }

  const handleDuplicate = () => {
    const node = getNode(id)
    if (!node) return

    const newNode = {
      ...node,
      id: `node-${Date.now()}`,
      position: {
        x: node.position.x + 50,
        y: node.position.y + 50,
      },
      data: {
        ...node.data,
        parameters: { ...parameterValues }, // Duplicate parameters too
      },
    }
    setNodes((nds) => [...nds, newNode])
  }

  const definition = NODE_DEFINITIONS[type as keyof typeof NODE_DEFINITIONS]
  const numInputs = definition?.inputs?.length || 0
  const numOutputs = definition?.outputs?.length || 0

  return (
    <div
      className={`custom-node ${category} ${selected ? 'selected' : ''}`}
      style={{ borderColor: color } as React.CSSProperties}
    >
      {/* Input Handles - múltiples si es necesario */}
      {numInputs > 0 && definition?.inputs.map((input, index) => {
        const handleId = index === 0 ? 'input' : `input${index}`
        const verticalOffset = numInputs > 1 ? (index / (numInputs - 1)) * 100 : 50

        return (
          <Handle
            key={handleId}
            type="target"
            position={Position.Left}
            id={handleId}
            isConnectable={isConnectable ?? true}
            style={{
              background: color,
              top: `${verticalOffset}%`,
              transform: 'translateY(-50%)'
            }}
            title={input.name}
          />
        )
      })}

      {/* Node Content */}
      <div className="node-content">
        <div className="node-header" style={{ borderBottomColor: color }}>
          <div className="node-title">{label}</div>
        </div>

        {description && <div className="node-description">{description}</div>}

        {/* Dynamic Parameter Editors */}
        {definition && definition.parameters.length > 0 && (
          <div className="node-params">
            {definition.parameters.map((param) => (
              <ParameterEditor
                key={param.name}
                parameter={param}
                value={parameterValues[param.name]}
                onChange={(value) => handleParameterChange(param.name, value)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Output Handles - múltiples si es necesario */}
      {numOutputs > 0 && definition?.outputs.map((output, index) => {
        const handleId = index === 0 ? 'output' : `output${index}`
        const verticalOffset = numOutputs > 1 ? (index / (numOutputs - 1)) * 100 : 50

        return (
          <Handle
            key={handleId}
            type="source"
            position={Position.Right}
            id={handleId}
            isConnectable={isConnectable ?? true}
            style={{
              background: color,
              top: `${verticalOffset}%`,
              transform: 'translateY(-50%)'
            }}
            title={output.name}
          />
        )
      })}

      {/* Node Actions */}
      <div className="node-actions">
        <button
          className="action-btn copy-btn"
          title="Duplicar"
          onClick={handleDuplicate}
        >
          <Copy size={12} />
        </button>
        <button
          className="action-btn delete-btn"
          title="Eliminar"
          onClick={handleDelete}
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  )
}
