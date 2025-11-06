"""
LYGIA Shader Library Include Resolver

Resuelve directivas #include de LYGIA automáticamente,
fetcheando funciones desde https://lygia.xyz
"""

import re
import requests
from typing import Dict, Set
from functools import lru_cache


class LygiaResolver:
    """Resuelve #include directives de LYGIA shader library"""

    BASE_URL = "https://lygia.xyz"
    GITHUB_RAW = "https://raw.githubusercontent.com/patriciogonzalezvivo/lygia/main"

    def __init__(self, use_cache: bool = True):
        self.use_cache = use_cache
        self.resolved_files: Set[str] = set()

    @lru_cache(maxsize=128)
    def _fetch_file(self, path: str) -> str:
        """
        Fetches a LYGIA file from the CDN or GitHub.
        Tries lygia.xyz first, falls back to GitHub raw.
        """
        # Clean path: remove "lygia/" prefix if present
        clean_path = path.replace('"', '').strip()
        if clean_path.startswith('lygia/'):
            clean_path = clean_path[6:]  # Remove "lygia/" prefix

        # Try lygia.xyz first
        try:
            url = f"{self.BASE_URL}/{clean_path}"
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                return response.text
        except Exception as e:
            print(f"Failed to fetch from lygia.xyz: {e}")

        # Fallback to GitHub raw
        try:
            url = f"{self.GITHUB_RAW}/{clean_path}"
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                return response.text
        except Exception as e:
            print(f"Failed to fetch from GitHub: {e}")

        raise FileNotFoundError(f"Could not fetch LYGIA file: {path}")

    def _resolve_includes_recursive(self, code: str, depth: int = 0, max_depth: int = 10) -> str:
        """
        Recursively resolves #include directives.

        Args:
            code: GLSL code potentially containing #include directives
            depth: Current recursion depth
            max_depth: Maximum recursion depth to prevent infinite loops

        Returns:
            GLSL code with all #include directives resolved
        """
        if depth >= max_depth:
            print(f"Warning: Max include depth ({max_depth}) reached")
            return code

        # Pattern: #include "lygia/path/to/file.glsl"
        # Also matches: #include "path/to/file.glsl" (without lygia/ prefix)
        include_pattern = r'#include\s+"([^"]+)"'

        includes = re.findall(include_pattern, code)

        if not includes:
            return code

        # Process each include
        for include_path in includes:
            # Skip if already resolved (prevent duplicates)
            if include_path in self.resolved_files:
                # Replace with empty comment to maintain line numbers
                code = code.replace(f'#include "{include_path}"', f'// (already included: {include_path})')
                continue

            try:
                # Fetch the included file
                included_code = self._fetch_file(include_path)
                self.resolved_files.add(include_path)

                # Recursively resolve includes in the fetched file
                resolved_code = self._resolve_includes_recursive(included_code, depth + 1, max_depth)

                # Add comment header for debugging
                resolved_with_header = f"\n// === BEGIN INCLUDE: {include_path} ===\n{resolved_code}\n// === END INCLUDE: {include_path} ===\n"

                # Replace the #include directive with the resolved code
                code = code.replace(f'#include "{include_path}"', resolved_with_header)

            except Exception as e:
                # If fetch fails, leave the include as a comment with error
                error_comment = f'// ERROR: Could not resolve #include "{include_path}": {str(e)}'
                code = code.replace(f'#include "{include_path}"', error_comment)

        return code

    def resolve(self, shader_code: str) -> Dict[str, any]:
        """
        Main entry point: resolves all LYGIA includes in shader code.

        Args:
            shader_code: GLSL shader code with #include directives

        Returns:
            Dictionary with:
                - 'code': Resolved shader code
                - 'includes_found': Number of includes found
                - 'includes_resolved': List of successfully resolved paths
                - 'includes_failed': List of failed includes
        """
        self.resolved_files.clear()

        # Find all includes before resolving
        include_pattern = r'#include\s+"([^"]+)"'
        original_includes = re.findall(include_pattern, shader_code)

        try:
            resolved_code = self._resolve_includes_recursive(shader_code)

            return {
                'code': resolved_code,
                'includes_found': len(original_includes),
                'includes_resolved': list(self.resolved_files),
                'includes_failed': []
            }
        except Exception as e:
            return {
                'code': shader_code,
                'includes_found': len(original_includes),
                'includes_resolved': list(self.resolved_files),
                'includes_failed': [str(e)]
            }


# Singleton instance for caching
_resolver_instance = None

def get_resolver() -> LygiaResolver:
    """Get or create singleton resolver instance"""
    global _resolver_instance
    if _resolver_instance is None:
        _resolver_instance = LygiaResolver(use_cache=True)
    return _resolver_instance


def resolve_lygia_includes(shader_code: str) -> str:
    """
    Convenience function: resolves LYGIA includes in shader code.

    Args:
        shader_code: GLSL code with #include directives

    Returns:
        Resolved GLSL code
    """
    resolver = get_resolver()
    result = resolver.resolve(shader_code)
    return result['code']
