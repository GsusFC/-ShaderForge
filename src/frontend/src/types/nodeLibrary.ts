// ===== BIBLIOTECA COMPLETA DE NODOS MATEMÁTICOS =====

import { NodeDefinition } from './nodeDefinitions'

export const MATH_NODES: Record<string, NodeDefinition> = {
  sin: {
    id: 'sin',
    label: 'Sin',
    description: 'Función seno',
    category: 'operation',
    color: '#8b5cf6',
    inputs: [{ name: 'value', type: 'float' }],
    outputs: [{ name: 'result', type: 'float' }],
    parameters: [],
    glslFunction: 'float result = sin(value);',
  },

  cos: {
    id: 'cos',
    label: 'Cos',
    description: 'Función coseno',
    category: 'operation',
    color: '#8b5cf6',
    inputs: [{ name: 'value', type: 'float' }],
    outputs: [{ name: 'result', type: 'float' }],
    parameters: [],
    glslFunction: 'float result = cos(value);',
  },

  tan: {
    id: 'tan',
    label: 'Tan',
    description: 'Función tangente',
    category: 'operation',
    color: '#8b5cf6',
    inputs: [{ name: 'value', type: 'float' }],
    outputs: [{ name: 'result', type: 'float' }],
    parameters: [],
    glslFunction: 'float result = tan(value);',
  },

  pow: {
    id: 'pow',
    label: 'Power',
    description: 'Eleva base a exponente',
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

  sqrt: {
    id: 'sqrt',
    label: 'Sqrt',
    description: 'Raíz cuadrada',
    category: 'operation',
    color: '#8b5cf6',
    inputs: [{ name: 'value', type: 'float' }],
    outputs: [{ name: 'result', type: 'float' }],
    parameters: [],
    glslFunction: 'float result = sqrt(value);',
  },

  abs: {
    id: 'abs',
    label: 'Abs',
    description: 'Valor absoluto',
    category: 'operation',
    color: '#8b5cf6',
    inputs: [{ name: 'value', type: 'float' }],
    outputs: [{ name: 'result', type: 'float' }],
    parameters: [],
    glslFunction: 'float result = abs(value);',
  },

  floor: {
    id: 'floor',
    label: 'Floor',
    description: 'Redondeo hacia abajo',
    category: 'operation',
    color: '#8b5cf6',
    inputs: [{ name: 'value', type: 'float' }],
    outputs: [{ name: 'result', type: 'float' }],
    parameters: [],
    glslFunction: 'float result = floor(value);',
  },

  ceil: {
    id: 'ceil',
    label: 'Ceil',
    description: 'Redondeo hacia arriba',
    category: 'operation',
    color: '#8b5cf6',
    inputs: [{ name: 'value', type: 'float' }],
    outputs: [{ name: 'result', type: 'float' }],
    parameters: [],
    glslFunction: 'float result = ceil(value);',
  },

  fract: {
    id: 'fract',
    label: 'Fract',
    description: 'Parte fraccional',
    category: 'operation',
    color: '#8b5cf6',
    inputs: [{ name: 'value', type: 'float' }],
    outputs: [{ name: 'result', type: 'float' }],
    parameters: [],
    glslFunction: 'float result = fract(value);',
  },

  mod: {
    id: 'mod',
    label: 'Mod',
    description: 'Módulo (resto de división)',
    category: 'operation',
    color: '#8b5cf6',
    inputs: [
      { name: 'value', type: 'float' },
      { name: 'divisor', type: 'float' },
    ],
    outputs: [{ name: 'result', type: 'float' }],
    parameters: [],
    glslFunction: 'float result = mod(value, divisor);',
  },

  min: {
    id: 'min',
    label: 'Min',
    description: 'Mínimo de dos valores',
    category: 'operation',
    color: '#8b5cf6',
    inputs: [
      { name: 'a', type: 'float' },
      { name: 'b', type: 'float' },
    ],
    outputs: [{ name: 'result', type: 'float' }],
    parameters: [],
    glslFunction: 'float result = min(a, b);',
  },

  max: {
    id: 'max',
    label: 'Max',
    description: 'Máximo de dos valores',
    category: 'operation',
    color: '#8b5cf6',
    inputs: [
      { name: 'a', type: 'float' },
      { name: 'b', type: 'float' },
    ],
    outputs: [{ name: 'result', type: 'float' }],
    parameters: [],
    glslFunction: 'float result = max(a, b);',
  },

  subtract: {
    id: 'subtract',
    label: 'Subtract',
    description: 'Resta dos valores',
    category: 'operation',
    color: '#8b5cf6',
    inputs: [
      { name: 'a', type: 'float' },
      { name: 'b', type: 'float' },
    ],
    outputs: [{ name: 'result', type: 'float' }],
    parameters: [],
    glslFunction: 'float result = a - b;',
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

  negate: {
    id: 'negate',
    label: 'Negate',
    description: 'Niega un valor',
    category: 'operation',
    color: '#8b5cf6',
    inputs: [{ name: 'value', type: 'float' }],
    outputs: [{ name: 'result', type: 'float' }],
    parameters: [],
    glslFunction: 'float result = -value;',
  },

  smoothstep: {
    id: 'smoothstep',
    label: 'Smoothstep',
    description: 'Interpolación suave',
    category: 'operation',
    color: '#8b5cf6',
    inputs: [
      { name: 'edge0', type: 'float' },
      { name: 'edge1', type: 'float' },
      { name: 'x', type: 'float' },
    ],
    outputs: [{ name: 'result', type: 'float' }],
    parameters: [],
    glslFunction: 'float result = smoothstep(edge0, edge1, x);',
  },

  step: {
    id: 'step',
    label: 'Step',
    description: 'Función escalón',
    category: 'operation',
    color: '#8b5cf6',
    inputs: [
      { name: 'edge', type: 'float' },
      { name: 'x', type: 'float' },
    ],
    outputs: [{ name: 'result', type: 'float' }],
    parameters: [],
    glslFunction: 'float result = step(edge, x);',
  },

  sign: {
    id: 'sign',
    label: 'Sign',
    description: 'Signo de un valor (-1, 0, 1)',
    category: 'operation',
    color: '#8b5cf6',
    inputs: [{ name: 'value', type: 'float' }],
    outputs: [{ name: 'result', type: 'float' }],
    parameters: [],
    glslFunction: 'float result = sign(value);',
  },
}

export const VECTOR_NODES: Record<string, NodeDefinition> = {
  dot: {
    id: 'dot',
    label: 'Dot',
    description: 'Producto punto de vectores',
    category: 'vector',
    color: '#06b6d4',
    inputs: [
      { name: 'a', type: 'vec3' },
      { name: 'b', type: 'vec3' },
    ],
    outputs: [{ name: 'result', type: 'float' }],
    parameters: [],
    glslFunction: 'float result = dot(a, b);',
  },

  cross: {
    id: 'cross',
    label: 'Cross',
    description: 'Producto cruz de vectores',
    category: 'vector',
    color: '#06b6d4',
    inputs: [
      { name: 'a', type: 'vec3' },
      { name: 'b', type: 'vec3' },
    ],
    outputs: [{ name: 'result', type: 'vec3' }],
    parameters: [],
    glslFunction: 'vec3 result = cross(a, b);',
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

  distance: {
    id: 'distance',
    label: 'Distance',
    description: 'Distancia entre dos puntos',
    category: 'vector',
    color: '#06b6d4',
    inputs: [
      { name: 'a', type: 'vec3' },
      { name: 'b', type: 'vec3' },
    ],
    outputs: [{ name: 'dist', type: 'float' }],
    parameters: [],
    glslFunction: 'float dist = distance(a, b);',
  },

  reflect: {
    id: 'reflect',
    label: 'Reflect',
    description: 'Refleja un vector',
    category: 'vector',
    color: '#06b6d4',
    inputs: [
      { name: 'incident', type: 'vec3' },
      { name: 'normal', type: 'vec3' },
    ],
    outputs: [{ name: 'reflected', type: 'vec3' }],
    parameters: [],
    glslFunction: 'vec3 reflected = reflect(incident, normal);',
  },

  vec2_construct: {
    id: 'vec2_construct',
    label: 'Vec2',
    description: 'Construye un vec2',
    category: 'vector',
    color: '#06b6d4',
    inputs: [
      { name: 'x', type: 'float' },
      { name: 'y', type: 'float' },
    ],
    outputs: [{ name: 'vec', type: 'vec2' }],
    parameters: [],
    glslFunction: 'vec2 vec = vec2(x, y);',
  },

  vec4_construct: {
    id: 'vec4_construct',
    label: 'Vec4',
    description: 'Construye un vec4',
    category: 'vector',
    color: '#06b6d4',
    inputs: [
      { name: 'x', type: 'float' },
      { name: 'y', type: 'float' },
      { name: 'z', type: 'float' },
      { name: 'w', type: 'float' },
    ],
    outputs: [{ name: 'vec', type: 'vec4' }],
    parameters: [],
    glslFunction: 'vec4 vec = vec4(x, y, z, w);',
  },
}

export const CONVERSION_NODES: Record<string, NodeDefinition> = {
  float_to_vec2: {
    id: 'float_to_vec2',
    label: 'Float→Vec2',
    description: 'Convierte float a vec2',
    category: 'utility',
    color: '#ec4899',
    inputs: [{ name: 'value', type: 'float' }],
    outputs: [{ name: 'vec', type: 'vec2' }],
    parameters: [],
    glslFunction: 'vec2 vec = vec2(value);',
  },

  float_to_vec3: {
    id: 'float_to_vec3',
    label: 'Float→Vec3',
    description: 'Convierte float a vec3',
    category: 'utility',
    color: '#ec4899',
    inputs: [{ name: 'value', type: 'float' }],
    outputs: [{ name: 'vec', type: 'vec3' }],
    parameters: [],
    glslFunction: 'vec3 vec = vec3(value);',
  },

  float_to_vec4: {
    id: 'float_to_vec4',
    label: 'Float→Vec4',
    description: 'Convierte float a vec4',
    category: 'utility',
    color: '#ec4899',
    inputs: [{ name: 'value', type: 'float' }],
    outputs: [{ name: 'vec', type: 'vec4' }],
    parameters: [],
    glslFunction: 'vec4 vec = vec4(value);',
  },

  vec3_to_vec4: {
    id: 'vec3_to_vec4',
    label: 'Vec3→Vec4',
    description: 'Convierte vec3 a vec4 (añade W)',
    category: 'utility',
    color: '#ec4899',
    inputs: [{ name: 'vec3', type: 'vec3' }],
    outputs: [{ name: 'vec4', type: 'vec4' }],
    parameters: [
      {
        name: 'w',
        label: 'W',
        type: 'float',
        default: 1.0,
        min: 0,
        max: 1,
        step: 0.1,
      },
    ],
    glslFunction: 'vec4 vec4 = vec4(vec3, {w});',
  },

  split_vec2: {
    id: 'split_vec2',
    label: 'Split Vec2',
    description: 'Extrae componente de vec2',
    category: 'utility',
    color: '#ec4899',
    inputs: [{ name: 'vector', type: 'vec2' }],
    outputs: [{ name: 'component', type: 'float' }],
    parameters: [
      {
        name: 'component',
        label: 'Component',
        type: 'select',
        default: 'x',
        options: [
          { label: 'X', value: 'x' },
          { label: 'Y', value: 'y' },
        ],
      },
    ],
    glslFunction: 'float component = vector.{component};',
  },

  split_vec3: {
    id: 'split_vec3',
    label: 'Split Vec3',
    description: 'Extrae componente de vec3',
    category: 'utility',
    color: '#ec4899',
    inputs: [{ name: 'vector', type: 'vec3' }],
    outputs: [{ name: 'component', type: 'float' }],
    parameters: [
      {
        name: 'component',
        label: 'Component',
        type: 'select',
        default: 'x',
        options: [
          { label: 'X', value: 'x' },
          { label: 'Y', value: 'y' },
          { label: 'Z', value: 'z' },
        ],
      },
    ],
    glslFunction: 'float component = vector.{component};',
  },

  split_vec4: {
    id: 'split_vec4',
    label: 'Split Vec4',
    description: 'Extrae componente de vec4',
    category: 'utility',
    color: '#ec4899',
    inputs: [{ name: 'vector', type: 'vec4' }],
    outputs: [{ name: 'component', type: 'float' }],
    parameters: [
      {
        name: 'component',
        label: 'Component',
        type: 'select',
        default: 'x',
        options: [
          { label: 'X', value: 'x' },
          { label: 'Y', value: 'y' },
          { label: 'Z', value: 'z' },
          { label: 'W', value: 'w' },
        ],
      },
    ],
    glslFunction: 'float component = vector.{component};',
  },
}
