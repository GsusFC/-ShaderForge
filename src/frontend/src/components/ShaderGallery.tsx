/**
 * ShaderGallery Component
 *
 * Modal que muestra la galería de shaders educativos organizados por dificultad:
 * - Beginner: 3 shaders simples (5-8 nodos)
 * - Intermediate: 3 shaders medios (10-15 nodos)
 * - Advanced: 2 shaders complejos (18-20 nodos)
 */

import { useState } from 'react'
import { X, Zap, TrendingUp, Award, Code2, Layers } from 'lucide-react'
import {
  ALL_EXAMPLES,
  EXAMPLES_BY_DIFFICULTY,
  ShaderExample,
  DifficultyLevel,
} from '../data/shaderExamples'
import '../styles/ShaderGallery.css'

interface ShaderGalleryProps {
  isOpen: boolean
  onClose: () => void
  onLoadExample: (nodes: any[], edges: any[], glslCode?: string) => void
}

const DIFFICULTY_CONFIG = {
  beginner: {
    label: 'Beginner',
    icon: Zap,
    color: '#10b981',
    description: 'Simple shaders to learn basics',
  },
  intermediate: {
    label: 'Intermediate',
    icon: TrendingUp,
    color: '#f59e0b',
    description: 'More complex techniques',
  },
  advanced: {
    label: 'Advanced',
    icon: Award,
    color: '#ef4444',
    description: 'Complex shaders with multiple techniques',
  },
  'code-golf': {
    label: 'Code Golf',
    icon: Code2,
    color: '#a855f7',
    description: 'Ultra-compact shaders (code mode only)',
  },
}

export default function ShaderGallery({ isOpen, onClose, onLoadExample }: ShaderGalleryProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('beginner')
  const [hoveredExample, setHoveredExample] = useState<string | null>(null)

  if (!isOpen) return null

  const currentExamples = EXAMPLES_BY_DIFFICULTY[selectedDifficulty]

  const handleLoadExample = (example: ShaderExample) => {
    onLoadExample(example.nodes, example.edges, example.glslCode)
    onClose()
  }

  return (
    <div className="shader-gallery-overlay" onClick={onClose}>
      <div className="shader-gallery-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="gallery-header">
          <div className="gallery-title">
            <Layers size={24} />
            <h2>Shader Gallery</h2>
          </div>
          <button onClick={onClose} className="close-btn" title="Close">
            <X size={20} />
          </button>
        </div>

        {/* Difficulty Selector */}
        <div className="difficulty-selector">
          {(Object.keys(DIFFICULTY_CONFIG) as DifficultyLevel[]).map((difficulty) => {
            const config = DIFFICULTY_CONFIG[difficulty]
            const Icon = config.icon
            const count = EXAMPLES_BY_DIFFICULTY[difficulty].length
            const isActive = selectedDifficulty === difficulty

            return (
              <button
                key={difficulty}
                className={`difficulty-btn ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedDifficulty(difficulty)}
                style={{
                  '--difficulty-color': config.color,
                } as React.CSSProperties}
              >
                <Icon size={18} />
                <div className="difficulty-info">
                  <span className="difficulty-label">{config.label}</span>
                  <span className="difficulty-count">{count} shaders</span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Description */}
        <div className="difficulty-description">
          <p>{DIFFICULTY_CONFIG[selectedDifficulty].description}</p>
        </div>

        {/* Examples Grid */}
        <div className="examples-grid">
          {currentExamples.map((example) => (
            <div
              key={example.id}
              className={`example-card ${hoveredExample === example.id ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredExample(example.id)}
              onMouseLeave={() => setHoveredExample(null)}
              onClick={() => handleLoadExample(example)}
            >
              {/* Card Header */}
              <div className="example-header">
                <h3>{example.name}</h3>
                <div className="node-count">
                  <Code2 size={14} />
                  <span>{example.nodeCount} nodes</span>
                </div>
              </div>

              {/* Description */}
              <p className="example-description">{example.description}</p>

              {/* Techniques */}
              <div className="techniques">
                {example.techniques.map((technique, idx) => (
                  <span key={idx} className="technique-tag">
                    {technique}
                  </span>
                ))}
              </div>

              {/* Load Button */}
              <button className="load-btn">
                Load Example
              </button>
            </div>
          ))}
        </div>

        {/* Footer Stats */}
        <div className="gallery-footer">
          <p>
            Total examples: <strong>{ALL_EXAMPLES.length}</strong> •
            Learning techniques: <strong>20+</strong>
          </p>
        </div>
      </div>
    </div>
  )
}
