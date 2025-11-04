"""
Validador de sintaxis GLSL
Verifica que el código GLSL generado sea sintácticamente correcto
"""

import re
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass

@dataclass
class ValidationResult:
    """Resultado de validación"""
    is_valid: bool
    errors: List[str]
    warnings: List[str]
    suggestions: List[str]

class GLSLValidator:
    """
    Validador de sintaxis GLSL
    Verifica declaraciones, tipos, funciones, etc.
    """

    # Tipos GLSL básicos
    GLSL_TYPES = {
        'void', 'bool', 'int', 'uint', 'float', 'double',
        'vec2', 'vec3', 'vec4',
        'bvec2', 'bvec3', 'bvec4',
        'ivec2', 'ivec3', 'ivec4',
        'uvec2', 'uvec3', 'uvec4',
        'dvec2', 'dvec3', 'dvec4',
        'mat2', 'mat3', 'mat4',
        'mat2x2', 'mat2x3', 'mat2x4',
        'mat3x2', 'mat3x3', 'mat3x4',
        'mat4x2', 'mat4x3', 'mat4x4',
        'sampler1D', 'sampler2D', 'sampler3D',
        'samplerCube', 'sampler2DRect'
    }

    # Funciones built-in de GLSL
    GLSL_BUILTINS = {
        # Math
        'abs', 'sign', 'floor', 'ceil', 'fract', 'mod', 'min', 'max',
        'clamp', 'mix', 'step', 'smoothstep', 'sqrt', 'pow', 'exp',
        'log', 'exp2', 'log2', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
        # Geometric
        'length', 'distance', 'dot', 'cross', 'normalize', 'faceforward',
        'reflect', 'refract',
        # Vector/Matrix
        'lessThan', 'lessThanEqual', 'greaterThan', 'greaterThanEqual',
        'equal', 'notEqual', 'any', 'all', 'not',
        'matrixCompMult', 'transpose', 'determinant', 'inverse',
        # Texture
        'texture', 'texture2D', 'textureCube', 'texelFetch',
        # Other
        'dFdx', 'dFdy', 'fwidth'
    }

    # Qualifiers
    GLSL_QUALIFIERS = {
        'const', 'in', 'out', 'inout', 'uniform', 'varying',
        'attribute', 'highp', 'mediump', 'lowp'
    }

    def __init__(self):
        self.errors: List[str] = []
        self.warnings: List[str] = []
        self.suggestions: List[str] = []
        self.declared_variables: Dict[str, str] = {}  # var_name -> type
        self.declared_functions: Dict[str, Dict] = {}  # func_name -> metadata
        self.declared_uniforms: Dict[str, str] = {}  # uniform_name -> type

    def validate(self, code: str) -> ValidationResult:
        """
        Valida código GLSL

        Returns:
            ValidationResult con is_valid, errors, warnings, suggestions
        """
        self.errors = []
        self.warnings = []
        self.suggestions = []
        self.declared_variables = {}
        self.declared_functions = {}
        self.declared_uniforms = {}

        if not code or not code.strip():
            self.errors.append("Empty shader code")
            return self._build_result()

        # 1. Validar estructura básica
        self._validate_structure(code)

        # 2. Validar declaraciones de uniforms
        self._validate_uniforms(code)

        # 3. Validar funciones
        self._validate_functions(code)

        # 4. Validar sintaxis de statements
        self._validate_statements(code)

        # 5. Validar uso de variables
        self._validate_variable_usage(code)

        # 6. Validar tipos
        self._validate_types(code)

        # 7. Validar paréntesis y llaves
        self._validate_brackets(code)

        return self._build_result()

    def _build_result(self) -> ValidationResult:
        """Construye el resultado final"""
        return ValidationResult(
            is_valid=len(self.errors) == 0,
            errors=self.errors,
            warnings=self.warnings,
            suggestions=self.suggestions
        )

    def _validate_structure(self, code: str):
        """Valida estructura básica del shader"""
        # Verificar función main
        if 'void mainImage' not in code and 'void main' not in code:
            self.errors.append("Missing main function (void mainImage or void main)")

        # Verificar que tenga llaves balanceadas en general
        open_braces = code.count('{')
        close_braces = code.count('}')
        if open_braces != close_braces:
            self.errors.append(f"Unbalanced braces: {open_braces} open, {close_braces} close")

    def _validate_uniforms(self, code: str):
        """Valida declaraciones de uniforms"""
        # Patrón: uniform type name;
        uniform_pattern = r'uniform\s+(\w+)\s+(\w+)\s*;'

        for match in re.finditer(uniform_pattern, code):
            uniform_type = match.group(1)
            uniform_name = match.group(2)

            if uniform_type not in self.GLSL_TYPES:
                self.warnings.append(f"Unknown uniform type: {uniform_type}")

            self.declared_uniforms[uniform_name] = uniform_type

    def _validate_functions(self, code: str):
        """Valida declaraciones de funciones"""
        # Patrón: type name(params) { ... }
        func_pattern = r'(\w+)\s+(\w+)\s*\([^)]*\)\s*\{'

        for match in re.finditer(func_pattern, code):
            return_type = match.group(1)
            func_name = match.group(2)

            # Validar tipo de retorno
            if return_type not in self.GLSL_TYPES:
                self.warnings.append(f"Unknown return type '{return_type}' in function '{func_name}'")

            self.declared_functions[func_name] = {
                'return_type': return_type
            }

    def _validate_statements(self, code: str):
        """Valida statements individuales"""
        # Extraer main function body
        main_match = re.search(r'void\s+(mainImage|main)\s*\([^)]*\)\s*\{(.*)\}', code, re.DOTALL)
        if not main_match:
            return

        main_body = main_match.group(2)

        # Validar cada línea
        lines = main_body.split('\n')
        for i, line in enumerate(lines, start=1):
            line = line.strip()
            if not line or line.startswith('//'):
                continue

            # Verificar punto y coma al final (excepto llaves)
            if line and not line.endswith((';', '{', '}')) and not line.startswith('//'):
                if '=' in line or '(' in line:  # Solo si parece statement
                    self.warnings.append(f"Line {i}: Missing semicolon: '{line}'")

    def _validate_variable_usage(self, code: str):
        """Valida que las variables se declaren antes de usarse"""
        # Extraer main function
        main_match = re.search(r'void\s+(mainImage|main)\s*\([^)]*\)\s*\{(.*)\}', code, re.DOTALL)
        if not main_match:
            return

        main_body = main_match.group(2)

        # Encontrar todas las declaraciones: type name = value;
        decl_pattern = r'(\w+)\s+(\w+)\s*='
        for match in re.finditer(decl_pattern, main_body):
            var_type = match.group(1)
            var_name = match.group(2)

            if var_type in self.GLSL_TYPES:
                self.declared_variables[var_name] = var_type

        # Encontrar usos de variables (lado derecho de =)
        usage_pattern = r'=\s*([^;]+);'
        for match in re.finditer(usage_pattern, main_body):
            expression = match.group(1)
            # Buscar identificadores en la expresión
            identifiers = re.findall(r'\b([a-zA-Z_]\w*)\b', expression)

            for identifier in identifiers:
                # Ignorar keywords, tipos, funciones builtin
                if identifier in self.GLSL_TYPES:
                    continue
                if identifier in self.GLSL_BUILTINS:
                    continue
                if identifier in self.declared_functions:
                    continue
                if identifier in self.declared_uniforms:
                    continue
                if identifier in self.declared_variables:
                    continue

                # Puede ser parámetro de función
                if identifier in ['fragCoord', 'fragColor']:
                    continue

                self.warnings.append(f"Variable '{identifier}' may be used before declaration")

    def _validate_types(self, code: str):
        """Valida consistencia de tipos"""
        # Extraer assignments: type var = expression;
        assignment_pattern = r'(\w+)\s+(\w+)\s*=\s*([^;]+);'

        for match in re.finditer(assignment_pattern, code):
            var_type = match.group(1)
            var_name = match.group(2)
            expression = match.group(3).strip()

            if var_type not in self.GLSL_TYPES:
                continue

            # Verificar tipos obvios
            if var_type == 'float':
                # Si asigna vec*, advertir
                if 'vec2(' in expression or 'vec3(' in expression or 'vec4(' in expression:
                    self.errors.append(
                        f"Type mismatch: Cannot assign vector to float variable '{var_name}'"
                    )
            elif var_type.startswith('vec'):
                # Si asigna float simple, advertir
                if expression.replace('.', '').replace('-', '').replace('+', '').isdigit():
                    self.warnings.append(
                        f"Implicit conversion: Assigning scalar to vector '{var_name}' of type '{var_type}'"
                    )

    def _validate_brackets(self, code: str):
        """Valida paréntesis, llaves y corchetes balanceados"""
        stack = []
        pairs = {'(': ')', '{': '}', '[': ']'}

        for i, char in enumerate(code):
            if char in pairs:
                stack.append((char, i))
            elif char in pairs.values():
                if not stack:
                    self.errors.append(f"Unmatched closing bracket '{char}' at position {i}")
                    continue

                open_char, open_pos = stack.pop()
                if pairs[open_char] != char:
                    self.errors.append(
                        f"Mismatched brackets: '{open_char}' at {open_pos} closed with '{char}' at {i}"
                    )

        if stack:
            for char, pos in stack:
                self.errors.append(f"Unclosed bracket '{char}' at position {pos}")

    def quick_validate(self, code: str) -> bool:
        """
        Validación rápida (solo errores críticos)

        Returns:
            True si pasa validación básica
        """
        # Verificar llaves balanceadas
        if code.count('{') != code.count('}'):
            return False

        # Verificar paréntesis balanceados
        if code.count('(') != code.count(')'):
            return False

        # Verificar que tenga función main
        if 'void mainImage' not in code and 'void main' not in code:
            return False

        return True

    def suggest_fixes(self, code: str) -> List[str]:
        """
        Sugiere fixes automáticos para errores comunes

        Returns:
            Lista de sugerencias
        """
        suggestions = []

        # Sugerir declaraciones faltantes
        if not self.declared_uniforms and ('iTime' in code or 'iResolution' in code):
            suggestions.append("Add uniform declarations: uniform float iTime; uniform vec2 iResolution;")

        # Sugerir funciones helper faltantes
        if 'perlin(' in code and 'float perlin' not in code:
            suggestions.append("Missing perlin() function implementation")

        if 'simplex(' in code and 'float simplex' not in code:
            suggestions.append("Missing simplex() function implementation")

        return suggestions


# ===== FUNCIONES DE UTILIDAD =====

def validate_glsl(code: str) -> ValidationResult:
    """
    Función helper para validar GLSL rápidamente

    Args:
        code: Código GLSL a validar

    Returns:
        ValidationResult
    """
    validator = GLSLValidator()
    return validator.validate(code)


def is_valid_glsl(code: str) -> bool:
    """
    Verificación rápida de validez de GLSL

    Args:
        code: Código GLSL

    Returns:
        True si es válido
    """
    validator = GLSLValidator()
    return validator.quick_validate(code)
