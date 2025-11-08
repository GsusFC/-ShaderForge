/**
 * Galería de Shaders Educativos
 *
 * Organización:
 * - Beginner: 3 shaders (5-8 nodos)
 * - Intermediate: 3 shaders (10-15 nodos)
 * - Advanced: 2 shaders (18-20 nodos)
 * - Code Golf: Shaders ultra-compactos (solo código)
 *
 * Cada ejemplo enseña técnicas específicas y es 100% construible con nodos.
 */

import { Node, Edge } from 'reactflow'

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'code-golf'

export interface ShaderExample {
  id: string
  name: string
  description: string
  difficulty: DifficultyLevel
  techniques: string[]  // Qué enseña este shader
  nodeCount: number
  nodes: Node[]
  edges: Edge[]
  glslCode?: string // For code golf examples
  thumbnail?: string  // Opcional para futuro
}

// ===== BEGINNER SHADERS (5-8 nodos) =====

export const BEGINNER_EXAMPLES: ShaderExample[] = [
  {
    id: 'uv-rainbow',
    name: 'UV Rainbow',
    description: 'Gradiente arcoíris basado en coordenadas UV',
    difficulty: 'beginner',
    techniques: ['UV coordinates', 'Vector construction', 'Basic color'],
    nodeCount: 5,
    nodes: [
      {
        id: 'n1',
        type: 'shaderNode',
        position: { x: 50, y: 150 },
        data: {
          label: 'UV',
          description: 'Coordenadas UV normalizadas',
          nodeType: 'uv_input',
          category: 'input',
          color: '#3b82f6',
          parameters: {},
        },
      },
      {
        id: 'n2',
        type: 'shaderNode',
        position: { x: 250, y: 100 },
        data: {
          label: 'Float Constant',
          description: 'Constante para canal azul',
          nodeType: 'float_constant',
          category: 'input',
          color: '#3b82f6',
          parameters: { value: 0.5 },
        },
      },
      {
        id: 'n3',
        type: 'shaderNode',
        position: { x: 450, y: 150 },
        data: {
          label: 'Vec3 Construct',
          description: 'Construir color RGB',
          nodeType: 'vec3_construct',
          category: 'vector',
          color: '#8b5cf6',
          parameters: {},
        },
      },
      {
        id: 'n4',
        type: 'shaderNode',
        position: { x: 700, y: 150 },
        data: {
          label: 'Fragment Output',
          description: 'Color final del shader',
          nodeType: 'fragment_output',
          category: 'output',
          color: '#ef4444',
          parameters: {},
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n3', sourceHandle: 'uv', targetHandle: 'x' },
      { id: 'e2', source: 'n1', target: 'n3', sourceHandle: 'uv', targetHandle: 'y' },
      { id: 'e3', source: 'n2', target: 'n3', sourceHandle: 'value', targetHandle: 'z' },
      { id: 'e4', source: 'n3', target: 'n4', sourceHandle: 'vec', targetHandle: 'color' },
    ],
  },
  {
    id: 'pulsating-circle',
    name: 'Pulsating Circle',
    description: 'Círculo que pulsa con el tiempo usando distancia',
    difficulty: 'beginner',
    techniques: ['Distance function', 'Time animation', 'Smoothstep'],
    nodeCount: 9,
    nodes: [
      {
        id: 'n1',
        type: 'shaderNode',
        position: { x: 50, y: 150 },
        data: {
          label: 'UV',
          nodeType: 'uv_input',
          category: 'input',
          color: '#3b82f6',
          parameters: {},
        },
      },
      {
        id: 'n2',
        type: 'shaderNode',
        position: { x: 50, y: 250 },
        data: {
          label: 'Time',
          nodeType: 'time_input',
          category: 'input',
          color: '#3b82f6',
          parameters: {},
        },
      },
      {
        id: 'n3',
        type: 'shaderNode',
        position: { x: 250, y: 150 },
        data: {
          label: 'Float Constant',
          description: 'Centro del círculo',
          nodeType: 'float_constant',
          category: 'input',
          color: '#3b82f6',
          parameters: { value: 0.5 },
        },
      },
      {
        id: 'n4',
        type: 'shaderNode',
        position: { x: 450, y: 150 },
        data: {
          label: 'Vec2 Construct',
          nodeType: 'vec2_construct',
          category: 'vector',
          color: '#8b5cf6',
          parameters: {},
        },
      },
      {
        id: 'n5',
        type: 'shaderNode',
        position: { x: 650, y: 150 },
        data: {
          label: 'Distance',
          nodeType: 'distance',
          category: 'vector',
          color: '#8b5cf6',
          parameters: {},
        },
      },
      {
        id: 'n6',
        type: 'shaderNode',
        position: { x: 250, y: 250 },
        data: {
          label: 'Sin',
          nodeType: 'sin',
          category: 'operation',
          color: '#10b981',
          parameters: {},
        },
      },
      {
        id: 'n7',
        type: 'shaderNode',
        position: { x: 850, y: 200 },
        data: {
          label: 'Smoothstep',
          nodeType: 'smoothstep',
          category: 'operation',
          color: '#10b981',
          parameters: {},
        },
      },
      {
        id: 'n8',
        type: 'shaderNode',
        position: { x: 1050, y: 200 },
        data: {
          label: 'Float→Vec3',
          nodeType: 'float_to_vec3',
          category: 'utility',
          color: '#ec4899',
          parameters: {},
        },
      },
      {
        id: 'n9',
        type: 'shaderNode',
        position: { x: 1250, y: 200 },
        data: {
          label: 'Fragment Output',
          nodeType: 'fragment_output',
          category: 'output',
          color: '#ef4444',
          parameters: {},
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'n3', target: 'n4', sourceHandle: 'value', targetHandle: 'x' },
      { id: 'e2', source: 'n3', target: 'n4', sourceHandle: 'value', targetHandle: 'y' },
      { id: 'e3', source: 'n1', target: 'n5', sourceHandle: 'uv', targetHandle: 'a' },
      { id: 'e4', source: 'n4', target: 'n5', sourceHandle: 'vec', targetHandle: 'b' },
      { id: 'e5', source: 'n2', target: 'n6', sourceHandle: 'time', targetHandle: 'value' },
      { id: 'e6', source: 'n5', target: 'n7', sourceHandle: 'dist', targetHandle: 'edge0' },
      { id: 'e7', source: 'n6', target: 'n7', sourceHandle: 'result', targetHandle: 'edge1' },
      { id: 'e8', source: 'n7', target: 'n8', sourceHandle: 'result', targetHandle: 'value' },
      { id: 'e9', source: 'n8', target: 'n9', sourceHandle: 'vec', targetHandle: 'color' },
    ],
  },
  {
    id: 'simple-gradient',
    name: 'Animated Gradient',
    description: 'Gradiente simple animado con tiempo',
    difficulty: 'beginner',
    techniques: ['Time animation', 'Math operations', 'Color mixing'],
    nodeCount: 6,
    nodes: [
      {
        id: 'n1',
        type: 'shaderNode',
        position: { x: 50, y: 150 },
        data: {
          label: 'UV',
          nodeType: 'uv_input',
          category: 'input',
          color: '#3b82f6',
          parameters: {},
        },
      },
      {
        id: 'n2',
        type: 'shaderNode',
        position: { x: 50, y: 250 },
        data: {
          label: 'Time',
          nodeType: 'time_input',
          category: 'input',
          color: '#3b82f6',
          parameters: {},
        },
      },
      {
        id: 'n3',
        type: 'shaderNode',
        position: { x: 250, y: 200 },
        data: {
          label: 'Add',
          nodeType: 'add',
          category: 'operation',
          color: '#10b981',
          parameters: {},
        },
      },
      {
        id: 'n4',
        type: 'shaderNode',
        position: { x: 450, y: 200 },
        data: {
          label: 'Sin',
          nodeType: 'sin',
          category: 'operation',
          color: '#10b981',
          parameters: {},
        },
      },
      {
        id: 'n5',
        type: 'shaderNode',
        position: { x: 650, y: 200 },
        data: {
          label: 'Float→Vec3',
          description: 'Convertir float a vec3',
          nodeType: 'float_to_vec3',
          category: 'vector',
          color: '#8b5cf6',
          parameters: {},
        },
      },
      {
        id: 'n6',
        type: 'shaderNode',
        position: { x: 850, y: 200 },
        data: {
          label: 'Fragment Output',
          nodeType: 'fragment_output',
          category: 'output',
          color: '#ef4444',
          parameters: {},
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n3', sourceHandle: 'uv', targetHandle: 'a' },
      { id: 'e2', source: 'n2', target: 'n3', sourceHandle: 'time', targetHandle: 'b' },
      { id: 'e3', source: 'n3', target: 'n4', sourceHandle: 'result', targetHandle: 'value' },
      { id: 'e4', source: 'n4', target: 'n5', sourceHandle: 'result', targetHandle: 'value' },
      { id: 'e5', source: 'n5', target: 'n6', sourceHandle: 'vec', targetHandle: 'color' },
    ],
  },
]

// ===== INTERMEDIATE SHADERS (10-15 nodos) =====

export const INTERMEDIATE_EXAMPLES: ShaderExample[] = [
  {
    id: 'animated-noise',
    name: 'Animated Noise',
    description: 'Ruido de Perlin animado con escala y velocidad',
    difficulty: 'intermediate',
    techniques: ['Perlin noise', 'Scale transformation', 'Time offset', 'Multiplication'],
    nodeCount: 10,
    nodes: [
      {
        id: 'n1',
        type: 'shaderNode',
        position: { x: 50, y: 150 },
        data: {
          label: 'UV',
          nodeType: 'uv_input',
          category: 'input',
          color: '#3b82f6',
          parameters: {},
        },
      },
      {
        id: 'n2',
        type: 'shaderNode',
        position: { x: 50, y: 250 },
        data: {
          label: 'Time',
          nodeType: 'time_input',
          category: 'input',
          color: '#3b82f6',
          parameters: {},
        },
      },
      {
        id: 'n3',
        type: 'shaderNode',
        position: { x: 250, y: 150 },
        data: {
          label: 'Float Constant',
          description: 'Escala del ruido',
          nodeType: 'float_constant',
          category: 'input',
          color: '#3b82f6',
          parameters: { value: 5.0 },
        },
      },
      {
        id: 'n4',
        type: 'shaderNode',
        position: { x: 450, y: 150 },
        data: {
          label: 'Multiply',
          description: 'UV * Escala',
          nodeType: 'multiply',
          category: 'operation',
          color: '#10b981',
          parameters: {},
        },
      },
      {
        id: 'n5',
        type: 'shaderNode',
        position: { x: 250, y: 250 },
        data: {
          label: 'Float Constant',
          description: 'Velocidad de animación',
          nodeType: 'float_constant',
          category: 'input',
          color: '#3b82f6',
          parameters: { value: 0.3 },
        },
      },
      {
        id: 'n6',
        type: 'shaderNode',
        position: { x: 450, y: 250 },
        data: {
          label: 'Multiply',
          description: 'Time * Velocidad',
          nodeType: 'multiply',
          category: 'operation',
          color: '#10b981',
          parameters: {},
        },
      },
      {
        id: 'n7',
        type: 'shaderNode',
        position: { x: 650, y: 200 },
        data: {
          label: 'Add',
          description: 'UV + Time offset',
          nodeType: 'add',
          category: 'operation',
          color: '#10b981',
          parameters: {},
        },
      },
      {
        id: 'n8',
        type: 'shaderNode',
        position: { x: 850, y: 200 },
        data: {
          label: 'Perlin Noise',
          nodeType: 'perlin_noise',
          category: 'utility',
          color: '#f59e0b',
          parameters: { scale: 1.0, octaves: 4 },
        },
      },
      {
        id: 'n9',
        type: 'shaderNode',
        position: { x: 1050, y: 200 },
        data: {
          label: 'Float→Vec3',
          nodeType: 'float_to_vec3',
          category: 'vector',
          color: '#8b5cf6',
          parameters: {},
        },
      },
      {
        id: 'n10',
        type: 'shaderNode',
        position: { x: 1250, y: 200 },
        data: {
          label: 'Fragment Output',
          nodeType: 'fragment_output',
          category: 'output',
          color: '#ef4444',
          parameters: {},
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n4', sourceHandle: 'uv', targetHandle: 'a' },
      { id: 'e2', source: 'n3', target: 'n4', sourceHandle: 'value', targetHandle: 'b' },
      { id: 'e3', source: 'n2', target: 'n6', sourceHandle: 'time', targetHandle: 'a' },
      { id: 'e4', source: 'n5', target: 'n6', sourceHandle: 'value', targetHandle: 'b' },
      { id: 'e5', source: 'n4', target: 'n7', sourceHandle: 'result', targetHandle: 'a' },
      { id: 'e6', source: 'n6', target: 'n7', sourceHandle: 'result', targetHandle: 'b' },
      { id: 'e7', source: 'n7', target: 'n8', sourceHandle: 'result', targetHandle: 'coord' },
      { id: 'e8', source: 'n8', target: 'n9', sourceHandle: 'noise', targetHandle: 'value' },
      { id: 'e9', source: 'n9', target: 'n10', sourceHandle: 'vec', targetHandle: 'color' },
    ],
  },
  {
    id: 'sdf-sphere',
    name: 'SDF Sphere',
    description: 'Esfera usando Signed Distance Field',
    difficulty: 'intermediate',
    techniques: ['SDF', 'Smoothstep', 'Vector operations', 'Centering'],
    nodeCount: 9,
    nodes: [
      {
        id: 'n1',
        type: 'shaderNode',
        position: { x: 50, y: 150 },
        data: {
          label: 'UV',
          nodeType: 'uv_input',
          category: 'input',
          color: '#3b82f6',
          parameters: {},
        },
      },
      {
        id: 'n2',
        type: 'shaderNode',
        position: { x: 250, y: 150 },
        data: {
          label: 'Float Constant',
          description: 'Centro 0.5',
          nodeType: 'float_constant',
          category: 'input',
          color: '#3b82f6',
          parameters: { value: 0.5 },
        },
      },
      {
        id: 'n3',
        type: 'shaderNode',
        position: { x: 450, y: 150 },
        data: {
          label: 'Subtract',
          description: 'UV - 0.5 (centrar)',
          nodeType: 'subtract',
          category: 'operation',
          color: '#10b981',
          parameters: {},
        },
      },
      {
        id: 'n4',
        type: 'shaderNode',
        position: { x: 650, y: 150 },
        data: {
          label: 'SDF Sphere',
          nodeType: 'sdf_sphere',
          category: 'utility',
          color: '#f59e0b',
          parameters: { radius: 0.3 },
        },
      },
      {
        id: 'n5',
        type: 'shaderNode',
        position: { x: 850, y: 150 },
        data: {
          label: 'Float Constant',
          description: 'Edge0',
          nodeType: 'float_constant',
          category: 'input',
          color: '#3b82f6',
          parameters: { value: 0.0 },
        },
      },
      {
        id: 'n6',
        type: 'shaderNode',
        position: { x: 850, y: 250 },
        data: {
          label: 'Float Constant',
          description: 'Edge1',
          nodeType: 'float_constant',
          category: 'input',
          color: '#3b82f6',
          parameters: { value: 0.01 },
        },
      },
      {
        id: 'n7',
        type: 'shaderNode',
        position: { x: 1050, y: 180 },
        data: {
          label: 'Smoothstep',
          nodeType: 'smoothstep',
          category: 'operation',
          color: '#10b981',
          parameters: {},
        },
      },
      {
        id: 'n8',
        type: 'shaderNode',
        position: { x: 1250, y: 180 },
        data: {
          label: 'Float→Vec3',
          nodeType: 'float_to_vec3',
          category: 'vector',
          color: '#8b5cf6',
          parameters: {},
        },
      },
      {
        id: 'n9',
        type: 'shaderNode',
        position: { x: 1450, y: 180 },
        data: {
          label: 'Fragment Output',
          nodeType: 'fragment_output',
          category: 'output',
          color: '#ef4444',
          parameters: {},
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n3', sourceHandle: 'uv', targetHandle: 'a' },
      { id: 'e2', source: 'n2', target: 'n3', sourceHandle: 'value', targetHandle: 'b' },
      { id: 'e3', source: 'n3', target: 'n4', sourceHandle: 'result', targetHandle: 'point' },
      { id: 'e4', source: 'n4', target: 'n7', sourceHandle: 'distance', targetHandle: 'x' },
      { id: 'e5', source: 'n5', target: 'n7', sourceHandle: 'value', targetHandle: 'edge0' },
      { id: 'e6', source: 'n6', target: 'n7', sourceHandle: 'value', targetHandle: 'edge1' },
      { id: 'e7', source: 'n7', target: 'n8', sourceHandle: 'result', targetHandle: 'value' },
      { id: 'e8', source: 'n8', target: 'n9', sourceHandle: 'vec', targetHandle: 'color' },
    ],
  },
  {
    id: 'color-mixing',
    name: 'Color Mixing',
    description: 'Mezcla de colores usando gradiente UV',
    difficulty: 'intermediate',
    techniques: ['Color pickers', 'Mix/Lerp', 'UV masking'],
    nodeCount: 6,
    nodes: [
      {
        id: 'n1',
        type: 'shaderNode',
        position: { x: 50, y: 150 },
        data: {
          label: 'UV',
          nodeType: 'uv_input',
          category: 'input',
          color: '#3b82f6',
          parameters: {},
        },
      },
      {
        id: 'n2',
        type: 'shaderNode',
        position: { x: 250, y: 100 },
        data: {
          label: 'Color A',
          description: 'Color rojo',
          nodeType: 'color_picker',
          category: 'color',
          color: '#ec4899',
          parameters: { color: '#ff0000' },
        },
      },
      {
        id: 'n3',
        type: 'shaderNode',
        position: { x: 250, y: 200 },
        data: {
          label: 'Color B',
          description: 'Color azul',
          nodeType: 'color_picker',
          category: 'color',
          color: '#ec4899',
          parameters: { color: '#0000ff' },
        },
      },
      {
        id: 'n4',
        type: 'shaderNode',
        position: { x: 250, y: 300 },
        data: {
          label: 'Split Vec2',
          description: 'Extraer componente X',
          nodeType: 'split_vec2',
          category: 'vector',
          color: '#8b5cf6',
          parameters: { component: 'x' },
        },
      },
      {
        id: 'n5',
        type: 'shaderNode',
        position: { x: 450, y: 200 },
        data: {
          label: 'Mix',
          description: 'Mezclar colores',
          nodeType: 'mix_colors',
          category: 'color',
          color: '#ec4899',
          parameters: {},
        },
      },
      {
        id: 'n6',
        type: 'shaderNode',
        position: { x: 650, y: 200 },
        data: {
          label: 'Fragment Output',
          nodeType: 'fragment_output',
          category: 'output',
          color: '#ef4444',
          parameters: {},
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n4', sourceHandle: 'uv', targetHandle: 'vector' },
      { id: 'e2', source: 'n2', target: 'n5', sourceHandle: 'color', targetHandle: 'colorA' },
      { id: 'e3', source: 'n3', target: 'n5', sourceHandle: 'color', targetHandle: 'colorB' },
      { id: 'e4', source: 'n4', target: 'n5', sourceHandle: 'component', targetHandle: 'factor' },
      { id: 'e5', source: 'n5', target: 'n6', sourceHandle: 'result', targetHandle: 'color' },
    ],
  },
]

// ===== ADVANCED SHADERS (18-20 nodos) =====

export const ADVANCED_EXAMPLES: ShaderExample[] = [
  {
    id: 'raymarched-sphere',
    name: 'Raymarched Sphere',
    description: 'Esfera con iluminación básica usando raymarching simplificado',
    difficulty: 'advanced',
    techniques: ['SDF', 'Normal calculation', 'Dot product', 'Lighting'],
    nodeCount: 15,
    nodes: [
      {
        id: 'n1',
        type: 'shaderNode',
        position: { x: 50, y: 200 },
        data: {
          label: 'UV',
          nodeType: 'uv_input',
          category: 'input',
          color: '#3b82f6',
          parameters: {},
        },
      },
      {
        id: 'n2',
        type: 'shaderNode',
        position: { x: 250, y: 200 },
        data: {
          label: 'Center',
          nodeType: 'float_constant',
          category: 'input',
          color: '#3b82f6',
          parameters: { value: 0.5 },
        },
      },
      {
        id: 'n3',
        type: 'shaderNode',
        position: { x: 450, y: 200 },
        data: {
          label: 'Subtract',
          nodeType: 'subtract',
          category: 'operation',
          color: '#10b981',
          parameters: {},
        },
      },
      {
        id: 'n4',
        type: 'shaderNode',
        position: { x: 650, y: 200 },
        data: {
          label: 'SDF Sphere',
          nodeType: 'sdf_sphere',
          category: 'utility',
          color: '#f59e0b',
          parameters: { radius: 0.25 },
        },
      },
      {
        id: 'n5',
        type: 'shaderNode',
        position: { x: 650, y: 100 },
        data: {
          label: 'Light Dir',
          description: 'Dirección de luz',
          nodeType: 'vec3_construct',
          category: 'vector',
          color: '#8b5cf6',
          parameters: {},
        },
      },
      {
        id: 'n6',
        type: 'shaderNode',
        position: { x: 450, y: 50 },
        data: {
          label: 'Light X',
          nodeType: 'float_constant',
          category: 'input',
          color: '#3b82f6',
          parameters: { value: 1.0 },
        },
      },
      {
        id: 'n7',
        type: 'shaderNode',
        position: { x: 450, y: 100 },
        data: {
          label: 'Light Y',
          nodeType: 'float_constant',
          category: 'input',
          color: '#3b82f6',
          parameters: { value: 1.0 },
        },
      },
      {
        id: 'n8',
        type: 'shaderNode',
        position: { x: 450, y: 150 },
        data: {
          label: 'Light Z',
          nodeType: 'float_constant',
          category: 'input',
          color: '#3b82f6',
          parameters: { value: -1.0 },
        },
      },
      {
        id: 'n9',
        type: 'shaderNode',
        position: { x: 850, y: 150 },
        data: {
          label: 'Normalize Light',
          nodeType: 'normalize',
          category: 'vector',
          color: '#8b5cf6',
          parameters: {},
        },
      },
      {
        id: 'n10',
        type: 'shaderNode',
        position: { x: 850, y: 250 },
        data: {
          label: 'Normalize Normal',
          nodeType: 'normalize',
          category: 'vector',
          color: '#8b5cf6',
          parameters: {},
        },
      },
      {
        id: 'n11',
        type: 'shaderNode',
        position: { x: 1050, y: 200 },
        data: {
          label: 'Dot Product',
          description: 'Lighting calculation',
          nodeType: 'dot',
          category: 'vector',
          color: '#8b5cf6',
          parameters: {},
        },
      },
      {
        id: 'n12',
        type: 'shaderNode',
        position: { x: 1250, y: 200 },
        data: {
          label: 'Max',
          description: 'Clamp to 0',
          nodeType: 'max',
          category: 'operation',
          color: '#10b981',
          parameters: {},
        },
      },
      {
        id: 'n13',
        type: 'shaderNode',
        position: { x: 1250, y: 300 },
        data: {
          label: 'Zero',
          nodeType: 'float_constant',
          category: 'input',
          color: '#3b82f6',
          parameters: { value: 0.0 },
        },
      },
      {
        id: 'n14',
        type: 'shaderNode',
        position: { x: 1450, y: 220 },
        data: {
          label: 'Float→Vec3',
          nodeType: 'float_to_vec3',
          category: 'vector',
          color: '#8b5cf6',
          parameters: {},
        },
      },
      {
        id: 'n15',
        type: 'shaderNode',
        position: { x: 1650, y: 220 },
        data: {
          label: 'Fragment Output',
          nodeType: 'fragment_output',
          category: 'output',
          color: '#ef4444',
          parameters: {},
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n3', sourceHandle: 'uv', targetHandle: 'a' },
      { id: 'e2', source: 'n2', target: 'n3', sourceHandle: 'value', targetHandle: 'b' },
      { id: 'e3', source: 'n3', target: 'n4', sourceHandle: 'result', targetHandle: 'point' },
      { id: 'e4', source: 'n6', target: 'n5', sourceHandle: 'value', targetHandle: 'x' },
      { id: 'e5', source: 'n7', target: 'n5', sourceHandle: 'value', targetHandle: 'y' },
      { id: 'e6', source: 'n8', target: 'n5', sourceHandle: 'value', targetHandle: 'z' },
      { id: 'e7', source: 'n5', target: 'n9', sourceHandle: 'vec', targetHandle: 'vector' },
      { id: 'e8', source: 'n3', target: 'n10', sourceHandle: 'result', targetHandle: 'vector' },
      { id: 'e9', source: 'n9', target: 'n11', sourceHandle: 'normalized', targetHandle: 'a' },
      { id: 'e10', source: 'n10', target: 'n11', sourceHandle: 'normalized', targetHandle: 'b' },
      { id: 'e11', source: 'n11', target: 'n12', sourceHandle: 'result', targetHandle: 'a' },
      { id: 'e12', source: 'n13', target: 'n12', sourceHandle: 'value', targetHandle: 'b' },
      { id: 'e13', source: 'n12', target: 'n14', sourceHandle: 'result', targetHandle: 'value' },
      { id: 'e14', source: 'n14', target: 'n15', sourceHandle: 'vec', targetHandle: 'color' },
    ],
  },
  {
    id: 'fractal-pattern',
    name: 'Fractal Pattern',
    description: 'Patrón fractal usando operaciones matemáticas repetidas',
    difficulty: 'advanced',
    techniques: ['Fract function', 'Sin/Cos', 'Multiplication', 'Pattern repetition'],
    nodeCount: 14,
    nodes: [
      {
        id: 'n1',
        type: 'shaderNode',
        position: { x: 50, y: 200 },
        data: {
          label: 'UV',
          nodeType: 'uv_input',
          category: 'input',
          color: '#3b82f6',
          parameters: {},
        },
      },
      {
        id: 'n2',
        type: 'shaderNode',
        position: { x: 50, y: 300 },
        data: {
          label: 'Time',
          nodeType: 'time_input',
          category: 'input',
          color: '#3b82f6',
          parameters: {},
        },
      },
      {
        id: 'n3',
        type: 'shaderNode',
        position: { x: 250, y: 200 },
        data: {
          label: 'Scale 1',
          nodeType: 'float_constant',
          category: 'input',
          color: '#3b82f6',
          parameters: { value: 10.0 },
        },
      },
      {
        id: 'n4',
        type: 'shaderNode',
        position: { x: 450, y: 200 },
        data: {
          label: 'Multiply',
          nodeType: 'multiply',
          category: 'operation',
          color: '#10b981',
          parameters: {},
        },
      },
      {
        id: 'n5',
        type: 'shaderNode',
        position: { x: 450, y: 300 },
        data: {
          label: 'Multiply Time',
          nodeType: 'multiply',
          category: 'operation',
          color: '#10b981',
          parameters: {},
        },
      },
      {
        id: 'n6',
        type: 'shaderNode',
        position: { x: 250, y: 300 },
        data: {
          label: 'Speed',
          nodeType: 'float_constant',
          category: 'input',
          color: '#3b82f6',
          parameters: { value: 0.5 },
        },
      },
      {
        id: 'n7',
        type: 'shaderNode',
        position: { x: 650, y: 250 },
        data: {
          label: 'Add',
          nodeType: 'add',
          category: 'operation',
          color: '#10b981',
          parameters: {},
        },
      },
      {
        id: 'n8',
        type: 'shaderNode',
        position: { x: 850, y: 250 },
        data: {
          label: 'Fract',
          description: 'Crear repetición',
          nodeType: 'fract',
          category: 'operation',
          color: '#10b981',
          parameters: {},
        },
      },
      {
        id: 'n9',
        type: 'shaderNode',
        position: { x: 1050, y: 200 },
        data: {
          label: 'Sin',
          nodeType: 'sin',
          category: 'operation',
          color: '#10b981',
          parameters: {},
        },
      },
      {
        id: 'n10',
        type: 'shaderNode',
        position: { x: 1050, y: 300 },
        data: {
          label: 'Cos',
          nodeType: 'cos',
          category: 'operation',
          color: '#10b981',
          parameters: {},
        },
      },
      {
        id: 'n11',
        type: 'shaderNode',
        position: { x: 1250, y: 250 },
        data: {
          label: 'Multiply',
          nodeType: 'multiply',
          category: 'operation',
          color: '#10b981',
          parameters: {},
        },
      },
      {
        id: 'n12',
        type: 'shaderNode',
        position: { x: 1450, y: 250 },
        data: {
          label: 'Abs',
          nodeType: 'abs',
          category: 'operation',
          color: '#10b981',
          parameters: {},
        },
      },
      {
        id: 'n13',
        type: 'shaderNode',
        position: { x: 1650, y: 250 },
        data: {
          label: 'Float→Vec3',
          nodeType: 'float_to_vec3',
          category: 'vector',
          color: '#8b5cf6',
          parameters: {},
        },
      },
      {
        id: 'n14',
        type: 'shaderNode',
        position: { x: 1850, y: 250 },
        data: {
          label: 'Fragment Output',
          nodeType: 'fragment_output',
          category: 'output',
          color: '#ef4444',
          parameters: {},
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n4', sourceHandle: 'uv', targetHandle: 'a' },
      { id: 'e2', source: 'n3', target: 'n4', sourceHandle: 'value', targetHandle: 'b' },
      { id: 'e3', source: 'n2', target: 'n5', sourceHandle: 'time', targetHandle: 'a' },
      { id: 'e4', source: 'n6', target: 'n5', sourceHandle: 'value', targetHandle: 'b' },
      { id: 'e5', source: 'n4', target: 'n7', sourceHandle: 'result', targetHandle: 'a' },
      { id: 'e6', source: 'n5', target: 'n7', sourceHandle: 'result', targetHandle: 'b' },
      { id: 'e7', source: 'n7', target: 'n8', sourceHandle: 'result', targetHandle: 'value' },
      { id: 'e8', source: 'n8', target: 'n9', sourceHandle: 'result', targetHandle: 'value' },
      { id: 'e9', source: 'n8', target: 'n10', sourceHandle: 'result', targetHandle: 'value' },
      { id: 'e10', source: 'n9', target: 'n11', sourceHandle: 'result', targetHandle: 'a' },
      { id: 'e11', source: 'n10', target: 'n11', sourceHandle: 'result', targetHandle: 'b' },
      { id: 'e12', source: 'n11', target: 'n12', sourceHandle: 'result', targetHandle: 'value' },
      { id: 'e13', source: 'n12', target: 'n13', sourceHandle: 'result', targetHandle: 'value' },
      { id: 'e14', source: 'n13', target: 'n14', sourceHandle: 'vec', targetHandle: 'color' },
    ],
  },
]

// ===== CODE GOLF SHADERS (Optimized for Code Mode) =====

export const CODE_GOLF_EXAMPLES: ShaderExample[] = [
  {
    id: 'plasma-compact',
    name: 'Plasma (Code Golf)',
    description: 'Efecto de plasma ultra-compacto - Mejor en modo código',
    difficulty: 'code-golf',
    techniques: ['Sin loops', 'Funciones trigonométricas', 'Code golf'],
    nodeCount: 0,
    nodes: [],
    edges: [],
    glslCode: `// Plasma Effect - Ultra Compact
vec2 uv = fragCoord / iResolution.xy;
vec3 col = vec3(0);
for(float i = 0.0; i < 3.0; i++) {
  vec2 p = uv * 5.0 + iTime * 0.3;
  col[int(i)] = sin(p.x + sin(p.y + iTime + i)) * 0.5 + 0.5;
}
fragColor = vec4(col, 1.0);`
  },
  {
    id: 'tunnel-compact',
    name: 'Túnel Infinito (Code Golf)',
    description: 'Túnel 3D en código ultra-compacto - Mejor en modo código',
    difficulty: 'code-golf',
    techniques: ['Coordenadas polares', 'atan', 'Code golf'],
    nodeCount: 0,
    nodes: [],
    edges: [],
    glslCode: `// Infinite Tunnel - Ultra Compact
vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
float a = atan(uv.y, uv.x);
float r = length(uv);
vec2 uv2 = vec2(a / 3.14159, 1.0 / r + iTime);
vec3 col = vec3(sin(uv2.x * 10.0 + iTime), sin(uv2.y * 5.0), cos(uv2.x * 8.0 - iTime));
fragColor = vec4(col * (1.0 - r * 0.5), 1.0);`
  },
  {
    id: 'fractal-compact',
    name: 'Mandelbrot Fractal (Code Golf)',
    description: 'Fractal de Mandelbrot minimalista - Mejor en modo código',
    difficulty: 'code-golf',
    techniques: ['Iteraciones', 'Números complejos', 'Code golf'],
    nodeCount: 0,
    nodes: [],
    edges: [],
    glslCode: `// Mandelbrot Fractal - Ultra Compact
vec2 c = (fragCoord - 0.5 * iResolution.xy) / iResolution.y * 3.0 - vec2(0.5, 0.0);
vec2 z = vec2(0.0);
float iterations = 0.0;
for(int i = 0; i < 100; i++) {
  z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
  if(length(z) > 2.0) break;
  iterations++;
}
vec3 col = 0.5 + 0.5 * cos(3.0 + iterations * 0.15 + vec3(0.0, 0.6, 1.0));
fragColor = vec4(col, 1.0);`
  },
]

// ===== EXPORTS =====

export const ALL_EXAMPLES: ShaderExample[] = [
  ...BEGINNER_EXAMPLES,
  ...INTERMEDIATE_EXAMPLES,
  ...ADVANCED_EXAMPLES,
  ...CODE_GOLF_EXAMPLES,
]

export const EXAMPLES_BY_DIFFICULTY: Record<DifficultyLevel, ShaderExample[]> = {
  beginner: BEGINNER_EXAMPLES,
  intermediate: INTERMEDIATE_EXAMPLES,
  advanced: ADVANCED_EXAMPLES,
  'code-golf': CODE_GOLF_EXAMPLES,
}

export function getExampleById(id: string): ShaderExample | undefined {
  return ALL_EXAMPLES.find(example => example.id === id)
}

export function getExamplesByDifficulty(difficulty: DifficultyLevel): ShaderExample[] {
  return EXAMPLES_BY_DIFFICULTY[difficulty]
}
