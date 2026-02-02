# Background Music Assets

This folder contains background music for each biome.

## Required Files:

- `sky.mp3` - Calm ambient music for SKY biome (0-500 score)
- `space.mp3` - Electronic ambient for SPACE biome (500-1000 score)  
- `void.mp3` - Dark drone music for VOID biome (1000+ score)

## Specifications:

- Format: MP3 (320kbps recommended)
- Loop: Seamless loop (start/end must align)
- Duration: 60-120 seconds recommended
- Volume: Normalized to -14 LUFS
- License: CC0 / Royalty-Free

## Recommended Sources:

- **FreeMusicArchive** - https://freemusicarchive.org/
- **Incompetech** - https://incompetech.com/music/royalty-free/
- **Purple Planet Music** - https://www.purple-planet.com/
- **Pixabay Music** - https://pixabay.com/music/

## Temporary Placeholder:

For testing, you can use silent/minimal audio files or any royalty-free music.
The game will work fine without music files (won't crash), just won't play background music.

## Implementation:

Music is loaded via THREE.AudioLoader and managed by AudioManager.js:
- Lazy loading (only when needed)
- Caching (loaded once, reused)
- Crossfade transitions (2 second smooth fade)
- Volume control via settings

## Integration Status:

✅ AudioManager.js - THREE.Audio system integrated
✅ ThemeManager.js - Crossfade on biome change
✅ main.js - Dependency injection configured
⏳ Music files - To be added (placeholder ready)
