import { Search, X } from 'lucide-react'
import { useState, useMemo } from 'react'
import { NODE_DEFINITIONS } from '../types/nodes'
import type { NodeDefinition } from '../types/nodeDefinitions'
import '../styles/NodePalette.css'

interface NodePaletteProps {
  onAddNode: (nodeType: string) => void
  onClose: () => void
}

// Configuración de colores por categoría
const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  input: { label: 'Inputs', color: 'border-blue-500' },
  operation: { label: 'Math', color: 'border-purple-500' },
  vector: { label: 'Vector', color: 'border-cyan-500' },
  color: { label: 'Color', color: 'border-amber-500' },
  utility: { label: 'Utility', color: 'border-pink-500' },
  texture: { label: 'Texture', color: 'border-indigo-500' },
  output: { label: 'Outputs', color: 'border-green-500' },
}

export default function NodePalette({ onAddNode, onClose }: NodePaletteProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCategory, setExpandedCategory] = useState<string | null>('input')

  // Organizar nodos por categoría dinámicamente
  const categorizedNodes = useMemo(() => {
    const categories: Record<string, { config: typeof CATEGORY_CONFIG[string]; nodes: Array<{ id: string; def: NodeDefinition }> }> = {}

    // Agrupar todos los nodos por categoría
    Object.entries(NODE_DEFINITIONS).forEach(([id, def]) => {
      const category = def.category || 'utility'

      if (!categories[category]) {
        categories[category] = {
          config: CATEGORY_CONFIG[category] || { label: category, color: 'border-gray-500' },
          nodes: []
        }
      }

      // Filtrar por búsqueda
      if (!searchTerm ||
          def.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          def.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
        categories[category].nodes.push({ id, def })
      }
    })

    // Ordenar nodos dentro de cada categoría por label
    Object.values(categories).forEach(cat => {
      cat.nodes.sort((a, b) => a.def.label.localeCompare(b.def.label))
    })

    // Ordenar categorías por orden específico
    const categoryOrder = ['input', 'operation', 'vector', 'color', 'utility', 'texture', 'output']
    const sortedCategories = Object.entries(categories).sort(([a], [b]) => {
      const indexA = categoryOrder.indexOf(a)
      const indexB = categoryOrder.indexOf(b)
      if (indexA === -1 && indexB === -1) return a.localeCompare(b)
      if (indexA === -1) return 1
      if (indexB === -1) return -1
      return indexA - indexB
    })

    return sortedCategories
  }, [searchTerm])

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
        {categorizedNodes.map(([categoryKey, { config, nodes }]) => (
          <div key={categoryKey} className="category">
            <button
              className={`category-header ${expandedCategory === categoryKey ? 'expanded' : ''}`}
              onClick={() => setExpandedCategory(expandedCategory === categoryKey ? null : categoryKey)}
            >
              <span className={`category-indicator ${config.color}`} />
              <span className="category-label">{config.label}</span>
              <span className="category-count">{nodes.length}</span>
            </button>

            {expandedCategory === categoryKey && nodes.length > 0 && (
              <div className="category-nodes">
                {nodes.map(({ id, def }) => (
                  <button
                    key={id}
                    className="node-item"
                    onClick={() => onAddNode(id)}
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
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="palette-footer">
        <p className="text-xs text-slate-400">
          {Object.values(NODE_DEFINITIONS).length} nodos disponibles • Click para añadir
        </p>
      </div>
    </div>
  )
}
