import asyncio
import aiohttp
import json
from pathlib import Path
from typing import List, Optional, Dict
import time

class ShadertoyConfig:
    def __init__(self):
        self.api_key = "YOUR_SHADERTOY_KEY"  # Obtener de https://www.shadertoy.com/myapps
        self.base_url = "https://www.shadertoy.com/api/v1"
        self.rate_limit = 100  # requests per hour
        self.batch_size = 10
        self.output_dir = Path("../../data/raw/shadertoy")

class ShadertoyScraperBasic:
    """
    Scraper básico para Shadertoy con rate limiting
    """
    
    def __init__(self, config: ShadertoyConfig):
        self.config = config
        self.session: Optional[aiohttp.ClientSession] = None
        self.request_count = 0
        self.start_time = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        self.start_time = time.time()
        return self
        
    async def __aexit__(self, *args):
        if self.session:
            await self.session.close()
    
    async def _rate_limit_check(self):
        """Implementa rate limiting simple"""
        if self.request_count >= self.config.rate_limit:
            elapsed = time.time() - self.start_time
            if elapsed < 3600:  # 1 hora
                sleep_time = 3600 - elapsed
                print(f"⏳ Rate limit alcanzado. Esperando {sleep_time:.0f}s...")
                await asyncio.sleep(sleep_time)
            self.request_count = 0
            self.start_time = time.time()
    
    async def get_shader_ids(
        self, 
        sort: str = "popular",
        from_: int = 0,
        num: int = 100
    ) -> List[str]:
        """
        Obtiene lista de IDs de shaders
        
        Args:
            sort: popular, newest, love, hot
            from_: Offset
            num: Cantidad (max 100)
        """
        await self._rate_limit_check()
        
        url = f"{self.config.base_url}/shaders/query/{sort}"
        params = {
            'key': self.config.api_key,
            'from': from_,
            'num': num
        }
        
        try:
            async with self.session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                self.request_count += 1
                if resp.status == 200:
                    data = await resp.json()
                    results = data.get('Results', [])
                    print(f"✓ Obtenidos {len(results)} IDs de Shadertoy")
                    return results
                else:
                    print(f"✗ Error {resp.status}")
                    return []
        except Exception as e:
            print(f"✗ Error obteniendo IDs: {e}")
            return []
    
    async def get_shader(self, shader_id: str) -> Optional[Dict]:
        """Obtiene detalles completos de un shader"""
        await self._rate_limit_check()
        
        url = f"{self.config.base_url}/shaders/{shader_id}"
        params = {'key': self.config.api_key}
        
        try:
            async with self.session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                self.request_count += 1
                if resp.status == 200:
                    data = await resp.json()
                    return data.get('Shader')
                else:
                    print(f"✗ Error obteniendo shader {shader_id}: {resp.status}")
                    return None
        except Exception as e:
            print(f"✗ Excepción obteniendo shader {shader_id}: {e}")
            return None
    
    async def scrape_batch(self, shader_ids: List[str], save: bool = True) -> List[Dict]:
        """Scrape un lote de shaders en paralelo"""
        tasks = [self.get_shader(sid) for sid in shader_ids]
        shaders = await asyncio.gather(*tasks)
        shaders = [s for s in shaders if s is not None]
        
        if save and shaders:
            self.save_batch(shaders)
        
        return shaders
    
    def save_batch(self, shaders: List[Dict]):
        """Guarda lote en disco"""
        self.config.output_dir.mkdir(parents=True, exist_ok=True)
        
        for shader in shaders:
            try:
                shader_id = shader['info']['id']
                filepath = self.config.output_dir / f"{shader_id}.json"
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(shader, f, indent=2, ensure_ascii=False)
                print(f"  💾 Guardado: {shader_id}")
            except Exception as e:
                print(f"  ✗ Error guardando shader: {e}")
    
    async def scrape_sample(self, num_shaders: int = 5):
        """
        Scrape una muestra pequeña para testing
        """
        print(f"\n🎨 Iniciando scrape de {num_shaders} shaders de ejemplo...")
        
        # IDs de shaders populares para testing (no requieren API key real)
        sample_ids = [
            "MdX3Rr",  # Raymarching Primitives
            "4ssSRl",  # FBM
            "XsX3RB",  # Mandelbrot
            "Ms2SD1",  # Simple Noise
            "lslGzl",  # Voronoi
            "3lsSzf",  # Truchet
            "3dXBz4",  # Shader Art
            "ldScDH",  # Kaleidoscope
            "wltBWr",  # Liquid
            "MdSGzN",  # Fractal
        ]
        
        sample_ids = sample_ids[:num_shaders]
        print(f"📋 Scrapeando {len(sample_ids)} shaders...")
        
        shaders = await self.scrape_batch(sample_ids)
        print(f"✅ Completado: {len(shaders)}/{len(sample_ids)} shaders scrapeados\n")
        
        return shaders

# Script de ejecución
async def main():
    config = ShadertoyConfig()
    
    # Verificar que tenemos la API key
    if config.api_key == "YOUR_SHADERTOY_KEY":
        print("⚠️  ADVERTENCIA: No hay API key configurada")
        print("   Obtén una en: https://www.shadertoy.com/myapps")
        print("   Modificando archivo para usar IDs de ejemplo...\n")
    
    async with ShadertoyScraperBasic(config) as scraper:
        await scraper.scrape_sample(num_shaders=5)

if __name__ == "__main__":
    print("🚀 ShaderForge Shadertoy Scraper v0.1.0\n")
    asyncio.run(main())
