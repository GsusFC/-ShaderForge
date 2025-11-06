# LYGIA Shader Library Support

ShaderForge now supports **automatic inclusion** of functions from the [LYGIA Shader Library](https://lygia.xyz) using `#include` directives.

## What is LYGIA?

LYGIA is a comprehensive shader library by Patricio Gonzalez Vivo containing hundreds of reusable GLSL functions:

- **Math**: Constants (PI, TAU, etc.), decimation, interpolation
- **Generative**: Random, noise (Perlin, Simplex, Voronoi, Worley), fbm
- **Color**: RGB↔HSV, blend modes, palettes, gradients
- **SDF**: Signed Distance Fields for 2D/3D shapes
- **Lighting**: PBR, Phong, diffuse, specular
- **Filters**: Blur, sharpen, edge detection, dithering
- **Space**: Transformations, rotations, scales

## How to Use

### In Custom Code Node

Simply add `#include` directives in your Custom Code node:

```glsl
#include "lygia/generative/random.glsl"
#include "lygia/math/const.glsl"

float output = random(input1) * TAU;
```

The compiler will automatically fetch and resolve these includes at compile time.

### Example 1: Random Noise

```glsl
#include "lygia/generative/random.glsl"

vec2 uv = input1; // Connected from UV node
float noise = random(uv);
float output = noise;
```

### Example 2: FBM (Fractal Brownian Motion)

```glsl
#include "lygia/generative/fbm.glsl"

vec2 uv = input1;
float pattern = fbm(uv * 5.0);
vec3 output = vec3(pattern);
```

### Example 3: Color Space Conversion

```glsl
#include "lygia/color/space/rgb2hsv.glsl"
#include "lygia/color/space/hsv2rgb.glsl"

vec3 color = input1;
vec3 hsv = rgb2hsv(color);
hsv.x += 0.5; // Shift hue
vec3 output = hsv2rgb(hsv);
```

### Example 4: SDF Shapes

```glsl
#include "lygia/sdf/circleSDF.glsl"

vec2 uv = input1;
float circle = circleSDF(uv);
float output = step(circle, 0.5);
```

## Include Syntax

### Standard Path

```glsl
#include "lygia/category/function.glsl"
```

Examples:
- `#include "lygia/math/const.glsl"`
- `#include "lygia/generative/random.glsl"`
- `#include "lygia/color/space/rgb2hsv.glsl"`

### Recursive Includes

LYGIA files can include other LYGIA files. The resolver handles this automatically:

```glsl
#include "lygia/generative/fbm.glsl"
// This internally includes:
//   - lygia/generative/random.glsl
//   - lygia/math/const.glsl
//   - etc.
```

## Performance Notes

- **Caching**: Includes are cached using `@lru_cache` to avoid redundant fetches
- **Deduplication**: The same include won't be resolved multiple times in one shader
- **Network**: First compile with a new include may take ~1-2 seconds to fetch
- **Production**: Consider pre-caching common includes for faster compilation

## Available Categories

Browse the full library at [lygia.xyz](https://lygia.xyz):

1. **math/** - Mathematical functions and constants
2. **space/** - Spatial transformations
3. **color/** - Color operations and spaces
4. **generative/** - Procedural generation (noise, random)
5. **sdf/** - Signed Distance Fields
6. **draw/** - Drawing primitives
7. **sample/** - Texture sampling utilities
8. **filter/** - Image filters
9. **distort/** - Distortion effects
10. **lighting/** - Lighting models
11. **geometry/** - Geometric operations
12. **morphological/** - Morphological operations
13. **animation/** - Animation helpers

## Troubleshooting

### Include Not Found

If you see an error like:
```
// ERROR: Could not resolve #include "lygia/path/to/file.glsl"
```

Check:
1. Path is correct (check [lygia.xyz](https://lygia.xyz) for available files)
2. Network connectivity (includes are fetched online)
3. File exists in LYGIA repository

### Compilation Warnings

If LYGIA resolution fails, you'll see a warning in the validation panel:
```
⚠️ LYGIA include resolution failed: [error details]
```

The shader will still compile with the `#include` directive as a comment.

## Benefits

✅ **No Manual Copy-Paste**: Functions are automatically included
✅ **Always Up-to-Date**: Fetches from the official LYGIA repository
✅ **Dependency Management**: Recursive includes handled automatically
✅ **Type Safety**: GLSL functions are properly typed
✅ **Community Library**: Access to battle-tested shader functions

## Resources

- 📚 [LYGIA Documentation](https://lygia.xyz)
- 💻 [LYGIA GitHub Repository](https://github.com/patriciogonzalezvivo/lygia)
- 🎨 [Example Shaders](https://lygia.xyz/examples)

---

**Note**: LYGIA includes require internet connectivity during compilation. For offline development, consider cloning the LYGIA repository locally and modifying the resolver to fetch from local files.
