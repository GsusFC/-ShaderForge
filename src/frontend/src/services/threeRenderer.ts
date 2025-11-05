import * as THREE from 'three'
import { ShaderUniform } from '../types/shaderTypes'

export interface RendererOptions {
  canvas?: HTMLCanvasElement
  width?: number
  height?: number
  pixelRatio?: number
  antialias?: boolean
}

export interface ShaderOptions {
  vertexShader: string
  fragmentShader: string
  uniforms?: Record<string, any>
}

/**
 * ThreeRenderer - Manages WebGL rendering with Three.js
 */
export class ThreeRenderer {
  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.OrthographicCamera
  private mesh: THREE.Mesh | null = null
  private material: THREE.ShaderMaterial | null = null
  private startTime: number
  private isAnimating: boolean = false
  private animationFrameId: number | null = null
  private mousePosition: THREE.Vector2

  constructor(options: RendererOptions = {}) {
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: options.canvas,
      antialias: options.antialias !== false,
      alpha: true,
      powerPreference: 'high-performance',
    })

    const width = options.width || window.innerWidth
    const height = options.height || window.innerHeight
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(options.pixelRatio || window.devicePixelRatio)

    // Create scene
    this.scene = new THREE.Scene()

    // Create orthographic camera for fullscreen quad
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    // Initialize timing
    this.startTime = Date.now()

    // Initialize mouse position
    this.mousePosition = new THREE.Vector2(0, 0)

    // Setup mouse tracking
    this.setupMouseTracking()
  }

  /**
   * Setup mouse position tracking
   */
  private setupMouseTracking() {
    if (this.renderer.domElement) {
      this.renderer.domElement.addEventListener('mousemove', (event) => {
        const canvas = this.renderer.domElement
        const rect = canvas.getBoundingClientRect()
        this.mousePosition.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
        this.mousePosition.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      })
    }
  }

  /**
   * Create default vertex shader
   */
  private getDefaultVertexShader(): string {
    return `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `
  }

  /**
   * Create default uniforms
   */
  private createDefaultUniforms(): Record<string, THREE.IUniform> {
    return {
      iTime: { value: 0.0 },
      iResolution: { value: new THREE.Vector2(
        this.renderer.domElement.width,
        this.renderer.domElement.height
      )},
      iMouse: { value: new THREE.Vector2(0, 0) },
    }
  }

  /**
   * Parse and convert shader uniforms to Three.js format
   */
  private parseUniforms(uniforms?: ShaderUniform[]): Record<string, THREE.IUniform> {
    const threeUniforms: Record<string, THREE.IUniform> = this.createDefaultUniforms()

    if (!uniforms) return threeUniforms

    for (const uniform of uniforms) {
      // Skip built-in uniforms (already added)
      if (['iTime', 'iResolution', 'iMouse'].includes(uniform.name)) {
        continue
      }

      // Convert uniform type to Three.js value
      let value: any
      switch (uniform.type) {
        case 'float':
          value = uniform.value ?? 0.0
          break
        case 'vec2':
          value = new THREE.Vector2(
            uniform.value?.[0] ?? 0,
            uniform.value?.[1] ?? 0
          )
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
        case 'sampler2D':
          value = null // Textures need to be loaded separately
          break
        default:
          value = uniform.value ?? 0.0
      }

      threeUniforms[uniform.name] = { value }
    }

    return threeUniforms
  }

  /**
   * Load shader and create material
   */
  loadShader(options: ShaderOptions) {
    const vertexShader = options.vertexShader || this.getDefaultVertexShader()
    const fragmentShader = options.fragmentShader

    // Parse uniforms from options
    const uniforms = options.uniforms
      ? this.parseUniforms(options.uniforms as ShaderUniform[])
      : this.createDefaultUniforms()

    // Create shader material
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      side: THREE.DoubleSide,
    })

    // Create fullscreen quad geometry
    const geometry = new THREE.PlaneGeometry(2, 2)

    // Remove old mesh if exists
    if (this.mesh) {
      this.scene.remove(this.mesh)
      this.mesh.geometry.dispose()
      if (this.mesh.material instanceof THREE.Material) {
        this.mesh.material.dispose()
      }
    }

    // Create new mesh
    this.mesh = new THREE.Mesh(geometry, this.material)
    this.scene.add(this.mesh)

    // Reset start time
    this.startTime = Date.now()
  }

  /**
   * Update uniforms during animation
   */
  private updateUniforms() {
    if (!this.material || !this.material.uniforms) return

    // Update iTime
    if (this.material.uniforms.iTime) {
      const elapsedTime = (Date.now() - this.startTime) / 1000
      this.material.uniforms.iTime.value = elapsedTime
    }

    // Update iResolution
    if (this.material.uniforms.iResolution) {
      const canvas = this.renderer.domElement
      this.material.uniforms.iResolution.value.set(canvas.width, canvas.height)
    }

    // Update iMouse
    if (this.material.uniforms.iMouse) {
      // Convert normalized device coordinates to pixel coordinates
      const canvas = this.renderer.domElement
      const mouseX = (this.mousePosition.x + 1) * 0.5 * canvas.width
      const mouseY = (1 - this.mousePosition.y) * 0.5 * canvas.height
      this.material.uniforms.iMouse.value.set(mouseX, mouseY)
    }
  }

  /**
   * Start animation loop
   */
  start() {
    if (this.isAnimating) return

    this.isAnimating = true
    this.startTime = Date.now()

    const animate = () => {
      if (!this.isAnimating) return

      this.updateUniforms()
      this.renderer.render(this.scene, this.camera)

      this.animationFrameId = requestAnimationFrame(animate)
    }

    animate()
  }

  /**
   * Stop animation loop
   */
  stop() {
    this.isAnimating = false
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  /**
   * Resize renderer
   */
  resize(width: number, height: number) {
    this.renderer.setSize(width, height)

    if (this.material && this.material.uniforms.iResolution) {
      this.material.uniforms.iResolution.value.set(width, height)
    }
  }

  /**
   * Get renderer instance
   */
  getRenderer(): THREE.WebGLRenderer {
    return this.renderer
  }

  /**
   * Get canvas element
   */
  getCanvas(): HTMLCanvasElement {
    return this.renderer.domElement
  }

  /**
   * Dispose resources
   */
  dispose() {
    this.stop()

    if (this.mesh) {
      this.scene.remove(this.mesh)
      this.mesh.geometry.dispose()
      if (this.mesh.material instanceof THREE.Material) {
        this.mesh.material.dispose()
      }
    }

    this.renderer.dispose()
  }
}
