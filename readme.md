# Folio 2025

## Setup

Create `.env` file based on `.env.example`

Download and install [Node.js](https://nodejs.org/en/download/) then run this followed commands:

``` bash
# Install dependencies
npm install

# Serve at localhost:1234
npm run dev

# Build for production in the dist/ directory
npm run build
```

## Tick order

| Order | Components |
|---|---|
| 0 | Inputs |
| 1 | Vehicle (pre Physics) |
| 2 | Physics |
| 3 | Entities |
| 4 | View |
| 5 | Vehicle (post Physics) |
| 6 | PhysicsWireframe |
| 7 | Lighting |
| 8 | GroundData |
| 9 | Grass |
| 10 | BlackFriday |
| 11 | BricksWalls |
| 12 | Sounds |
| 998 | Rendering |
| 999 | Monitoring |

## Blender

### Export

- Mute the palette texture node (loaded and set in Three.js `Material` directly)
- Use corresponding export presets
- Don't use compression (will be done later)

### Compress

Run `npm run compress`

#### GLB

- Traverse the `static/` folder looking for glb files (ignoring already compressed files)
- Compress embeded texture with `etc1s --quality 255` (lossy, GPU friendly)
- Generate new files to preserve originals


#### Texture files

- Traverse the `static/` folder looking for `png|jpg` files (ignoring non-model related folders)
- Compress with default preset to `--encode etc1s --qlevel 255` (lossy, GPU friendly) or specific preset (check file)
- Generate new files to preserve originals

#### UI files

- TODO

#### Resources

- https://gltf-transform.dev/cli
- https://github.com/KhronosGroup/KTX-Software?tab=readme-ov-file
- https://github.khronos.org/KTX-Software/ktxtools/toktx.html