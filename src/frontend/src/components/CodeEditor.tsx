import { useRef, useState } from 'react'
import Editor from '@monaco-editor/react'
import { Code2, Maximize2, Copy, Check } from 'lucide-react'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
  height?: string
}

export default function CodeEditor({ value, onChange, readOnly = false, height = '100%' }: CodeEditorProps) {
  const editorRef = useRef<any>(null)
  const [copied, setCopied] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor

    // Configure GLSL language support
    monaco.languages.register({ id: 'glsl' })

    // Define GLSL syntax highlighting
    monaco.languages.setMonarchTokensProvider('glsl', {
      keywords: [
        'attribute', 'const', 'uniform', 'varying',
        'break', 'continue', 'do', 'for', 'while',
        'if', 'else', 'switch', 'case', 'default',
        'in', 'out', 'inout',
        'true', 'false', 'discard', 'return',
        'lowp', 'mediump', 'highp', 'precision',
        'invariant', 'struct', 'void'
      ],
      typeKeywords: [
        'float', 'int', 'bool', 'vec2', 'vec3', 'vec4',
        'bvec2', 'bvec3', 'bvec4', 'ivec2', 'ivec3', 'ivec4',
        'mat2', 'mat3', 'mat4', 'sampler2D', 'samplerCube'
      ],
      builtins: [
        'radians', 'degrees', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
        'pow', 'exp', 'log', 'exp2', 'log2', 'sqrt', 'inversesqrt',
        'abs', 'sign', 'floor', 'ceil', 'fract', 'mod', 'min', 'max', 'clamp',
        'mix', 'step', 'smoothstep', 'length', 'distance', 'dot', 'cross',
        'normalize', 'faceforward', 'reflect', 'refract',
        'texture2D', 'textureCube', 'texture2DProj', 'texture2DLod',
        'dFdx', 'dFdy', 'fwidth', 'noise1', 'noise2', 'noise3', 'noise4',
        'matrixCompMult', 'lessThan', 'lessThanEqual', 'greaterThan',
        'greaterThanEqual', 'equal', 'notEqual', 'any', 'all', 'not'
      ],
      operators: [
        '=', '>', '<', '!', '~', '?', ':',
        '==', '<=', '>=', '!=', '&&', '||', '++', '--',
        '+', '-', '*', '/', '&', '|', '^', '%', '<<',
        '>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=',
        '^=', '%=', '<<=', '>>=', '>>>='
      ],
      symbols: /[=><!~?:&|+\-*\/\^%]+/,
      tokenizer: {
        root: [
          [/[a-z_$][\w$]*/, {
            cases: {
              '@keywords': 'keyword',
              '@typeKeywords': 'type',
              '@builtins': 'predefined',
              '@default': 'identifier'
            }
          }],
          [/[A-Z][\w\$]*/, 'type.identifier'],
          { include: '@whitespace' },
          [/[{}()\[\]]/, '@brackets'],
          [/[<>](?!@symbols)/, '@brackets'],
          [/@symbols/, {
            cases: {
              '@operators': 'operator',
              '@default': ''
            }
          }],
          [/\d*\.\d+([eE][\-+]?\d+)?[fF]?/, 'number.float'],
          [/\d+[fF]/, 'number.float'],
          [/\d+/, 'number'],
          [/[;,.]/, 'delimiter'],
          [/"([^"\\]|\\.)*$/, 'string.invalid'],
          [/"/, 'string', '@string']
        ],
        whitespace: [
          [/[ \t\r\n]+/, 'white'],
          [/\/\*/, 'comment', '@comment'],
          [/\/\/.*$/, 'comment']
        ],
        comment: [
          [/[^\/*]+/, 'comment'],
          [/\*\//, 'comment', '@pop'],
          [/[\/*]/, 'comment']
        ],
        string: [
          [/[^\\"]+/, 'string'],
          [/\\./, 'string.escape'],
          [/"/, 'string', '@pop']
        ]
      }
    })

    // Set GLSL-specific editor configurations
    editor.updateOptions({
      fontSize: 13,
      fontFamily: '"Fira Code", "Monaco", "Menlo", monospace',
      fontLigatures: true,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      wordWrap: 'off',
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
      renderWhitespace: 'selection',
      bracketPairColorization: { enabled: true }
    })
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <div
      className={`code-editor-container ${isFullscreen ? 'fullscreen' : ''}`}
      style={{
        height,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#1e1e1e',
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : 'auto',
        left: isFullscreen ? 0 : 'auto',
        right: isFullscreen ? 0 : 'auto',
        bottom: isFullscreen ? 0 : 'auto',
        zIndex: isFullscreen ? 9999 : 'auto'
      }}
    >
      {/* Editor Header */}
      <div style={{
        padding: '8px 12px',
        borderBottom: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#252525'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Code2 size={16} style={{ color: '#00ff88' }} />
          <span style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#e5e5e5',
            fontFamily: 'monospace'
          }}>
            GLSL Shader Code
          </span>
          {readOnly && (
            <span style={{
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '3px',
              backgroundColor: 'rgba(255, 165, 0, 0.2)',
              color: '#ffa500',
              fontFamily: 'monospace'
            }}>
              READ-ONLY
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={handleCopy}
            style={{
              padding: '4px 8px',
              fontSize: '11px',
              backgroundColor: copied ? '#00ff88' : '#333',
              color: copied ? '#0a0a0a' : '#e5e5e5',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontFamily: 'monospace',
              transition: 'all 0.2s'
            }}
            title="Copiar código"
          >
            {copied ? (
              <>
                <Check size={12} />
                Copiado
              </>
            ) : (
              <>
                <Copy size={12} />
                Copiar
              </>
            )}
          </button>
          <button
            onClick={toggleFullscreen}
            style={{
              padding: '4px 8px',
              fontSize: '11px',
              backgroundColor: '#333',
              color: '#e5e5e5',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontFamily: 'monospace'
            }}
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            <Maximize2 size={12} />
            {isFullscreen ? 'Salir' : 'Expandir'}
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Editor
          height="100%"
          defaultLanguage="glsl"
          language="glsl"
          theme="vs-dark"
          value={value}
          onChange={(newValue) => onChange(newValue || '')}
          onMount={handleEditorDidMount}
          options={{
            readOnly,
            minimap: { enabled: !isFullscreen },
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
              useShadows: true,
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10
            }
          }}
          loading={
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              backgroundColor: '#1e1e1e',
              color: '#888'
            }}>
              <div>Cargando editor...</div>
            </div>
          }
        />
      </div>
    </div>
  )
}
