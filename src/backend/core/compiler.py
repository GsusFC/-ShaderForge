from typing import Dict, List, Tuple, Set, Any, Optional
from dataclasses import dataclass, field
import re

@dataclass
class CompiledShader:
    code: str
    uniforms: List[Dict[str, str]]
    functions: List[str]
    error: Optional[str] = None
    warnings: List[str] = field(default_factory=list)

class GLSLCompiler:
    """Compila grafos de nodos a código GLSL"""
    
    # Definiciones de nodos y sus funciones GLSL
    NODE_FUNCTIONS = {
        'uv_input': {
            'glsl': 'vec2 {output} = fragCoord / iResolution.xy;',
            'inputs': 0,
            'outputs': 1,
            'uniforms': ['iResolution'],
            'output_type': 'vec2'
        },
        'time_input': {
            'glsl': 'float {output} = iTime;',
            'inputs': 0,
            'outputs': 1,
            'uniforms': ['iTime'],
            'output_type': 'float'
        },
        'add': {
            'glsl': '{type} {output} = {input1} + {input2};',
            'inputs': 2,
            'outputs': 1,
            'infer_type': True,
            'output_type': 'mixed'
        },
        'multiply': {
            'glsl': '{type} {output} = {input1} * {input2};',
            'inputs': 2,
            'outputs': 1,
            'infer_type': True,
            'output_type': 'mixed'
        },
        'lerp': {
            'glsl': '{type} {output} = mix({input1}, {input2}, {input3});',
            'inputs': 3,
            'outputs': 1,
            'infer_type': True,
            'output_type': 'mixed'
        },
        'clamp': {
            'glsl': '{type} {output} = clamp({input1}, {input2}, {input3});',
            'inputs': 3,
            'outputs': 1,
            'infer_type': True,
            'output_type': 'mixed'
        },
        'perlin_noise': {
            'glsl': 'float {output} = perlin({input1});',
            'inputs': 1,
            'outputs': 1,
            'functions': ['perlin'],
            'output_type': 'float'
        },
        'simplex_noise': {
            'glsl': 'float {output} = simplex({input1});',
            'inputs': 1,
            'outputs': 1,
            'functions': ['simplex'],
            'output_type': 'float'
        },
        'sdf_sphere': {
            'glsl': 'float {output} = length({input1}) - {input2};',
            'inputs': 2,
            'outputs': 1,
            'output_type': 'float'
        },
        'fragment_output': {
            'glsl': 'fragColor = vec4({input1}, 1.0);',
            'inputs': 1,
            'outputs': 0,
            'output_type': 'void'
        },
        'float_constant': {
            'glsl': 'float {output} = {value};',
            'inputs': 0,
            'outputs': 1,
            'output_type': 'float'
        },
        'vec2_constant': {
            'glsl': 'vec2 {output} = vec2({x}, {y});',
            'inputs': 0,
            'outputs': 1,
            'output_type': 'vec2'
        },
        'vec3_constant': {
            'glsl': 'vec3 {output} = vec3({x}, {y}, {z});',
            'inputs': 0,
            'outputs': 1,
            'output_type': 'vec3'
        }
    }
    
    # Funciones GLSL helper
    HELPER_FUNCTIONS = {
        'perlin': '''
float perlin(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float a = sin(i.x * 12.9898 + i.y * 78.233) * 43758.5453;
    float b = sin((i.x + 1.0) * 12.9898 + i.y * 78.233) * 43758.5453;
    float c = sin(i.x * 12.9898 + (i.y + 1.0) * 78.233) * 43758.5453;
    float d = sin((i.x + 1.0) * 12.9898 + (i.y + 1.0) * 78.233) * 43758.5453;
    
    a = fract(a);
    b = fract(b);
    c = fract(c);
    d = fract(d);
    
    float ab = mix(a, b, f.x);
    float cd = mix(c, d, f.x);
    return mix(ab, cd, f.y);
}
''',
        'simplex': '''
float simplex(vec2 p) {
    return sin(p.x * 12.9898 + sin(p.y * 78.233) * 43758.5453);
}
'''
    }
    
    def __init__(self):
        self.errors: List[str] = []
        self.warnings: List[str] = []
        self.required_uniforms: Set[str] = set()
        self.required_functions: Set[str] = set()
        self.node_outputs: Dict[str, Tuple[str, str]] = {}  # node_id -> (var_name, type)
        self.node_input_types: Dict[str, List[str]] = {}  # node_id -> [input_types]
    
    def compile(self, graph: Dict[str, Any]) -> CompiledShader:
        """Compila un grafo de nodos a GLSL"""
        self.errors = []
        self.warnings = []
        self.required_uniforms = set()
        self.required_functions = set()
        self.node_outputs = {}
        self.node_input_types = {}
        
        try:
            # Validar grafo
            if not self._validate_graph(graph):
                return CompiledShader(
                    code="",
                    uniforms=[],
                    functions=[],
                    error="; ".join(self.errors) if self.errors else "Unknown error"
                )
            
            # Ordenar nodos topológicamente
            sorted_nodes = self._topological_sort(graph)
            if sorted_nodes is None:
                return CompiledShader(
                    code="",
                    uniforms=[],
                    functions=[],
                    error="Cycle detected in node graph"
                )
            
            # Analizar tipos de entrada
            self._analyze_input_types(graph, sorted_nodes)
            
            # Generar código
            glsl_code = self._generate_glsl(sorted_nodes, graph)
            
            # Crear uniforms list
            uniforms = [
                {"name": u, "type": "vec2" if u == "iResolution" else "float"}
                for u in sorted(self.required_uniforms)
            ]
            
            return CompiledShader(
                code=glsl_code,
                uniforms=uniforms,
                functions=list(self.required_functions),
                warnings=self.warnings
            )
            
        except Exception as e:
            return CompiledShader(
                code="",
                uniforms=[],
                functions=[],
                error=f"Compilation error: {str(e)}"
            )
    
    def _validate_graph(self, graph: Dict[str, Any]) -> bool:
        """Valida la estructura del grafo"""
        if not graph.get('nodes') or not isinstance(graph['nodes'], list):
            self.errors.append("Invalid nodes list")
            return False
        
        if not graph.get('edges') or not isinstance(graph['edges'], list):
            self.errors.append("Invalid edges list")
            return False
        
        # Verificar que hay al menos un nodo output
        has_output = any(
            n.get('data', {}).get('type') == 'fragment_output'
            for n in graph['nodes']
        )
        
        if not has_output:
            self.errors.append("No fragment output node found")
            return False
        
        return True
    
    def _topological_sort(self, graph: Dict[str, Any]) -> Optional[List[Dict]]:
        """Ordena nodos topológicamente (validar no hay ciclos)"""
        nodes = graph.get('nodes', [])
        edges = graph.get('edges', [])
        
        # Crear mapa de dependencias
        node_map = {n['id']: n for n in nodes}
        dependencies: Dict[str, Set[str]] = {n['id']: set() for n in nodes}
        
        for edge in edges:
            target = edge.get('target')
            source = edge.get('source')
            if target and source:
                dependencies[target].add(source)
        
        # Detectar ciclos (DFS)
        visited = set()
        rec_stack = set()
        
        def has_cycle(node_id: str) -> bool:
            visited.add(node_id)
            rec_stack.add(node_id)
            
            for dep in dependencies.get(node_id, set()):
                if dep not in visited:
                    if has_cycle(dep):
                        return True
                elif dep in rec_stack:
                    return True
            
            rec_stack.remove(node_id)
            return False
        
        for node in nodes:
            if node['id'] not in visited:
                if has_cycle(node['id']):
                    return None
        
        # Kahn's algorithm para topological sort
        in_degree = {n['id']: len(dependencies[n['id']]) for n in nodes}
        queue = [n['id'] for n in nodes if in_degree[n['id']] == 0]
        sorted_ids = []
        
        while queue:
            node_id = queue.pop(0)
            sorted_ids.append(node_id)
            
            # Encontrar nodos que dependen de este
            for n in nodes:
                if node_id in dependencies.get(n['id'], set()):
                    in_degree[n['id']] -= 1
                    if in_degree[n['id']] == 0:
                        queue.append(n['id'])
        
        if len(sorted_ids) != len(nodes):
            return None
        
        return [node_map[node_id] for node_id in sorted_ids]
    
    def _analyze_input_types(self, graph: Dict[str, Any], sorted_nodes: List[Dict]):
        """Analiza los tipos de entrada/salida de los nodos"""
        edges = graph.get('edges', [])
        
        # Crear mapa de conexiones
        output_connections = {}  # source_node -> List[(target_node, target_handle)]
        input_connections = {}   # target_node -> {target_handle: (source_node, source_handle)}
        
        for edge in edges:
            source = edge.get('source')
            target = edge.get('target')
            
            if source and target:
                if source not in output_connections:
                    output_connections[source] = []
                output_connections[source].append((target, edge.get('targetHandle', 'input')))
                
                if target not in input_connections:
                    input_connections[target] = {}
                input_connections[target][edge.get('targetHandle', 'input')] = (source, edge.get('sourceHandle', 'output'))
        
        # Para cada nodo, registrar tipos de entrada
        for node in sorted_nodes:
            node_id = node['id']
            node_type = node['data'].get('type', '')
            
            self.node_input_types[node_id] = []
            
            if node_type in self.NODE_FUNCTIONS:
                node_def = self.NODE_FUNCTIONS[node_type]
                
                for i in range(node_def.get('inputs', 0)):
                    handle = f'input{i+1}' if i > 0 else 'input'
                    
                    # Buscar tipo del nodo conectado
                    if node_id in input_connections and handle in input_connections[node_id]:
                        source_node_id, _ = input_connections[node_id][handle]
                        if source_node_id in self.node_outputs:
                            _, input_type = self.node_outputs[source_node_id]
                            self.node_input_types[node_id].append(input_type)
                        else:
                            self.node_input_types[node_id].append('float')
                    else:
                        self.node_input_types[node_id].append('float')
    
    def _generate_glsl(self, sorted_nodes: List[Dict], graph: Dict[str, Any]) -> str:
        """Genera código GLSL desde nodos ordenados"""
        edges = graph.get('edges', [])
        
        # Crear mapa de conexiones
        output_connections = {}  # source_node -> [(target_node, target_handle, source_handle), ...]
        input_connections = {}   # target_node -> {target_handle: (source_node, source_handle)}
        
        for edge in edges:
            source = edge.get('source')
            target = edge.get('target')
            
            if source and target:
                if source not in output_connections:
                    output_connections[source] = []
                output_connections[source].append({
                    'target': target,
                    'source_handle': edge.get('sourceHandle', 'output'),
                    'target_handle': edge.get('targetHandle', 'input')
                })
                
                if target not in input_connections:
                    input_connections[target] = {}
                input_connections[target][edge.get('targetHandle', 'input')] = (
                    source,
                    edge.get('sourceHandle', 'output')
                )
        
        # Generar líneas de código
        code_lines = []
        
        for node in sorted_nodes:
            node_id = node['id']
            node_type = node['data'].get('type', '')
            
            if node_type not in self.NODE_FUNCTIONS:
                self.warnings.append(f"Unknown node type: {node_type}")
                continue
            
            node_def = self.NODE_FUNCTIONS[node_type]
            
            # Agregar uniforms requeridos
            for uniform in node_def.get('uniforms', []):
                self.required_uniforms.add(uniform)
            
            # Agregar funciones requeridas
            for func in node_def.get('functions', []):
                self.required_functions.add(func)
            
            # Generar variable de salida (sanitizar node_id: reemplazar guiones con guiones bajos)
            safe_node_id = node_id.replace('-', '_')
            output_var = f"v_{safe_node_id}"
            output_type = node_def.get('output_type', 'float')
            
            if output_type == 'mixed' and self.node_input_types.get(node_id):
                output_type = self.node_input_types[node_id][0]
            
            self.node_outputs[node_id] = (output_var, output_type)
            
            # Generar código del nodo
            glsl_template = node_def['glsl']
            glsl_line = glsl_template.replace('{output}', output_var)
            glsl_line = glsl_line.replace('{type}', output_type)
            
            # Reemplazar inputs
            for i in range(node_def.get('inputs', 0)):
                handle = f'input{i+1}' if i > 0 else 'input'
                placeholder = f'{{input{i+1}}}'
                
                # Buscar variable de entrada desde el grafo
                if node_id in input_connections and handle in input_connections[node_id]:
                    source_node_id, source_handle = input_connections[node_id][handle]
                    if source_node_id in self.node_outputs:
                        input_var, _ = self.node_outputs[source_node_id]
                        glsl_line = glsl_line.replace(placeholder, input_var)
                    else:
                        glsl_line = glsl_line.replace(placeholder, "0.0")
                else:
                    # Usar parámetro del nodo si existe
                    params = node['data'].get('parameters', {})
                    if f'input{i+1}' in params:
                        glsl_line = glsl_line.replace(placeholder, str(params[f'input{i+1}']))
                    else:
                        glsl_line = glsl_line.replace(placeholder, "0.0")
            
            # Reemplazar todos los parámetros en el template
            node_params = node['data'].get('parameters', {})
            for param_name, param_value in node_params.items():
                placeholder = f'{{{param_name}}}'
                glsl_line = glsl_line.replace(placeholder, str(param_value))
            
            # Reemplazar parámetros constantes (para nodos de constantes)
            if node_type == 'float_constant':
                value = node_params.get('value', 0.0)
                glsl_line = glsl_line.replace('{value}', str(value))
            elif node_type == 'vec2_constant':
                x = node_params.get('x', 0.0)
                y = node_params.get('y', 0.0)
                glsl_line = glsl_line.replace('{x}', str(x))
                glsl_line = glsl_line.replace('{y}', str(y))
            elif node_type == 'vec3_constant':
                x = node_params.get('x', 0.0)
                y = node_params.get('y', 0.0)
                z = node_params.get('z', 0.0)
                glsl_line = glsl_line.replace('{x}', str(x))
                glsl_line = glsl_line.replace('{y}', str(y))
                glsl_line = glsl_line.replace('{z}', str(z))
            
            code_lines.append(glsl_line)
        
        # Armar código final
        helper_funcs = "\n".join([
            self.HELPER_FUNCTIONS[func]
            for func in self.required_functions
            if func in self.HELPER_FUNCTIONS
        ])
        
        main_code = "\n  ".join(code_lines)
        
        uniforms_str = "\n".join([
            f"uniform {('vec2' if u == 'iResolution' else 'float')} {u};"
            for u in sorted(self.required_uniforms)
        ])
        
        full_code = f"""
{helper_funcs}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {{
  {main_code}
}}
""".strip()
        
        return full_code
