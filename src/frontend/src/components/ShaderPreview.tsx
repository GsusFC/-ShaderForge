import { useRef, useState, useEffect, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RotateCcw, AlertCircle } from 'lucide-react'
import { transformShaderToStandardGLSL } from '../services/shaderCompiler'
import '../styles/ShaderPreview.css'

interface ShaderPreviewProps {
  shaderCode?: string
  uniforms?: any[]
}

// Default fallback shader (simple gradient)
const DEFAULT_FRAGMENT_SHADER = `
precision highp float;

uniform vec2 iResolution;
uniform float iTime;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  vec3 color = vec3(uv.x, uv.y, 0.5 + 0.5 * sin(iTime));
  gl_FragColor = vec4(color, 1.0);
}
`

const DEFAULT_VERTEX_SHADER = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`

interface ShaderMeshProps {
  fragmentShader: string
  uniforms?: any[]
  onError: (error: string) => void
  onSuccess: () => void
}

function ShaderMesh({ fragmentShader, uniforms, onError, onSuccess }: ShaderMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  // Transform and create shader material with uniforms
  const shaderMaterial = useMemo(() => {
    try {
      // Transform Shadertoy-style code to standard GLSL
      const transformedShader = transformShaderToStandardGLSL(fragmentShader || DEFAULT_FRAGMENT_SHADER)

      // Create base uniforms
      const baseUniforms: Record<string, THREE.IUniform> = {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2(800, 600) },
        iMouse: { value: new THREE.Vector2(0, 0) },
      }

      // Add custom uniforms from compilation
      if (uniforms && Array.isArray(uniforms)) {
        for (const uniform of uniforms) {
          // Skip built-in uniforms
          if (['iTime', 'iResolution', 'iMouse'].includes(uniform.name)) {
            continue
          }

          // Add custom uniform
          let value: any
          switch (uniform.type) {
            case 'float':
              value = uniform.value ?? 0.0
              break
            case 'vec2':
              value = new THREE.Vector2(uniform.value?.[0] ?? 0, uniform.value?.[1] ?? 0)
              break
            case 'vec3':
              value = new THREE.Vector3(
                uniform.value?.[0] ?? 0,
                uniform.value?.[1] ?? 0,
                uniform.value?.[2] ?? 0
              )
              break
            case 'vec4':
              value = new THREE.Vector4(
                uniform.value?.[0] ?? 0,
                uniform.value?.[1] ?? 0,
                uniform.value?.[2] ?? 0,
                uniform.value?.[3] ?? 1
              )
              break
            default:
              value = uniform.value ?? 0.0
          }
          baseUniforms[uniform.name] = { value }
        }
      }

      const material = new THREE.ShaderMaterial({
        vertexShader: DEFAULT_VERTEX_SHADER,
        fragmentShader: transformedShader,
        uniforms: baseUniforms,
        side: THREE.DoubleSide,
      })

      onSuccess()
      return material
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Shader compilation failed')
      return new THREE.ShaderMaterial({
        vertexShader: DEFAULT_VERTEX_SHADER,
        fragmentShader: DEFAULT_FRAGMENT_SHADER,
        uniforms: {
          iTime: { value: 0 },
          iResolution: { value: new THREE.Vector2(800, 600) },
          iMouse: { value: new THREE.Vector2(0, 0) },
        },
      })
    }
  }, [fragmentShader, uniforms, onError, onSuccess])

  // Animate uniforms
  useFrame((state) => {
    if (meshRef.current && shaderMaterial.uniforms) {
      const newTime = state.clock.getElapsedTime()
      shaderMaterial.uniforms.iTime.value = newTime

      // Update resolution
      const size = state.size
      shaderMaterial.uniforms.iResolution.value.set(size.width, size.height)

      // Update mouse position (normalized)
      if (state.mouse) {
        shaderMaterial.uniforms.iMouse.value.set(
          (state.mouse.x + 1) * 0.5,
          (state.mouse.y + 1) * 0.5
        )
      }
    }
  })

  return (
    <mesh ref={meshRef} material={shaderMaterial}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  )
}

export default function ShaderPreview({ shaderCode, uniforms }: ShaderPreviewProps) {
  const [error, setError] = useState<string | null>(null)
  const [fps, setFps] = useState(60)
  const [lastFrameTime, setLastFrameTime] = useState(Date.now())
  const frameCountRef = useRef(0)
  const fpsIntervalRef = useRef<ReturnType<typeof setInterval>>()

  // Calculate FPS
  useEffect(() => {
    fpsIntervalRef.current = setInterval(() => {
      const now = Date.now()
      const delta = (now - lastFrameTime) / 1000
      const currentFps = Math.round(frameCountRef.current / delta)
      setFps(currentFps)
      frameCountRef.current = 0
      setLastFrameTime(now)
    }, 1000)

    return () => {
      if (fpsIntervalRef.current) {
        clearInterval(fpsIntervalRef.current)
      }
    }
  }, [lastFrameTime])

  const handleError = (errorMsg: string) => {
    setError(errorMsg)
  }

  const handleSuccess = () => {
    setError(null)
  }

  const handleReset = () => {
    setError(null)
  }

  const hasShaderCode = shaderCode && shaderCode.trim().length > 0

  return (
    <div className="shader-preview">
      {/* Header */}
      <div className="preview-header">
        <div className="preview-info">
          <span className="preview-title">Shader Preview</span>
          <span className="preview-fps">{fps} FPS</span>
        </div>
        <button className="reset-btn" onClick={handleReset} title="Resetear cámara">
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Canvas Container */}
      <div className="preview-container">
        {hasShaderCode ? (
          <Canvas
            orthographic
            camera={{ position: [0, 0, 1], zoom: 1 }}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: 'high-performance'
            }}
            onCreated={() => {
              frameCountRef.current = 0
              setLastFrameTime(Date.now())
            }}
            onPointerMissed={() => frameCountRef.current++}
          >
            <color attach="background" args={['#000000']} />

            {/* Shader Mesh - Fullscreen Quad */}
            <ShaderMesh
              fragmentShader={shaderCode}
              uniforms={uniforms}
              onError={handleError}
              onSuccess={handleSuccess}
            />
          </Canvas>
        ) : (
          <div className="shader-preview-placeholder">
            <div className="placeholder-content">
              <p>No shader compiled yet</p>
              <p className="hint">Agrega nodos y presiona "Compilar"</p>
            </div>
          </div>
        )}

        {/* Error Overlay */}
        {error && (
          <div className="preview-error">
            <div className="error-content">
              <AlertCircle className="error-icon" size={20} />
              <div>
                <h4 className="error-title">Shader Error</h4>
                <p className="error-message">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="preview-footer">
        <p className="preview-hint">
          {hasShaderCode
            ? 'Arrastra para rotar • Scroll para zoom'
            : 'Esperando código shader...'}
        </p>
      </div>
    </div>
  )
}
