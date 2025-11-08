/**
 * Galería de Shaders Educativos
 *
 * Organización:
 * - Beginner: 3 shaders (5-8 nodos)
 * - Intermediate: 3 shaders (10-15 nodos)
 * - Advanced: 2 shaders (18-20 nodos)
 *
 * Cada ejemplo enseña técnicas específicas y es 100% construible con nodos.
 */

import { Node, Edge } from 'reactflow'

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'

export interface ShaderExample {
  id: string
  name: string
  description: string
  difficulty: DifficultyLevel
  techniques: string[]  // Qué enseña este shader
  nodeCount: number
  nodes: Node[]
  edges: Edge[]
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
      { id: 'e1', source: 'n1', target: 'n3', sourceHandle: 'output', targetHandle: 'x' },
      { id: 'e2', source: 'n1', target: 'n3', sourceHandle: 'output', targetHandle: 'y' },
      { id: 'e3', source: 'n2', target: 'n3', sourceHandle: 'output', targetHandle: 'z' },
      { id: 'e4', source: 'n3', target: 'n4', sourceHandle: 'output', targetHandle: 'input' },
    ],
  },
  {
    id: 'pulsating-circle',
    name: 'Pulsating Circle',
    description: 'Círculo que pulsa con el tiempo usando distancia',
    difficulty: 'beginner',
    techniques: ['Distance function', 'Time animation', 'Smoothstep'],
    nodeCount: 8,
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
          label: 'Fragment Output',
          nodeType: 'fragment_output',
          category: 'output',
          color: '#ef4444',
          parameters: {},
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'n3', target: 'n4', sourceHandle: 'output', targetHandle: 'x' },
      { id: 'e2', source: 'n3', target: 'n4', sourceHandle: 'output', targetHandle: 'y' },
      { id: 'e3', source: 'n1', target: 'n5', sourceHandle: 'output', targetHandle: 'a' },
      { id: 'e4', source: 'n4', target: 'n5', sourceHandle: 'output', targetHandle: 'b' },
      { id: 'e5', source: 'n2', target: 'n6', sourceHandle: 'output', targetHandle: 'input' },
      { id: 'e6', source: 'n5', target: 'n7', sourceHandle: 'output', targetHandle: 'edge0' },
      { id: 'e7', source: 'n6', target: 'n7', sourceHandle: 'output', targetHandle: 'edge1' },
      { id: 'e8', source: 'n7', target: 'n8', sourceHandle: 'output', targetHandle: 'input' },
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
      { id: 'e1', source: 'n1', target: 'n3', sourceHandle: 'output', targetHandle: 'a' },
      { id: 'e2', source: 'n2', target: 'n3', sourceHandle: 'output', targetHandle: 'b' },
      { id: 'e3', source: 'n3', target: 'n4', sourceHandle: 'output', targetHandle: 'input' },
      { id: 'e4', source: 'n4', target: 'n5', sourceHandle: 'output', targetHandle: 'input' },
      { id: 'e5', source: 'n5', target: 'n6', sourceHandle: 'output', targetHandle: 'input' },
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
    nodeCount: 12,
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
      { id: 'e1', source: 'n1', target: 'n4', sourceHandle: 'output', targetHandle: 'a' },
      { id: 'e2', source: 'n3', target: 'n4', sourceHandle: 'output', targetHandle: 'b' },
      { id: 'e3', source: 'n2', target: 'n6', sourceHandle: 'output', targetHandle: 'a' },
      { id: 'e4', source: 'n5', target: 'n6', sourceHandle: 'output', targetHandle: 'b' },
      { id: 'e5', source: 'n4', target: 'n7', sourceHandle: 'output', targetHandle: 'a' },
      { id: 'e6', source: 'n6', target: 'n7', sourceHandle: 'output', targetHandle: 'b' },
      { id: 'e7', source: 'n7', target: 'n8', sourceHandle: 'output', targetHandle: 'input' },
      { id: 'e8', source: 'n8', target: 'n9', sourceHandle: 'output', targetHandle: 'input' },
      { id: 'e9', source: 'n9', target: 'n10', sourceHandle: 'output', targetHandle: 'input' },
    ],
  },
  {
    id: 'sdf-sphere',
    name: 'SDF Sphere',
    description: 'Esfera usando Signed Distance Field',
    difficulty: 'intermediate',
    techniques: ['SDF', 'Smoothstep', 'Vector operations', 'Centering'],
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
      { id: 'e1', source: 'n1', target: 'n3', sourceHandle: 'output', targetHandle: 'a' },
      { id: 'e2', source: 'n2', target: 'n3', sourceHandle: 'output', targetHandle: 'b' },
      { id: 'e3', source: 'n3', target: 'n4', sourceHandle: 'output', targetHandle: 'point' },
      { id: 'e4', source: 'n4', target: 'n7', sourceHandle: 'output', targetHandle: 'x' },
      { id: 'e5', source: 'n5', target: 'n7', sourceHandle: 'output', targetHandle: 'edge0' },
      { id: 'e6', source: 'n6', target: 'n7', sourceHandle: 'output', targetHandle: 'edge1' },
      { id: 'e7', source: 'n7', target: 'n8', sourceHandle: 'output', targetHandle: 'input' },
      { id: 'e8', source: 'n8', target: 'n9', sourceHandle: 'output', targetHandle: 'input' },
    ],
  },
  {
    id: 'color-mixing',
    name: 'Color Mixing',
    description: 'Mezcla de colores usando gradiente UV',
    difficulty: 'intermediate',
    techniques: ['Color pickers', 'Mix/Lerp', 'UV masking'],
    nodeCount: 15,
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
      { id: 'e1', source: 'n1', target: 'n4', sourceHandle: 'output', targetHandle: 'input' },
      { id: 'e2', source: 'n2', target: 'n5', sourceHandle: 'output', targetHandle: 'a' },
      { id: 'e3', source: 'n3', target: 'n5', sourceHandle: 'output', targetHandle: 'b' },
      { id: 'e4', source: 'n4', target: 'n5', sourceHandle: 'output', targetHandle: 't' },
      { id: 'e5', source: 'n5', target: 'n6', sourceHandle: 'output', targetHandle: 'input' },
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
    nodeCount: 20,
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
      { id: 'e1', source: 'n1', target: 'n3', sourceHandle: 'output', targetHandle: 'a' },
      { id: 'e2', source: 'n2', target: 'n3', sourceHandle: 'output', targetHandle: 'b' },
      { id: 'e3', source: 'n3', target: 'n4', sourceHandle: 'output', targetHandle: 'point' },
      { id: 'e4', source: 'n6', target: 'n5', sourceHandle: 'output', targetHandle: 'x' },
      { id: 'e5', source: 'n7', target: 'n5', sourceHandle: 'output', targetHandle: 'y' },
      { id: 'e6', source: 'n8', target: 'n5', sourceHandle: 'output', targetHandle: 'z' },
      { id: 'e7', source: 'n5', target: 'n9', sourceHandle: 'output', targetHandle: 'input' },
      { id: 'e8', source: 'n3', target: 'n10', sourceHandle: 'output', targetHandle: 'input' },
      { id: 'e9', source: 'n9', target: 'n11', sourceHandle: 'output', targetHandle: 'a' },
      { id: 'e10', source: 'n10', target: 'n11', sourceHandle: 'output', targetHandle: 'b' },
      { id: 'e11', source: 'n11', target: 'n12', sourceHandle: 'output', targetHandle: 'a' },
      { id: 'e12', source: 'n13', target: 'n12', sourceHandle: 'output', targetHandle: 'b' },
      { id: 'e13', source: 'n12', target: 'n14', sourceHandle: 'output', targetHandle: 'input' },
      { id: 'e14', source: 'n14', target: 'n15', sourceHandle: 'output', targetHandle: 'input' },
    ],
  },
  {
    id: 'fractal-pattern',
    name: 'Fractal Pattern',
    description: 'Patrón fractal usando operaciones matemáticas repetidas',
    difficulty: 'advanced',
    techniques: ['Fract function', 'Sin/Cos', 'Multiplication', 'Pattern repetition'],
    nodeCount: 18,
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
      { id: 'e1', source: 'n1', target: 'n4', sourceHandle: 'output', targetHandle: 'a' },
      { id: 'e2', source: 'n3', target: 'n4', sourceHandle: 'output', targetHandle: 'b' },
      { id: 'e3', source: 'n2', target: 'n5', sourceHandle: 'output', targetHandle: 'a' },
      { id: 'e4', source: 'n6', target: 'n5', sourceHandle: 'output', targetHandle: 'b' },
      { id: 'e5', source: 'n4', target: 'n7', sourceHandle: 'output', targetHandle: 'a' },
      { id: 'e6', source: 'n5', target: 'n7', sourceHandle: 'output', targetHandle: 'b' },
      { id: 'e7', source: 'n7', target: 'n8', sourceHandle: 'output', targetHandle: 'input' },
      { id: 'e8', source: 'n8', target: 'n9', sourceHandle: 'output', targetHandle: 'input' },
      { id: 'e9', source: 'n8', target: 'n10', sourceHandle: 'output', targetHandle: 'input' },
      { id: 'e10', source: 'n9', target: 'n11', sourceHandle: 'output', targetHandle: 'a' },
      { id: 'e11', source: 'n10', target: 'n11', sourceHandle: 'output', targetHandle: 'b' },
      { id: 'e12', source: 'n11', target: 'n12', sourceHandle: 'output', targetHandle: 'input' },
      { id: 'e13', source: 'n12', target: 'n13', sourceHandle: 'output', targetHandle: 'input' },
      { id: 'e14', source: 'n13', target: 'n14', sourceHandle: 'output', targetHandle: 'input' },
    ],
  },
]

// ===== EXPORTS =====

export const ALL_EXAMPLES: ShaderExample[] = [
  ...BEGINNER_EXAMPLES,
  ...INTERMEDIATE_EXAMPLES,
  ...ADVANCED_EXAMPLES,
]

export const EXAMPLES_BY_DIFFICULTY: Record<DifficultyLevel, ShaderExample[]> = {
  beginner: BEGINNER_EXAMPLES,
  intermediate: INTERMEDIATE_EXAMPLES,
  advanced: ADVANCED_EXAMPLES,
}

export function getExampleById(id: string): ShaderExample | undefined {
  return ALL_EXAMPLES.find(example => example.id === id)
}

export function getExamplesByDifficulty(difficulty: DifficultyLevel): ShaderExample[] {
  return EXAMPLES_BY_DIFFICULTY[difficulty]
}
