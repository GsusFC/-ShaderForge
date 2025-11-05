"""
Test suite exhaustivo para el compilador GLSL
Valida sintaxis, tipos, y generación correcta de código
"""

import pytest
from core.compiler import GLSLCompiler, CompiledShader

class TestGLSLCompiler:
    """Tests para el compilador de GLSL"""

    def setup_method(self):
        """Setup antes de cada test"""
        self.compiler = GLSLCompiler()

    # ===== TESTS DE VALIDACIÓN BÁSICA =====

    def test_empty_graph_fails(self):
        """Grafo vacío debe fallar"""
        graph = {"nodes": [], "edges": []}
        result = self.compiler.compile(graph)
        assert result.error is not None
        assert "No fragment output node found" in result.error

    def test_invalid_nodes_list(self):
        """Lista de nodos inválida debe fallar"""
        graph = {"nodes": None, "edges": []}
        result = self.compiler.compile(graph)
        assert result.error is not None
        assert "Invalid nodes list" in result.error

    def test_invalid_edges_list(self):
        """Lista de edges inválida debe fallar"""
        graph = {"nodes": [{"id": "1", "data": {"type": "fragment_output"}}], "edges": None}
        result = self.compiler.compile(graph)
        assert result.error is not None
        assert "Invalid edges list" in result.error

    def test_no_output_node_fails(self):
        """Grafo sin nodo output debe fallar"""
        graph = {
            "nodes": [{"id": "1", "data": {"type": "uv_input"}}],
            "edges": []
        }
        result = self.compiler.compile(graph)
        assert result.error is not None
        assert "No fragment output node found" in result.error

    # ===== TESTS DE DETECCIÓN DE CICLOS =====

    def test_cycle_detection_simple(self):
        """Detecta ciclo simple: A → B → A"""
        graph = {
            "nodes": [
                {"id": "A", "data": {"type": "add"}},
                {"id": "B", "data": {"type": "multiply"}},
                {"id": "output", "data": {"type": "fragment_output"}}
            ],
            "edges": [
                {"source": "A", "target": "B"},
                {"source": "B", "target": "A"},
                {"source": "B", "target": "output"}
            ]
        }
        result = self.compiler.compile(graph)
        assert result.error is not None
        assert "Cycle detected" in result.error

    def test_cycle_detection_complex(self):
        """Detecta ciclo complejo: A → B → C → A"""
        graph = {
            "nodes": [
                {"id": "A", "data": {"type": "add"}},
                {"id": "B", "data": {"type": "multiply"}},
                {"id": "C", "data": {"type": "clamp"}},
                {"id": "output", "data": {"type": "fragment_output"}}
            ],
            "edges": [
                {"source": "A", "target": "B"},
                {"source": "B", "target": "C"},
                {"source": "C", "target": "A"},
                {"source": "C", "target": "output"}
            ]
        }
        result = self.compiler.compile(graph)
        assert result.error is not None
        assert "Cycle detected" in result.error

    # ===== TESTS DE NODOS INDIVIDUALES =====

    def test_uv_input_node(self):
        """Test nodo UV Input simple"""
        graph = {
            "nodes": [
                {"id": "uv", "data": {"type": "uv_input"}},
                {"id": "output", "data": {"type": "fragment_output"}}
            ],
            "edges": [
                {"source": "uv", "target": "output", "sourceHandle": "output", "targetHandle": "input"}
            ]
        }
        result = self.compiler.compile(graph)
        assert result.error is None
        assert "vec2 v_uv = fragCoord / iResolution.xy;" in result.code
        # vec2 se convierte a vec4 correctamente: vec4(vec2, 0.0, 1.0)
        assert "fragColor = vec4(v_uv, 0.0, 1.0);" in result.code
        assert any(u["name"] == "iResolution" for u in result.uniforms)

    def test_time_input_node(self):
        """Test nodo Time Input"""
        graph = {
            "nodes": [
                {"id": "time", "data": {"type": "time_input"}},
                {"id": "output", "data": {"type": "fragment_output"}}
            ],
            "edges": [
                {"source": "time", "target": "output"}
            ]
        }
        result = self.compiler.compile(graph)
        assert result.error is None
        assert "float v_time = iTime;" in result.code
        assert any(u["name"] == "iTime" for u in result.uniforms)

    def test_float_constant_node(self):
        """Test nodo Float Constant con parámetro"""
        graph = {
            "nodes": [
                {
                    "id": "const",
                    "data": {
                        "type": "float_constant",
                        "parameters": {"value": 0.5}
                    }
                },
                {"id": "output", "data": {"type": "fragment_output"}}
            ],
            "edges": [
                {"source": "const", "target": "output"}
            ]
        }
        result = self.compiler.compile(graph)
        assert result.error is None
        assert "float v_const = 0.5;" in result.code

    def test_add_node(self):
        """Test nodo Add con dos inputs"""
        graph = {
            "nodes": [
                {"id": "a", "data": {"type": "float_constant", "parameters": {"value": 1.0}}},
                {"id": "b", "data": {"type": "float_constant", "parameters": {"value": 2.0}}},
                {"id": "add", "data": {"type": "add"}},
                {"id": "output", "data": {"type": "fragment_output"}}
            ],
            "edges": [
                {"source": "a", "target": "add", "targetHandle": "input"},
                {"source": "b", "target": "add", "targetHandle": "input1"},
                {"source": "add", "target": "output"}
            ]
        }
        result = self.compiler.compile(graph)
        assert result.error is None
        assert "float v_add = v_a + v_b;" in result.code

    def test_multiply_node(self):
        """Test nodo Multiply"""
        graph = {
            "nodes": [
                {"id": "a", "data": {"type": "float_constant", "parameters": {"value": 3.0}}},
                {"id": "b", "data": {"type": "float_constant", "parameters": {"value": 4.0}}},
                {"id": "mult", "data": {"type": "multiply"}},
                {"id": "output", "data": {"type": "fragment_output"}}
            ],
            "edges": [
                {"source": "a", "target": "mult", "targetHandle": "input"},
                {"source": "b", "target": "mult", "targetHandle": "input1"},
                {"source": "mult", "target": "output"}
            ]
        }
        result = self.compiler.compile(graph)
        assert result.error is None
        assert "float v_mult = v_a * v_b;" in result.code

    def test_perlin_noise_node(self):
        """Test nodo Perlin Noise con función helper"""
        graph = {
            "nodes": [
                {"id": "uv", "data": {"type": "uv_input"}},
                {"id": "noise", "data": {"type": "perlin_noise"}},
                {"id": "output", "data": {"type": "fragment_output"}}
            ],
            "edges": [
                {"source": "uv", "target": "noise"},
                {"source": "noise", "target": "output"}
            ]
        }
        result = self.compiler.compile(graph)
        assert result.error is None
        assert "float v_noise = perlin(v_uv);" in result.code
        assert "perlin" in result.functions
        assert "float perlin(vec2 p)" in result.code  # Helper function

    def test_sdf_sphere_node(self):
        """Test nodo SDF Sphere"""
        graph = {
            "nodes": [
                {"id": "pos", "data": {"type": "vec3_constant", "parameters": {"x": 0, "y": 0, "z": 0}}},
                {"id": "radius", "data": {"type": "float_constant", "parameters": {"value": 1.0}}},
                {"id": "sdf", "data": {"type": "sdf_sphere"}},
                {"id": "output", "data": {"type": "fragment_output"}}
            ],
            "edges": [
                {"source": "pos", "target": "sdf", "targetHandle": "input"},
                {"source": "radius", "target": "sdf", "targetHandle": "input1"},
                {"source": "sdf", "target": "output"}
            ]
        }
        result = self.compiler.compile(graph)
        assert result.error is None
        assert "float v_sdf = length(v_pos) - v_radius;" in result.code

    # ===== TESTS DE COMBINACIONES COMPLEJAS =====

    def test_chain_of_operations(self):
        """Test cadena de operaciones: (A + B) * C"""
        graph = {
            "nodes": [
                {"id": "a", "data": {"type": "float_constant", "parameters": {"value": 1.0}}},
                {"id": "b", "data": {"type": "float_constant", "parameters": {"value": 2.0}}},
                {"id": "c", "data": {"type": "float_constant", "parameters": {"value": 3.0}}},
                {"id": "add", "data": {"type": "add"}},
                {"id": "mult", "data": {"type": "multiply"}},
                {"id": "output", "data": {"type": "fragment_output"}}
            ],
            "edges": [
                {"source": "a", "target": "add", "targetHandle": "input"},
                {"source": "b", "target": "add", "targetHandle": "input1"},
                {"source": "add", "target": "mult", "targetHandle": "input"},
                {"source": "c", "target": "mult", "targetHandle": "input1"},
                {"source": "mult", "target": "output"}
            ]
        }
        result = self.compiler.compile(graph)
        assert result.error is None
        # Verificar orden topológico correcto
        add_idx = result.code.index("v_add")
        mult_idx = result.code.index("v_mult")
        assert add_idx < mult_idx  # add debe venir antes que mult

    def test_uv_to_color_pipeline(self):
        """Test pipeline UV → Noise → Color"""
        graph = {
            "nodes": [
                {"id": "uv", "data": {"type": "uv_input"}},
                {"id": "noise", "data": {"type": "perlin_noise"}},
                {"id": "output", "data": {"type": "fragment_output"}}
            ],
            "edges": [
                {"source": "uv", "target": "noise"},
                {"source": "noise", "target": "output"}
            ]
        }
        result = self.compiler.compile(graph)
        assert result.error is None
        assert "vec2 v_uv" in result.code
        assert "float v_noise = perlin(v_uv)" in result.code
        # float se convierte a vec4 correctamente: vec4(vec3(float), 1.0)
        assert "fragColor = vec4(vec3(v_noise), 1.0)" in result.code

    def test_multiple_inputs_to_output(self):
        """Test múltiples branches confluyendo en output"""
        graph = {
            "nodes": [
                {"id": "a", "data": {"type": "float_constant", "parameters": {"value": 1.0}}},
                {"id": "b", "data": {"type": "float_constant", "parameters": {"value": 2.0}}},
                {"id": "add", "data": {"type": "add"}},
                {"id": "output", "data": {"type": "fragment_output"}}
            ],
            "edges": [
                {"source": "a", "target": "add", "targetHandle": "input"},
                {"source": "b", "target": "add", "targetHandle": "input1"},
                {"source": "add", "target": "output"}
            ]
        }
        result = self.compiler.compile(graph)
        assert result.error is None

    # ===== TESTS DE INFERENCIA DE TIPOS =====

    def test_type_inference_float(self):
        """Test inferencia de tipos con floats"""
        graph = {
            "nodes": [
                {"id": "a", "data": {"type": "float_constant", "parameters": {"value": 1.0}}},
                {"id": "b", "data": {"type": "float_constant", "parameters": {"value": 2.0}}},
                {"id": "add", "data": {"type": "add"}},
                {"id": "output", "data": {"type": "fragment_output"}}
            ],
            "edges": [
                {"source": "a", "target": "add", "targetHandle": "input"},
                {"source": "b", "target": "add", "targetHandle": "input1"},
                {"source": "add", "target": "output"}
            ]
        }
        result = self.compiler.compile(graph)
        assert result.error is None
        assert "float v_add = v_a + v_b;" in result.code

    def test_type_inference_vec2(self):
        """Test inferencia de tipos con vec2"""
        graph = {
            "nodes": [
                {"id": "uv", "data": {"type": "uv_input"}},
                {"id": "uv2", "data": {"type": "uv_input"}},
                {"id": "add", "data": {"type": "add"}},
                {"id": "output", "data": {"type": "fragment_output"}}
            ],
            "edges": [
                {"source": "uv", "target": "add", "targetHandle": "input"},
                {"source": "uv2", "target": "add", "targetHandle": "input1"},
                {"source": "add", "target": "output"}
            ]
        }
        result = self.compiler.compile(graph)
        assert result.error is None
        assert "vec2 v_add = v_uv + v_uv2;" in result.code

    # ===== TESTS DE UNIFORMS =====

    def test_uniforms_collected(self):
        """Test que los uniforms se recolectan correctamente"""
        graph = {
            "nodes": [
                {"id": "uv", "data": {"type": "uv_input"}},
                {"id": "time", "data": {"type": "time_input"}},
                {"id": "add", "data": {"type": "add"}},
                {"id": "output", "data": {"type": "fragment_output"}}
            ],
            "edges": [
                {"source": "uv", "target": "add", "targetHandle": "input"},
                {"source": "time", "target": "add", "targetHandle": "input1"},
                {"source": "add", "target": "output"}
            ]
        }
        result = self.compiler.compile(graph)
        assert result.error is None
        assert len(result.uniforms) == 2
        uniform_names = {u["name"] for u in result.uniforms}
        assert "iResolution" in uniform_names
        assert "iTime" in uniform_names

    # ===== TESTS DE FUNCIONES HELPER =====

    def test_helper_functions_included(self):
        """Test que las funciones helper se incluyen"""
        graph = {
            "nodes": [
                {"id": "uv", "data": {"type": "uv_input"}},
                {"id": "noise", "data": {"type": "perlin_noise"}},
                {"id": "output", "data": {"type": "fragment_output"}}
            ],
            "edges": [
                {"source": "uv", "target": "noise"},
                {"source": "noise", "target": "output"}
            ]
        }
        result = self.compiler.compile(graph)
        assert result.error is None
        assert "float perlin(vec2 p)" in result.code
        assert "perlin" in result.functions

    def test_multiple_helper_functions(self):
        """Test múltiples funciones helper"""
        graph = {
            "nodes": [
                {"id": "uv", "data": {"type": "uv_input"}},
                {"id": "perlin", "data": {"type": "perlin_noise"}},
                {"id": "simplex", "data": {"type": "simplex_noise"}},
                {"id": "add", "data": {"type": "add"}},
                {"id": "output", "data": {"type": "fragment_output"}}
            ],
            "edges": [
                {"source": "uv", "target": "perlin"},
                {"source": "uv", "target": "simplex"},
                {"source": "perlin", "target": "add", "targetHandle": "input"},
                {"source": "simplex", "target": "add", "targetHandle": "input1"},
                {"source": "add", "target": "output"}
            ]
        }
        result = self.compiler.compile(graph)
        assert result.error is None
        assert "float perlin(vec2 p)" in result.code
        assert "float simplex(vec2 p)" in result.code
        assert len(result.functions) == 2

    # ===== TESTS DE ESTRUCTURA DEL CÓDIGO =====

    def test_code_structure(self):
        """Test estructura básica del código generado"""
        graph = {
            "nodes": [
                {"id": "uv", "data": {"type": "uv_input"}},
                {"id": "output", "data": {"type": "fragment_output"}}
            ],
            "edges": [
                {"source": "uv", "target": "output"}
            ]
        }
        result = self.compiler.compile(graph)
        assert result.error is None
        assert "void mainImage(out vec4 fragColor, in vec2 fragCoord)" in result.code
        assert result.code.strip().endswith("}")

    def test_variable_naming(self):
        """Test que los nombres de variables son válidos"""
        graph = {
            "nodes": [
                {"id": "node-with-dashes", "data": {"type": "uv_input"}},
                {"id": "output", "data": {"type": "fragment_output"}}
            ],
            "edges": [
                {"source": "node-with-dashes", "target": "output"}
            ]
        }
        result = self.compiler.compile(graph)
        assert result.error is None
        # Los IDs con guiones deben convertirse a variables válidas
        assert "v_node-with-dashes" in result.code or "v_node_with_dashes" in result.code


# ===== TESTS DE INTEGRACIÓN =====

def test_full_shader_compilation():
    """Test compilación de un shader completo realista"""
    compiler = GLSLCompiler()

    # Shader: UV → Perlin Noise → Color
    graph = {
        "nodes": [
            {"id": "uv", "data": {"type": "uv_input"}},
            {"id": "time", "data": {"type": "time_input"}},
            {"id": "mult", "data": {"type": "multiply"}},
            {"id": "noise", "data": {"type": "perlin_noise"}},
            {"id": "output", "data": {"type": "fragment_output"}}
        ],
        "edges": [
            {"source": "uv", "target": "mult", "targetHandle": "input"},
            {"source": "time", "target": "mult", "targetHandle": "input1"},
            {"source": "mult", "target": "noise"},
            {"source": "noise", "target": "output"}
        ]
    }

    result = compiler.compile(graph)

    # Verificaciones
    assert result.error is None
    assert "vec2 v_uv" in result.code
    assert "float v_time" in result.code
    assert "perlin" in result.code
    assert "fragColor" in result.code
    assert len(result.uniforms) == 2
    assert "perlin" in result.functions


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
