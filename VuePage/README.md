# Opt Rapid3D Loader for Three.js — Vue Demo

## Project Introduction

This project is a **high-performance web-based loading and rendering demo application for 3D / BIM models** built on Three.js, developed by 3D Expert Co., Ltd. It demonstrates the capability of the `OptRapid3dLoader` plugin to load, render, and interact with `.opt` format lightweight 3D / BIM models in the browser.

### Core Features

- **High-performance loading**: Multi-Worker queue parallel downloading, supporting ultra-large models up to 10G level
- **Chunk rendering technology**: Reduces Draw Calls, instanced rendering + frustum culling + LOD multi-level data loading
- **Rich interaction**: Six major operations — feature picking, color modification, visibility control, transparency setting, offset, and rotation
- **Property query**: Click a feature to query BIM property data and type data
- **Multi-format export support**: 9 professional export plugins including Revit, Bentley, Tekla, Navisworks, SketchUp, Civil3D, etc.
- **Lightweight technology**: Draco compression, floating-point compression, automatic mesh decimation

### Supported Model Formats

- `.opt` — 3D Expert's proprietary lightweight model format
- Supports standard formats such as `.glb` / `.gltf` / `3DTiles`

---

## Tech Stack

| Category | Technology | Version |
|------|------|------|
| Frontend framework | Vue 3 | ^3.2.45 |
| Build tool | Vite | ^4.1.0 |
| Development language | TypeScript | ^4.9.3 |
| 3D engine | Three.js | ^0.184.0 (requires >= 0.170) |
| Core loader | OptRapid3dLoader.js | In-house (389KB) |
| UI framework | Ant Design Vue | ^4.2.1 |
| State management | Pinia | ^2.0.29 |
| Routing | Vue Router 4 | 4.x |
| CSS preprocessor | Less | ^4.1.3 |
| HTTP client | Native fetch | — |
| Color picker | vue3-colorpicker | ^2.3.0 |
| Progress bar | NProgress | ^0.2.0 |
| File saving | file-saver | ^2.0.5 |

---

## Project Directory Structure

```
├── public/                                # Static assets (not processed by Vite)
│   ├── bimlogo.ico                        # Website icon
│   └── static/
│       ├── config.json                    # ⭐ Runtime configuration (backend address, model name)
│       └── libs/                          # Three.js decoder libraries
│           ├── draco/                     # Draco geometry compression decoder
│           ├── basis/                     # Basis texture transcoder
│           └── rhino3dm/                  # Rhino 3DM model parsing
├── src/                                   # Source code
│   ├── main.ts                            # Application entry (loads config.json first, then mounts)
│   ├── App.vue                            # Root component (Ant Design global theme configuration)
│   ├── style.less                         # Global styles (dark theme UI)
│   ├── api/
│   │   └── index.ts                       # API endpoints (feature property query)
│   ├── components/
│   │   ├── Modal.vue                      # Draggable modal component
│   │   └── colorPicker.vue                # Color picker component
│   ├── global/
│   │   ├── index.ts                       # Global registration entry
│   │   └── register-properties.ts         # Global property registration ($api)
│   ├── router/
│   │   └── index.ts                       # Router configuration (SPA Hash mode)
│   ├── store/
│   │   ├── index.ts                       # Pinia instance (with persistence plugin)
│   │   └── modules/model.ts              # Model state (baseUrl, modelName, etc.)
│   ├── utils/
│   │   ├── request.ts                     # HTTP request wrapper (native fetch)
│   │   └── OptRapid3dLoader.js            # ⭐ Core model loading engine (389KB)
│   └── views/
│       ├── index.vue                      # Main page (3D scene + left toolbar)
│       └── panels/                        # Interaction panels
│           ├── AttributePanel.vue         # Feature properties panel
│           ├── ColorPanel.vue             # Feature color panel
│           ├── VisiblePanel.vue           # Feature show/hide panel
│           ├── AlphaPanel.vue             # Feature transparency panel
│           ├── OffsetPanel.vue            # Feature offset panel
│           └── RotatePanel.vue            # Feature rotation panel
├── env/                                   # Environment variable configuration
│   ├── .env                               # Common
│   ├── .env.development                   # Development environment
│   └── .env.production                    # Production environment
├── index.html                             # HTML entry
├── package.json                           # Project configuration
├── vite.config.ts                         # Vite build configuration
├── static-server.js                       # Express static file server
├── tsconfig.json                          # TypeScript configuration
└── tsconfig.node.json                     # Node TypeScript configuration
```

---

## Quick Start

### Environment Requirements

- **Node.js** >= 16.x
- **npm** or **Yarn**

### Install Dependencies

```bash
npm install
# Or
yarn install
```

### Configure the Backend Address

Edit `public/static/config.json` to set the backend API address and model name:

```json
{
  "baseUrl": "http://localhost:18084",
  "modelName": "Example"
}
```

> **Important**: When the application starts, it first fetches `config.json`, injects the configuration into the Pinia Store, and then mounts the Vue application. After deployment, modifying this file requires no rebuild.

### Development Run

```bash
npm run dev
# Or
yarn dev
```

- Development server port: **18083**
- Access address: `http://localhost:18083`
- API proxy: requests with the `/api` prefix are proxied to the `baseUrl` in `config.json`

### Production Build

```bash
npm run build
# Or
yarn build
```

Build output goes to the `./dist` directory.

### Preview the Build Result

```bash
npm run preview
# Or
yarn preview
```

### Static File Server

```bash
node static-server.js
```

Serves static files from the `/static` directory on port **18084**.

---

## NodeAPI Backend Service

The project ships with a backend API service based on Express + SQLite (located in the `nodeApi/` directory), used to read model `.db` database files and provide data endpoints for the frontend's feature property query, floor structure, professional structure, and other functions.

### Directory Structure

```
nodeApi/
├── server.js          # Main API service file
├── package.json       # Dependency configuration
├── start.bat          # Windows one-click startup script
└── README.md          # Legacy API documentation
```

### Database Path Description

The API service reads model database files from the `VuePage/public/static/OutputModel/` directory by default. Each model corresponds to a subdirectory named after the model, which contains a `.db` file with the same name as the model:

```
VuePage/public/static/OutputModel/
└── Example/                  # The model name is "Example"
    ├── Example.db            # Model database file
    ├── root.opt              # Model geometry file
    ├── instance.json
    └── ...
```

To change the database path, edit the `OUTPUT_MODEL_PATH` constant in `nodeApi/server.js`.

### Environment Requirements

- **Node.js** >= 16.x

### Installation and Startup

#### Method 1: Using the Startup Script (Windows)

Double-click `nodeApi/start.bat`. The script will automatically check the Node.js environment, install dependencies, and start the service.

#### Method 2: Manual Startup

```bash
# Enter the nodeApi directory
cd nodeApi

# Install dependencies (first run)
npm install

# Start the service (default port 18084)
node server.js

# Or specify a port
node server.js --port=18084
# Or
node server.js -p 18084
```

After a successful startup you will see:

```
Model database path: ...\VuePage\public\static\OutputModel
Server started at: http://localhost:18084
Static resources mounted: ...\VuePage\public
Vue project static files mounted: ...\VuePage\dist
SQLite API server started
Model database path: ...\VuePage\public\static\OutputModel
Access address: http://localhost:18084
```

### API Endpoint List

All endpoints are GET requests, with parameters passed via Query String.

| Endpoint | Path | Required Params | Optional Params | Description |
|------|------|---------|---------|------|
| Floor structure data | `/api/app/model/GetFloorStructureData` | `lightweightName` | `pid` | Get the model tree (model_tree) data; pid defaults to '0' (root node) |
| Floor feature IDs | `/api/app/model/GetModelTreeFeatureIdByPid` | `lightweightName` | `pid` | Recursively get the externalId of a node and all its child nodes under the model tree |
| Professional structure data | `/api/app/model/GetProfessionalStructureData` | `lightweightName` | `pid` | Get the professional classification (model_type) data; pid defaults to '0' |
| Professional feature IDs | `/api/app/model/GetModelTypeFeatureIdByPid` | `lightweightName` | `pid` | Recursively get the externalId of a node and all its child nodes under the professional classification |
| Feature property data | `/api/app/model/GetPropertyDataByExternalId` | `lightweightName`, `externalId` | — | Query the complete property data of a feature by externalId |

### API Call Examples

```bash
# Get the floor structure of the Example model (root node)
curl "http://localhost:18084/api/app/model/GetFloorStructureData?lightweightName=Example"

# Get the floor structure under the node with pid=1 in the Example model
curl "http://localhost:18084/api/app/model/GetFloorStructureData?lightweightName=Example&pid=1"

# Get the professional classification structure of the Example model
curl "http://localhost:18084/api/app/model/GetProfessionalStructureData?lightweightName=Example"

# Recursively get all feature externalIds under a floor node
curl "http://localhost:18084/api/app/model/GetModelTreeFeatureIdByPid?lightweightName=Example&pid=1"

# Query feature properties by externalId
curl "http://localhost:18084/api/app/model/GetPropertyDataByExternalId?lightweightName=Example&externalId=12345"
```

### Frontend Configuration

After starting the NodeAPI service, you need to point the frontend configuration to the service address. Edit `public/static/config.json`:

```json
{
  "baseUrl": "http://localhost:18084",
  "modelName": "Example"
}
```

- `baseUrl`: The access address of the NodeAPI service
- `modelName`: The name of the model to load, which must match the subfolder name under the `OutputModel/` directory

### Placing Custom Models

1. Use the OptFileGenerator desktop conversion program to convert 3D/BIM models to `.opt` + `.db` format
2. Put the output files into the `VuePage/public/static/OutputModel/{model name}/` directory
3. Make sure the `.db` file name matches the model folder name (e.g. `MyModel/MyModel.db`)
4. Change `modelName` in `config.json` to the new model name
5. Refresh the frontend page to load it

---

## Runtime Configuration

Configuration file path: `public/static/config.json`

```json
{
  "baseUrl": "http://localhost:18084",
  "modelName": "Example"
}
```

| Configuration Item | Description | Default Value |
|-------|------|--------|
| `baseUrl` | Backend API service address | `http://localhost:18084` |
| `modelName` | The name of the model to load (corresponding to the model folder under the backend OutputModel directory) | `Example` |

### Model Loading Path

The application automatically concatenates the model loading address based on the configuration:

```
{baseUrl}/static/OutputModel/{modelName}/root.opt
```

For example, with `baseUrl: http://localhost:18084` and `modelName: Example`, the loading path is:
`http://localhost:18084/static/OutputModel/Example/root.opt`

---

## Core Feature Description

### Page Structure

The application is a single page consisting of a 3D scene + left toolbar:

- **Left toolbar**: 7 function buttons (6 interaction panels + open official website); clicking opens the corresponding floating operation panel
- **3D scene**: The model view rendered by Three.js, supporting mouse rotate/zoom/pan (OrbitControls)

### Six Major Interaction Panels

| Panel | Function | Interaction Method |
|------|------|---------|
| **Feature Properties** | Click a feature to query property data and type data, displayed in two tabs | Click to pick → highlight the feature (yellow) → API property query → table display |
| **Feature Color** | Modify the feature color via the color picker | Click to pick → color selection dialog pops up → confirm coloring |
| **Show/Hide** | Hide/show specified features | Click to pick to auto-hide → manage in the list → toggle via switch |
| **Transparency** | Set feature transparency (0~1) | Click to pick → enter transparency in the dialog → confirm to take effect |
| **Offset** | Offset a feature along the X/Y/Z axes (-10~10m) | Click to pick and highlight → control the offset via sliders |
| **Rotate** | Rotate a feature along the X/Y/Z axes (0~360°) | Click to pick and highlight → control the rotation angle via sliders |

> When any panel is closed, the features automatically restore to their original state.

---

## OptRapid3dLoader API Description

The core loader `src/utils/OptRapid3dLoader.js` provides the following interfaces:

### Constructor Parameters

```javascript
new OptRapid3dLoader({
  renderer,   // WebGLRenderer - Three.js renderer
  camera,     // Camera - Three.js camera
  parent,     // Scene/Group - scene container
  libs,       // String - decoder file directory (uses CDN by default)
  url,        // String - path of the .opt format model
  callback    // Function - callback when loading completes
})
```

### Interaction Interfaces (loader.interface)

| Method | Parameters | Description |
|------|------|------|
| `pick({ position })` | `position: Vector2` | Feature picking (mouse coordinates) |
| `setColor({ featureIds, type, color })` | `type: 0=blend, 1=replace` | Set feature color |
| `setVisible({ featureIds, visible })` | `visible: boolean` | Set feature visibility |
| `setAlpha({ featureIds, color, alpha })` | `alpha: 0~1` | Set feature transparency |
| `offset({ featureIds, x, y, z })` | `x/y/z: offset(m)` | Feature offset |
| `clearOffset({ featureIds })` | — | Clear offset |
| `rotate({ featureIds, x, y, z, angle })` | `angle: degrees` | Feature rotation |
| `clearRotate({ featureIds })` | — | Clear rotation |
| `zoomTo({ featureIds })` | — | Feature positioning (camera flies to the feature position) |
| `update()` | — | Per-frame update (must be called in the animation loop) |
| `dispose()` | — | Destroy and release resources |

### Usage Example

```javascript
import * as THREE from 'three'
import OptRapid3dLoader from '@/utils/OptRapid3dLoader'

// Create the scene
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000)
const renderer = new THREE.WebGLRenderer({ antialias: true })

// Load the model
const loader = new OptRapid3dLoader({
  renderer,
  camera,
  parent: scene,
  libs: './static/libs/',
  url: 'http://localhost:18084/OutputModel/Example/root.opt',
  callback: () => {
    console.log('Model loading completed')
  }
})

// Animation loop
function animate() {
  requestAnimationFrame(animate)
  controls.update()
  loader.interface.update()
  renderer.render(scene, camera)
}

// Feature picking
loader.interface.pick({ position: new THREE.Vector2(x, y) })

// Set the feature color
loader.interface.setColor({ featureIds: ['id1'], type: 1, color: '#ff0000' })

// Feature positioning
loader.interface.zoomTo({ featureIds: ['id1'] })
```

---

## API Endpoint Description

The project wraps backend API requests via `src/api/index.ts`:

| Endpoint | Path | Description |
|------|------|------|
| `getPropertiesStation` | `/api/app/model/GetPropertyDataByExternalId` | Query feature property data by externalId |

### Request Mechanism

- **Development environment**: API requests with the `/api` prefix are proxied to the `baseUrl` in `config.json`
- **Production environment**: The full `baseUrl` address from `config.json` is used directly
- The HTTP client uses native `fetch` (`src/utils/request.ts`)

---

## Deployment Guide

### 1. Build the Production Version

```bash
npm run build
```

### 2. Deploy Files

Deploy the `dist/` directory to the web server, ensuring the directory structure is as follows:

```
Deployment root directory/
├── index.html                     # Entry page
├── assets/                        # Built JS/CSS assets
└── static/                        # Static assets (must be kept)
    ├── config.json                # ⭐ Runtime configuration (modify according to the actual environment)
    ├── libs/                      # Decoder libraries
    └── ...
```

### 3. Modify the Configuration

Change `baseUrl` in `static/config.json` to the actual backend service address, and `modelName` to the name of the model to load.

### 4. Nginx Configuration Reference

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    # SPA route fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static asset caching
    location /static/ {
        expires 7d;
    }
}
```

> This project's router uses Hash mode, so the route fallback configuration above is not required for it to work correctly.

---

## Development Conventions

- **Path alias**: `@` maps to the `./src` directory
- **Auto import**: Vue APIs (`ref`, `computed`, `onMounted`, etc.) are auto-imported via `unplugin-auto-import`, no manual import needed
- **Component auto registration**: Ant Design Vue components are loaded on demand via `unplugin-vue-components` + `AntDesignVueResolver`
- **UI style**: The global dark semi-transparent theme is used, visually blended with the 3D scene
- **Panel interaction**: Operation panels are presented as Ant Design `notification` components, floating on the right side of the 3D scene

---

## FAQ

### Q: The page is blank after startup or the model fails to load?

1. Check whether the `baseUrl` in `public/static/config.json` points to the correct backend service address
2. Make sure the backend service is started and accessible
3. Confirm that the model files corresponding to `modelName` exist in the backend `OutputModel` directory
4. Check the browser console network requests for cross-origin errors

### Q: What is the Three.js version requirement?

OptRapid3dLoader requires **three >= 0.170**; the currently installed version in this project is ^0.184.0, which meets the requirement.

### Q: How do I load other models?

Change `modelName` in `public/static/config.json` to the target model name and refresh the page.

### Q: How do I configure the libs decoder path?

The default is `./static/libs/`, i.e. the project's `public/static/libs/` directory. To use a CDN, modify `libs` to the CDN address in the `OptRapid3dLoader` constructor parameters.

---

## Related Links

- [Three.js Documentation](https://threejs.org/)
- 3D Expert official website: [www.opt3ds.com](https://www.opt3ds.com)

---

## License

- The OptRapid3dLoader JS package is free to use
- The desktop conversion program is charged per model conversion; see the EULA on the 3D Expert official website
- The project includes the 3DTilesRendererJS component from NASA AMMOS (Apache 2.0 license)
