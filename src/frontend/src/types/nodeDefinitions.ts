// Definiciones mejoradas de nodos con parámetros editables

import { MATH_NODES, VECTOR_NODES, CONVERSION_NODES, CUSTOM_NODES } from './nodeLibrary'

export type NodeCategory = 'input' | 'operation' | 'output' | 'color' | 'vector' | 'texture' | 'utility'
export type ParameterType = 'float' | 'int' | 'vec2' | 'vec3' | 'vec4' | 'color' | 'select'

export interface NodeParameter {
  name: string
  label: string
  type: ParameterType
  default: number | string
  min?: number
  max?: number
  step?: number
  options?: { label: string; value: string }[]
  description?: string
}

export interface NodeDefinition {
  id: string
  label: string
  description: string
  category: NodeCategory
  color: string
  inputs: Array<{ name: string; type: string; description?: string }>
  outputs: Array<{ name: string; type: string; description?: string }>
  parameters: NodeParameter[]
  glslFunction?: string
  glslTemplate?: string
}

// Enum para IDs de nodos (para evitar strings hardcodeados)
export const NODE_TYPES = {
  // INPUTS
  UV_INPUT: 'uv_input',
  TIME_INPUT: 'time_input',
  MOUSE_INPUT: 'mouse_input',
  FLOAT_CONSTANT: 'float_constant',
  
  // MATH
  ADD: 'add',
  MULTIPLY: 'multiply',
  DIVIDE: 'divide',
  POWER: 'power',
  CLAMP: 'clamp',
  LERP: 'lerp',
  
  // NOISE
  PERLIN_NOISE: 'perlin_noise',
  SIMPLEX_NOISE: 'simplex_noise',
  VORONOI: 'voronoi',
  FBM: 'fbm',
  
  // COLOR
  RGB_TO_HSV: 'rgb_to_hsv',
  HSV_TO_RGB: 'hsv_to_rgb',
  COLOR_PICKER: 'color_picker',
  MIX_COLORS: 'mix_colors',
  
  // VECTOR
  VEC3_CONSTRUCT: 'vec3_construct',
  LENGTH: 'length',
  NORMALIZE: 'normalize',
  
  // SDF
  SDF_SPHERE: 'sdf_sphere',
  SDF_BOX: 'sdf_box',
  SDF_TORUS: 'sdf_torus',
  SDF_CYLINDER: 'sdf_cylinder',
  
  // OUTPUT
  FRAGMENT_OUTPUT: 'fragment_output',
  NORMAL_OUTPUT: 'normal_output',
} as const

const BASE_NODE_DEFINITIONS: Record<string, NodeDefinition> = {
  // ===== INPUTS =====
  uv_input: {
    id: 'uv_input',
    label: 'UV',
    description: 'Coordenadas UV normalizadas de pantalla',
    category: 'input',
    color: '#3b82f6',
    inputs: [],
    outputs: [{ name: 'uv', type: 'vec2', description: 'UV coordinates' }],
    parameters: [],
    glslFunction: 'vec2 uv = fragCoord / iResolution.xy;',
  },

  time_input: {
    id: 'time_input',
    label: 'Time',
    description: 'Tiempo desde inicio (en segundos)',
    category: 'input',
    color: '#3b82f6',
    inputs: [],
    outputs: [{ name: 'time', type: 'float', description: 'Time in seconds' }],
    parameters: [],
    glslFunction: 'float time = iTime;',
  },

  mouse_input: {
    id: 'mouse_input',
    label: 'Mouse',
    description: 'Posición del mouse normalizada',
    category: 'input',
    color: '#3b82f6',
    inputs: [],
    outputs: [{ name: 'mouse', type: 'vec2', description: 'Mouse position' }],
    parameters: [],
    glslFunction: 'vec2 mouse = iMouse.xy / iResolution.xy;',
  },

  float_constant: {
    id: 'float_constant',
    label: 'Float',
    description: 'Constante numérica',
    category: 'input',
    color: '#3b82f6',
    inputs: [],
    outputs: [{ name: 'value', type: 'float', description: 'Float value' }],
    parameters: [
      {
        name: 'value',
        label: 'Valor',
        type: 'float',
        default: 1.0,
        min: -10,
        max: 10,
        step: 0.1,
        description: 'Valor numérico',
      },
    ],
    glslFunction: 'float value = {value};',
  },

  // ===== MATH OPERATIONS =====
  add: {
    id: 'add',
    label: 'Add',
    description: 'Suma dos valores',
    category: 'operation',
    color: '#8b5cf6',
    inputs: [
      { name: 'a', type: 'float' },
      { name: 'b', type: 'float' },
    ],
    outputs: [{ name: 'result', type: 'float' }],
    parameters: [],
    glslFunction: 'float result = a + b;',
  },

  multiply: {
    id: 'multiply',
    label: 'Multiply',
    description: 'Multiplica dos valores',
    category: 'operation',
    color: '#8b5cf6',
    inputs: [
      { name: 'a', type: 'float' },
      { name: 'b', type: 'float' },
    ],
    outputs: [{ name: 'result', type: 'float' }],
    parameters: [],
    glslFunction: 'float result = a * b;',
  },

  divide: {
    id: 'divide',
    label: 'Divide',
    description: 'Divide dos valores',
    category: 'operation',
    color: '#8b5cf6',
    inputs: [
      { name: 'a', type: 'float' },
      { name: 'b', type: 'float' },
    ],
    outputs: [{ name: 'result', type: 'float' }],
    parameters: [],
    glslFunction: 'float result = a / max(b, 0.001);',
  },

  power: {
    id: 'power',
    label: 'Power',
    description: 'Eleva base a la potencia',
    category: 'operation',
    color: '#8b5cf6',
    inputs: [
      { name: 'base', type: 'float' },
      { name: 'exponent', type: 'float' },
    ],
    outputs: [{ name: 'result', type: 'float' }],
    parameters: [],
    glslFunction: 'float result = pow(base, exponent);',
  },

  clamp: {
    id: 'clamp',
    label: 'Clamp',
    description: 'Limita valor entre min y max',
    category: 'operation',
    color: '#8b5cf6',
    inputs: [
      { name: 'value', type: 'float' },
      { name: 'min', type: 'float' },
      { name: 'max', type: 'float' },
    ],
    outputs: [{ name: 'result', type: 'float' }],
    parameters: [],
    glslFunction: 'float result = clamp(value, min, max);',
  },

  lerp: {
    id: 'lerp',
    label: 'Lerp',
    description: 'Interpolación lineal entre dos valores',
    category: 'operation',
    color: '#8b5cf6',
    inputs: [
      { name: 'a', type: 'float' },
      { name: 'b', type: 'float' },
      { name: 't', type: 'float' },
    ],
    outputs: [{ name: 'result', type: 'float' }],
    parameters: [],
    glslFunction: 'float result = mix(a, b, clamp(t, 0.0, 1.0));',
  },

  // ===== NOISE & PROCEDURAL =====
  perlin_noise: {
    id: 'perlin_noise',
    label: 'Perlin Noise',
    description: 'Ruido de Perlin 2D',
    category: 'utility',
    color: '#ec4899',
    inputs: [{ name: 'coord', type: 'vec2' }],
    outputs: [{ name: 'noise', type: 'float' }],
    parameters: [
      {
        name: 'scale',
        label: 'Escala',
        type: 'float',
        default: 1.0,
        min: 0.1,
        max: 10.0,
        step: 0.1,
      },
    ],
    glslFunction: 'float noise = perlin(coord * {scale});',
  },

  simplex_noise: {
    id: 'simplex_noise',
    label: 'Simplex Noise',
    description: 'Ruido Simplex 2D',
    category: 'utility',
    color: '#ec4899',
    inputs: [{ name: 'coord', type: 'vec2' }],
    outputs: [{ name: 'noise', type: 'float' }],
    parameters: [
      {
        name: 'scale',
        label: 'Escala',
        type: 'float',
        default: 1.0,
        min: 0.1,
        max: 10.0,
        step: 0.1,
      },
    ],
    glslFunction: 'float noise = simplex(coord * {scale});',
  },

  fbm: {
    id: 'fbm',
    label: 'FBM',
    description: 'Fractional Brownian Motion',
    category: 'utility',
    color: '#ec4899',
    inputs: [{ name: 'coord', type: 'vec2' }],
    outputs: [{ name: 'fbm', type: 'float' }],
    parameters: [
      {
        name: 'scale',
        label: 'Escala',
        type: 'float',
        default: 1.0,
        min: 0.1,
        max: 10.0,
        step: 0.1,
      },
      {
        name: 'octaves',
        label: 'Octavas',
        type: 'int',
        default: 4,
        min: 1,
        max: 8,
        step: 1,
      },
    ],
    glslFunction: 'float fbm = fbmNoise(coord * {scale}, {octaves});',
  },

  // ===== COLOR OPERATIONS =====
  rgb_to_hsv: {
    id: 'rgb_to_hsv',
    label: 'RGB→HSV',
    description: 'Convierte RGB a HSV',
    category: 'color',
    color: '#f59e0b',
    inputs: [{ name: 'rgb', type: 'vec3' }],
    outputs: [{ name: 'hsv', type: 'vec3' }],
    parameters: [],
    glslFunction: 'vec3 hsv = rgbToHsv(rgb);',
  },

  hsv_to_rgb: {
    id: 'hsv_to_rgb',
    label: 'HSV→RGB',
    description: 'Convierte HSV a RGB',
    category: 'color',
    color: '#f59e0b',
    inputs: [{ name: 'hsv', type: 'vec3' }],
    outputs: [{ name: 'rgb', type: 'vec3' }],
    parameters: [],
    glslFunction: 'vec3 rgb = hsvToRgb(hsv);',
  },

  color_picker: {
    id: 'color_picker',
    label: 'Color Picker',
    description: 'Color picker constante',
    category: 'color',
    color: '#f59e0b',
    inputs: [],
    outputs: [{ name: 'color', type: 'vec3' }],
    parameters: [
      {
        name: 'color',
        label: 'Color',
        type: 'color',
        default: '#ff0000',
        description: 'Selecciona un color',
      },
    ],
    glslFunction: 'vec3 color = {color};',
  },

  mix_colors: {
    id: 'mix_colors',
    label: 'Mix Colors',
    description: 'Mezcla dos colores',
    category: 'color',
    color: '#f59e0b',
    inputs: [
      { name: 'colorA', type: 'vec3' },
      { name: 'colorB', type: 'vec3' },
      { name: 'factor', type: 'float' },
    ],
    outputs: [{ name: 'result', type: 'vec3' }],
    parameters: [],
    glslFunction: 'vec3 result = mix(colorA, colorB, factor);',
  },

  // ===== VECTOR OPERATIONS =====
  vec3_construct: {
    id: 'vec3_construct',
    label: 'Vec3',
    description: 'Construye un vector 3D',
    category: 'vector',
    color: '#06b6d4',
    inputs: [
      { name: 'x', type: 'float' },
      { name: 'y', type: 'float' },
      { name: 'z', type: 'float' },
    ],
    outputs: [{ name: 'vec', type: 'vec3' }],
    parameters: [],
    glslFunction: 'vec3 vec = vec3(x, y, z);',
  },

  vec2_to_vec3: {
    id: 'vec2_to_vec3',
    label: 'Vec2→Vec3',
    description: 'Convierte vec2 a vec3 (añade componente Z)',
    category: 'vector',
    color: '#06b6d4',
    inputs: [{ name: 'vec2', type: 'vec2' }],
    outputs: [{ name: 'vec3', type: 'vec3' }],
    parameters: [
      {
        name: 'z',
        label: 'Z',
        type: 'float',
        default: 0.0,
        min: -10,
        max: 10,
        step: 0.1,
        description: 'Componente Z del vector',
      },
    ],
    glslFunction: 'vec3 vec3 = vec3(vec2, {z});',
  },

  length: {
    id: 'length',
    label: 'Length',
    description: 'Calcula la magnitud de un vector',
    category: 'vector',
    color: '#06b6d4',
    inputs: [{ name: 'vector', type: 'vec3' }],
    outputs: [{ name: 'length', type: 'float' }],
    parameters: [],
    glslFunction: 'float length = length(vector);',
  },

  normalize: {
    id: 'normalize',
    label: 'Normalize',
    description: 'Normaliza un vector',
    category: 'vector',
    color: '#06b6d4',
    inputs: [{ name: 'vector', type: 'vec3' }],
    outputs: [{ name: 'normalized', type: 'vec3' }],
    parameters: [],
    glslFunction: 'vec3 normalized = normalize(vector);',
  },

  // ===== SDF & PRIMITIVES =====
  sdf_sphere: {
    id: 'sdf_sphere',
    label: 'SDF Sphere',
    description: 'Función de distancia signada: esfera',
    category: 'utility',
    color: '#10b981',
    inputs: [
      { name: 'point', type: 'vec3' },
      { name: 'radius', type: 'float' },
    ],
    outputs: [{ name: 'distance', type: 'float' }],
    parameters: [],
    glslFunction: 'float distance = length(point) - radius;',
  },

  sdf_box: {
    id: 'sdf_box',
    label: 'SDF Box',
    description: 'Función de distancia signada: caja',
    category: 'utility',
    color: '#10b981',
    inputs: [
      { name: 'point', type: 'vec3' },
      { name: 'size', type: 'vec3' },
    ],
    outputs: [{ name: 'distance', type: 'float' }],
    parameters: [],
    glslFunction: 'vec3 q = abs(point) - size; float distance = length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);',
  },

  sdf_torus: {
    id: 'sdf_torus',
    label: 'SDF Torus',
    description: 'Función de distancia signada: toro',
    category: 'utility',
    color: '#10b981',
    inputs: [
      { name: 'point', type: 'vec3' },
      { name: 'majorRadius', type: 'float' },
      { name: 'minorRadius', type: 'float' },
    ],
    outputs: [{ name: 'distance', type: 'float' }],
    parameters: [],
    glslFunction: 'float distance = length(vec2(length(point.xz) - {majorRadius}, point.y)) - {minorRadius};',
  },

  // ===== OUTPUT =====
  fragment_output: {
    id: 'fragment_output',
    label: 'Fragment Output',
    description: 'Color final del shader',
    category: 'output',
    color: '#00ff88',
    inputs: [{ name: 'color', type: 'vec3' }],
    outputs: [],
    parameters: [],
    glslFunction: 'fragColor = vec4(color, 1.0);',
  },
}

// Combinar todos los nodos en un único objeto
export const NODE_DEFINITIONS: Record<string, NodeDefinition> = {
  ...BASE_NODE_DEFINITIONS,
  ...MATH_NODES,
  ...VECTOR_NODES,
  ...CONVERSION_NODES,
  ...CUSTOM_NODES,
}

// Tipos de datos para validación
export const TYPE_COLORS: Record<string, string> = {
  float: '#fbbf24',
  int: '#34d399',
  vec2: '#06b6d4',
  vec3: '#3b82f6',
  vec4: '#8b5cf6',
  color: '#f97316',
}
