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
    """Compila grafos de nodos a cรณdigo GLSL"""
    
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
        },
        'vec3_construct': {
            'glsl': 'vec3 {output} = vec3({input1}, {input2}, {input3});',
            'inputs': 3,
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
            
            # Ordenar nodos topolรณgicamente
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
            
            # Generar cรณdigo
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
        if 'nodes' not in graph or not isinstance(graph['nodes'], list):
            self.errors.append("Invalid nodes list")
            return False

        # Verificar que hay al menos un nodo output (antes de validar edges)
        has_output = any(
            n.get('data', {}).get('type') == 'fragment_output'
            for n in graph['nodes']
        )

        if not has_output:
            self.errors.append("No fragment output node found")
            return False

        if 'edges' not in graph or not isinstance(graph['edges'], list):
            self.errors.append("Invalid edges list")
            return False

        return True
    
    def _topological_sort(self, graph: Dict[str, Any]) -> Optional[List[Dict]]:
        """Ordena nodos topolรณgicamente (validar no hay ciclos)"""
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

        # Primero: determinar tipos de output de cada nodo en orden topológico
        for node in sorted_nodes:
            node_id = node['id']
            node_type = node['data'].get('type', '')

            if node_type in self.NODE_FUNCTIONS:
                node_def = self.NODE_FUNCTIONS[node_type]
                safe_node_id = node_id.replace('-', '_')
                output_var = f"v_{safe_node_id}"
                output_type = node_def.get('output_type', 'float')

                # Si el tipo es 'mixed', necesitamos inferir de los inputs
                if output_type == 'mixed':
                    # Buscar el tipo del primer input conectado
                    for i in range(node_def.get('inputs', 0)):
                        handle = f'input{i}' if i > 0 else 'input'

                        if node_id in input_connections and handle in input_connections[node_id]:
                            source_node_id, _ = input_connections[node_id][handle]
                            if source_node_id in self.node_outputs:
                                _, input_type = self.node_outputs[source_node_id]
                                output_type = input_type
                                break

                    # Si no pudimos inferir, usar float por defecto
                    if output_type == 'mixed':
                        output_type = 'float'

                self.node_outputs[node_id] = (output_var, output_type)

        # Segundo: registrar tipos de entrada para cada nodo
        for node in sorted_nodes:
            node_id = node['id']
            node_type = node['data'].get('type', '')

            self.node_input_types[node_id] = []

            if node_type in self.NODE_FUNCTIONS:
                node_def = self.NODE_FUNCTIONS[node_type]

                # Si el nodo tiene infer_type, todos sus inputs deben tener el mismo tipo que su output
                inferred_type = None
                if node_def.get('infer_type') and node_id in self.node_outputs:
                    _, inferred_type = self.node_outputs[node_id]

                for i in range(node_def.get('inputs', 0)):
                    handle = f'input{i}' if i > 0 else 'input'

                    # Si el nodo infiere tipos, usar el tipo inferido para todos los inputs
                    if inferred_type:
                        self.node_input_types[node_id].append(inferred_type)
                    # Si no, buscar tipo del nodo conectado
                    elif node_id in input_connections and handle in input_connections[node_id]:
                        source_node_id, _ = input_connections[node_id][handle]
                        if source_node_id in self.node_outputs:
                            _, input_type = self.node_outputs[source_node_id]
                            self.node_input_types[node_id].append(input_type)
                        else:
                            self.node_input_types[node_id].append('float')
                    else:
                        self.node_input_types[node_id].append('float')
    
    def _get_default_value_for_type(self, glsl_type: str) -> str:
        """Retorna el valor default apropiado para un tipo GLSL"""
        type_defaults = {
            'float': '0.0',
            'vec2': 'vec2(0.0)',
            'vec3': 'vec3(0.0)',
            'vec4': 'vec4(0.0)',
            'int': '0',
            'bool': 'false',
        }
        return type_defaults.get(glsl_type, '0.0')

    def _generate_glsl(self, sorted_nodes: List[Dict], graph: Dict[str, Any]) -> str:
        """Genera cรณdigo GLSL desde nodos ordenados"""
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
        
        # Generar lรญneas de cรณdigo
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
            
            # Obtener variable y tipo de salida (ya calculado en _analyze_input_types)
            if node_id in self.node_outputs:
                output_var, output_type = self.node_outputs[node_id]
            else:
                # Fallback si no se calculó antes
                safe_node_id = node_id.replace('-', '_')
                output_var = f"v_{safe_node_id}"
                output_type = node_def.get('output_type', 'float')
                self.node_outputs[node_id] = (output_var, output_type)
            
            # Generar cรณdigo del nodo
            glsl_template = node_def['glsl']
            glsl_line = glsl_template.replace('{output}', output_var)
            glsl_line = glsl_line.replace('{type}', output_type)
            
            # Reemplazar inputs
            for i in range(node_def.get('inputs', 0)):
                input_num = i + 1
                # Handles: 'input' para el primero, 'input1', 'input2', etc. para los demás
                handle = f'input{i}' if i > 0 else 'input'
                # Placeholders siempre numerados: {input1}, {input2}, etc.
                placeholder = f'{{input{input_num}}}'

                # Determinar tipo esperado para este input
                expected_type = 'float'
                if node_id in self.node_input_types and i < len(self.node_input_types[node_id]):
                    expected_type = self.node_input_types[node_id][i]

                # Buscar variable de entrada desde el grafo
                if node_id in input_connections and handle in input_connections[node_id]:
                    source_node_id, source_handle = input_connections[node_id][handle]
                    if source_node_id in self.node_outputs:
                        input_var, _ = self.node_outputs[source_node_id]
                        glsl_line = glsl_line.replace(placeholder, input_var)
                    else:
                        # Usar valor default apropiado para el tipo
                        default_value = self._get_default_value_for_type(expected_type)
                        glsl_line = glsl_line.replace(placeholder, default_value)
                else:
                    # Usar parámetro del nodo si existe
                    params = node['data'].get('parameters', {})
                    param_key = f'input{i}' if i > 0 else 'input'
                    if param_key in params:
                        glsl_line = glsl_line.replace(placeholder, str(params[param_key]))
                    else:
                        # Usar valor default apropiado para el tipo
                        default_value = self._get_default_value_for_type(expected_type)
                        glsl_line = glsl_line.replace(placeholder, default_value)
            
            # Reemplazar todos los parรกmetros en el template
            node_params = node['data'].get('parameters', {})
            for param_name, param_value in node_params.items():
                placeholder = f'{{{param_name}}}'
                glsl_line = glsl_line.replace(placeholder, str(param_value))
            
            # Reemplazar parรกmetros constantes (para nodos de constantes)
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
            

            # Fix especial para fragment_output: convertir input a vec4 correctamente
            if node_type == 'fragment_output':
                # Determinar el tipo del input conectado
                input_type = 'float'
                if node_id in input_connections and 'input' in input_connections[node_id]:
                    source_node_id, _ = input_connections[node_id]['input']
                    if source_node_id in self.node_outputs:
                        _, input_type = self.node_outputs[source_node_id]

                # Buscar la variable de input en la línea generada
                # El template es: fragColor = vec4({input1}, 1.0);
                # Necesitamos extraer el nombre de la variable
                import re as regex_module
                match = regex_module.search(r'fragColor = vec4\((.+?), 1\.0\);', glsl_line)
                if match:
                    input_var = match.group(1)

                    # Generar conversión correcta según tipo
                    if input_type == 'float':
                        # float → vec4(v, v, v, 1.0)
                        glsl_line = f"fragColor = vec4(vec3({input_var}), 1.0);"
                    elif input_type == 'vec2':
                        # vec2 → vec4(v.x, v.y, 0.0, 1.0)
                        glsl_line = f"fragColor = vec4({input_var}, 0.0, 1.0);"
                    elif input_type == 'vec3':
                        # vec3 → vec4(v, 1.0) ✓ Ya funciona
                        glsl_line = f"fragColor = vec4({input_var}, 1.0);"
                    elif input_type == 'vec4':
                        # vec4 → ya es vec4
                        glsl_line = f"fragColor = {input_var};"

            code_lines.append(glsl_line)
        
        # Armar cรณdigo final
        helper_funcs = "\n".join([
            self.HELPER_FUNCTIONS[func]
            for func in self.required_functions
            if func in self.HELPER_FUNCTIONS
        ])
        
        main_code = "\n  ".join(code_lines)
        
        # Declaraciones de uniformes
        uniforms_decl = []
        for u in sorted(self.required_uniforms):
            uniform_type = 'vec2' if u == 'iResolution' else 'float'
            uniforms_decl.append(f"uniform {uniform_type} {u};")
        uniforms_str = "\n".join(uniforms_decl)
        
        # Construir cรณdigo completo con uniforms
        parts = []
        if uniforms_str:
            parts.append(uniforms_str)
        if helper_funcs:
            parts.append(helper_funcs)
        
        parts.append(f"""void mainImage(out vec4 fragColor, in vec2 fragCoord) {{
  {main_code}
}}""")
        
        full_code = "\n\n".join(parts).strip()
        
        return full_code
