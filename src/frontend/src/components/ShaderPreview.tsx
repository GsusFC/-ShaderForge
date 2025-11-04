import { useRef, useState, useEffect, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { RotateCcw, AlertCircle } from 'lucide-react'
import '../styles/ShaderPreview.css'

interface ShaderPreviewProps {
  shaderCode?: string
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
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

interface ShaderMeshProps {
  fragmentShader: string
  onError: (error: string) => void
  onSuccess: () => void
}

function ShaderMesh({ fragmentShader, onError, onSuccess }: ShaderMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  // Create shader material with uniforms
  const shaderMaterial = useMemo(() => {
    try {
      const material = new THREE.ShaderMaterial({
        vertexShader: DEFAULT_VERTEX_SHADER,
        fragmentShader: fragmentShader || DEFAULT_FRAGMENT_SHADER,
        uniforms: {
          iTime: { value: 0 },
          iResolution: { value: new THREE.Vector2(800, 600) },
          iMouse: { value: new THREE.Vector2(0, 0) },
        },
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
  }, [fragmentShader, onError, onSuccess])

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
      <sphereGeometry args={[1, 64, 64]} />
    </mesh>
  )
}

export default function ShaderPreview({ shaderCode }: ShaderPreviewProps) {
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
            camera={{ position: [0, 0, 3], fov: 50 }}
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

            {/* Lighting */}
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />

            {/* Shader Mesh */}
            <ShaderMesh
              fragmentShader={shaderCode}
              onError={handleError}
              onSuccess={handleSuccess}
            />

            {/* Camera Controls */}
            <OrbitControls
              enableDamping
              dampingFactor={0.05}
              rotateSpeed={0.5}
              zoomSpeed={0.8}
              minDistance={1.5}
              maxDistance={10}
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
