import { NodeParameter } from '../../types/nodes'
import './ParameterEditor.css'

interface ParameterEditorProps {
  parameter: NodeParameter
  value: any
  onChange: (value: any) => void
}

export default function ParameterEditor({ parameter, value, onChange }: ParameterEditorProps) {
  const handleChange = (newValue: any) => {
    onChange(newValue)
  }

  switch (parameter.type) {
    case 'float':
      return (
        <div className="parameter-editor">
          <label className="param-label">{parameter.label}</label>
          <div className="param-slider-group">
            <input
              type="range"
              min={parameter.min ?? -100}
              max={parameter.max ?? 100}
              step={parameter.step ?? 0.1}
              value={value ?? parameter.default}
              onChange={(e) => handleChange(parseFloat(e.target.value))}
              className="param-slider"
              title={parameter.description}
            />
            <input
              type="number"
              min={parameter.min ?? -100}
              max={parameter.max ?? 100}
              step={parameter.step ?? 0.1}
              value={value ?? parameter.default}
              onChange={(e) => handleChange(parseFloat(e.target.value))}
              className="param-number"
              title={parameter.description}
            />
          </div>
        </div>
      )

    case 'int':
      return (
        <div className="parameter-editor">
          <label className="param-label">{parameter.label}</label>
          <div className="param-slider-group">
            <input
              type="range"
              min={parameter.min ?? 0}
              max={parameter.max ?? 10}
              step={1}
              value={value ?? parameter.default}
              onChange={(e) => handleChange(parseInt(e.target.value))}
              className="param-slider"
              title={parameter.description}
            />
            <input
              type="number"
              min={parameter.min ?? 0}
              max={parameter.max ?? 10}
              step={1}
              value={value ?? parameter.default}
              onChange={(e) => handleChange(parseInt(e.target.value))}
              className="param-number"
              title={parameter.description}
            />
          </div>
        </div>
      )

    case 'color':
      return (
        <div className="parameter-editor">
          <label className="param-label">{parameter.label}</label>
          <div className="param-color-group">
            <input
              type="color"
              value={value ?? parameter.default}
              onChange={(e) => handleChange(e.target.value)}
              className="param-color-input"
              title={parameter.description}
            />
            <span className="param-color-value">{value ?? parameter.default}</span>
          </div>
        </div>
      )

    case 'select':
      return (
        <div className="parameter-editor">
          <label className="param-label">{parameter.label}</label>
          <select
            value={value ?? parameter.default}
            onChange={(e) => handleChange(e.target.value)}
            className="param-select"
            title={parameter.description}
          >
            {parameter.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )

    case 'text':
      return (
        <div className="parameter-editor">
          <label className="param-label">{parameter.label}</label>
          <textarea
            value={value ?? parameter.default}
            onChange={(e) => handleChange(e.target.value)}
            className="param-textarea"
            rows={4}
            placeholder={parameter.description}
            style={{
              width: '100%',
              fontFamily: 'monospace',
              fontSize: '11px',
              padding: '4px',
              resize: 'vertical',
              backgroundColor: '#1a1a1a',
              color: '#e0e0e0',
              border: '1px solid #444',
              borderRadius: '3px',
            }}
          />
        </div>
      )

    default:
      return null
  }
}
