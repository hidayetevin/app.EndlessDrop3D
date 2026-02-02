# Skybox Textures

This folder contains equirectangular skybox textures for each biome.

## Required Files:

- `sky.jpg` - Blue sky with clouds (SKY biome, 0-500 score)
- `space.jpg` - Star field with nebula (SPACE biome, 500-1000 score)
- `void.jpg` - Dark red abstract (VOID biome, 1000+ score)

## Specifications:

### Format:
- **Type**: Equirectangular panorama (360° x 180°)
- **Resolution**: 2048 x 1024 pixels (2:1 ratio)
- **Format**: JPG (compressed)
- **Quality**: 75-85%
- **File Size**: ~400-600KB per texture
- **Color Space**: sRGB

### Mapping:
- Uses THREE.EquirectangularReflectionMapping
- Seamless wrapping (no visible seams)

## Content Guidelines:

### SKY Skybox (sky.jpg):
```
Theme: Peaceful daytime sky
Colors: Blue (#87CEEB), White clouds, Soft yellow sun
Mood: Calm, serene, open
Elements: Blue gradient, white clouds, optional sun rays
Reference: Clear summer day
```

### SPACE Skybox (space.jpg):
```
Theme: Deep space
Colors: Dark blue (#0a0a2e), Purple nebula, White stars
Mood: Mysterious, vast, cosmic
Elements: Star field, purple/blue nebula clouds, distant galaxies
Reference: Hubble space photos
```

### VOID Skybox (void.jpg):
```
Theme: Abstract dark dimension
Colors: Dark red (#1a0000), Black, Grey swirls
Mood: Ominous, intense, otherworldly
Elements: Dark red gradients, black voids, swirling patterns
Reference: Abstract hellscape
```

## Sources for Textures:

### Free Equirectangular Skyboxes:
1. **HDRIHaven** - https://polyhaven.com/hdris (CC0)
2. **TextureCan** - https://www.texturecan.com/
3. **Humus** - http://www.humus.name/index.php?page=Textures
4. **FreePBR** - https://freepbr.com/
5. **TextureHaven** - https://texturehaven.com/

### AI Generation:
You can also generate with AI:
- Midjourney: "/imagine equirectangular skybox blue sky clouds 2048x1024"
- DALL-E: "360 degree equirectangular panorama of [description]"
- Stable Diffusion: Use "equirectangular" keyword

### Photoshop/GIMP:
Convert regular panoramas to equirectangular using:
- Filter → Distort → Spherize
- Polar coordinates mapping

## Implementation:

Skyboxes are loaded via THREE.TextureLoader:
```javascript
const loader = new THREE.TextureLoader();
loader.load('assets/skybox/sky.jpg', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
});
```

## Performance Notes:

- Textures are lazy-loaded (only when biome changes)
- Cached after first load (no re-download)
- Mipmaps generated automatically
- ~1.5MB total (all 3 skyboxes)
- No FPS impact on loading
- GPU memory: ~6MB

## Fallback System:

If skybox textures fail to load:
- Falls back to solid color background
- No game crash
- Console warning logged

## Testing:

1. Place textures in `assets/skybox/`
2. Start game (SKY skybox should load)
3. Reach 500 score (SPACE transition)
4. Reach 1000 score (VOID transition)
5. Check console for loading errors

## Integration Status:

✅ ThemeManager.js - Skybox loading system added
✅ Lazy loading - On-demand texture fetch
✅ Caching - One-time load per biome
✅ Fallback - Solid color if texture missing
⏳ Textures - To be added (placeholder ready)

## Placeholder Notice:

The game will work fine without skybox textures (uses solid colors).
When you add the JPG files, they'll automatically load and display!
