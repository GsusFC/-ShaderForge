import { Search, X } from 'lucide-react'
import { useState } from 'react'
import { NODE_DEFINITIONS, NODE_TYPES } from '../types/nodes'
import '../styles/NodePalette.css'

interface NodePaletteProps {
  onAddNode: (nodeType: string) => void
  onClose: () => void
}

const CATEGORIES = {
  inputs: {
    label: 'Inputs',
    color: 'border-blue-500',
    nodes: [NODE_TYPES.UV_INPUT, NODE_TYPES.TIME_INPUT, NODE_TYPES.MOUSE_INPUT, NODE_TYPES.FLOAT_CONSTANT],
  },
  math: {
    label: 'Math',
    color: 'border-purple-500',
    nodes: [
      NODE_TYPES.ADD,
      NODE_TYPES.MULTIPLY,
      NODE_TYPES.DIVIDE,
      NODE_TYPES.POWER,
      NODE_TYPES.LERP,
      NODE_TYPES.CLAMP,
    ],
  },
  noise: {
    label: 'Noise',
    color: 'border-pink-500',
    nodes: [NODE_TYPES.PERLIN_NOISE, NODE_TYPES.SIMPLEX_NOISE, NODE_TYPES.FBM],
  },
  color: {
    label: 'Color',
    color: 'border-amber-500',
    nodes: [NODE_TYPES.RGB_TO_HSV, NODE_TYPES.HSV_TO_RGB, NODE_TYPES.COLOR_PICKER, NODE_TYPES.MIX_COLORS],
  },
  vector: {
    label: 'Vector',
    color: 'border-cyan-500',
    nodes: [NODE_TYPES.VEC3_CONSTRUCT, NODE_TYPES.LENGTH, NODE_TYPES.NORMALIZE],
  },
  sdf: {
    label: 'SDF',
    color: 'border-emerald-500',
    nodes: [NODE_TYPES.SDF_SPHERE, NODE_TYPES.SDF_BOX, NODE_TYPES.SDF_TORUS],
  },
  outputs: {
    label: 'Outputs',
    color: 'border-green-500',
    nodes: [NODE_TYPES.FRAGMENT_OUTPUT],
  },
}

export default function NodePalette({ onAddNode, onClose }: NodePaletteProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCategory, setExpandedCategory] = useState<string | null>('inputs')

  const filteredCategories = Object.entries(CATEGORIES).map(([key, category]) => {
    const filtered = category.nodes.filter((nodeType) => {
      const def = NODE_DEFINITIONS[nodeType as keyof typeof NODE_DEFINITIONS]
      return (
        !searchTerm ||
        def.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        def.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })
    return { key, ...category, nodes: filtered }
  })

  return (
    <div className="node-palette">
      {/* Header */}
      <div className="palette-header">
        <h3>Librería de Nodos</h3>
        <button onClick={onClose} className="close-btn">
          <X size={18} />
        </button>
      </div>

      {/* Search */}
      <div className="palette-search">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          placeholder="Buscar nodos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Categories */}
      <div className="palette-content">
        {filteredCategories.map(({ key, label, color, nodes }) => (
          <div key={key} className="category">
            <button
              className={`category-header ${expandedCategory === key ? 'expanded' : ''}`}
              onClick={() => setExpandedCategory(expandedCategory === key ? null : key)}
            >
              <span className={`category-indicator ${color}`} />
              <span className="category-label">{label}</span>
              <span className="category-count">{nodes.length}</span>
            </button>

            {expandedCategory === key && nodes.length > 0 && (
              <div className="category-nodes">
                {nodes.map((nodeType) => {
                  const def = NODE_DEFINITIONS[nodeType as keyof typeof NODE_DEFINITIONS]
                  return (
                    <button
                      key={nodeType}
                      className="node-item"
                      onClick={() => onAddNode(nodeType)}
                      title={def.description}
                    >
                      <span
                        className="node-item-color"
                        style={{ backgroundColor: def.color }}
                      />
                      <div className="node-item-info">
                        <span className="node-item-name">{def.label}</span>
                        <span className="node-item-desc">{def.description}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="palette-footer">
        <p className="text-xs text-slate-400">
          Click para añadir un nodo al canvas
        </p>
      </div>
    </div>
  )
}
