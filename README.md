# Opt Rapid3D Loader for Three.js

## Project Overview

This project is a **high-performance 3D / BIM model web loading and rendering demo application** based on Three.js, developed by 3D Expert Co.,Ltd. It demonstrates the capability of the `OptRapid3dLoader` plugin to load, render, and interact with `.opt` format lightweight 3D / BIM models in the browser.

### Core Features

- **High-Performance Loading**: Multi-worker queue parallel download, supports 10GB+ ultra-large models
- **Block Rendering Technology**: Reduces Draw Call, instanced rendering + frustum culling + LOD multi-level data loading
- **Rich Interaction**: Six operations including component picking, color modification, visibility control, transparency setting, offset, and rotation
- **Property Query**: Click components to query BIM property data and type data
- **Multi-Format Export Support**: 9 professional export plugins for Revit, Bentley, Tekla, Navisworks, SketchUp, Civil3D, etc.
- **Lightweight Technology**: Draco compression, floating-point compression, automatic mesh reduction

### Supported Model Formats

- `.opt` — 3D Expert proprietary lightweight model format
- Supports standard formats like `.glb` / `.gltf` / `3DTiles`

---

## Tech Stack

| Category | Technology | Version |
|------|------|------|
| Frontend Framework | Vue 3 | ^3.2.45 |
| Build Tool | Vite | ^4.1.0 |
| Development Language | TypeScript | ^4.9.3 |
| 3D Engine | Three.js | ^0.184.0 (requires >= 0.170) |
| Core Loader | opt-rapid3d-loader (npm package) | Free npm package |
| UI Framework | Ant Design Vue | ^4.2.1 |
| State Management | Pinia | ^2.0.29 |
| Router | Vue Router 4 | 4.x |
| CSS Preprocessor | Less | ^4.1.3 |
| HTTP Client | Native fetch | — |
| Color Picker | vue3-colorpicker | ^2.3.0 |
| Progress Bar | NProgress | ^0.2.0 |
| File Saving | file-saver | ^2.0.5 |

---

## Project Directory Structure

```
├── public/                                # Static assets (not processed by Vite)
│   ├── bimlogo.ico                        # Website icon
│   ├── README.md                          # OptRapid3dLoader API detailed documentation
│   └── static/
│       ├── config.json                    # ⭐ Runtime configuration (backend address, model name)
│       ├── Opt Rapid3D Loader for Three.js.zip  # Source code download package
│       └── libs/                          # Three.js decoder libraries
│           ├── draco/                     # Draco geometry compression decoder
│           ├── basis/                     # Basis texture transcoder
│           └── rhino3dm/                  # Rhino 3DM model parser
├── src/                                   # Source code
│   ├── main.ts                            # Application entry (loads config.json before mounting)
│   ├── App.vue                            # Root component (Ant Design global theme config)
│   ├── style.less                         # Global styles (dark theme UI)
│   ├── api/
│   │   └── index.ts                       # API interfaces (component property queries)
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
│   │   └── (opt-rapid3d-loader imported from npm package)
│   └── views/
│       ├── index.vue                      # Main page (3D scene + left toolbar)
│       └── panels/                        # Interaction panels
│           ├── AttributePanel.vue         # Component property panel
│           ├── ColorPanel.vue             # Component color panel
│           ├── VisiblePanel.vue           # Component visibility panel
│           ├── AlphaPanel.vue             # Component transparency panel
│           ├── OffsetPanel.vue            # Component offset panel
│           └── RotatePanel.vue            # Component rotation panel
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
# or
yarn install
```

### Configure Backend Address

Edit `public/static/config.json` to set the backend API address and model name:

```json
{
  "baseUrl": "http://localhost:18084",
  "modelName": "Example"
}
```

> **Important**: The application will first fetch `config.json` at startup, inject the configuration into the Pinia Store, and then mount the Vue application. Modifying this file after deployment does not require rebuilding.

### Development Run

```bash
npm run dev
# or
yarn dev
```

- Development server port: **18083**
- Access URL: `http://localhost:18083`
- API proxy: Requests with `/api` prefix will be proxied to `baseUrl` in `config.json`

### Production Build

```bash
npm run build
# or
yarn build
```

Build artifacts are output to the `./dist` directory.

### Preview Build Result

```bash
npm run preview
# or
yarn preview
```

### Static File Server

```bash
node static-server.js
```

Provides static file service for the `/static` directory on port **18084**.

---

## NodeAPI Backend Service

The project includes a backend API service based on Express + SQLite (located in the `nodeApi/` directory), which reads model `.db` database files and provides data interfaces for frontend component property queries, floor structure, professional structure, and other features.

### Directory Structure

```
nodeApi/
├── server.js          # API service main file
├── package.json       # Dependency configuration
├── start.bat          # Windows one-click startup script
└── README.md          # API documentation
```

### Database Path Description

The API service reads model database files from the `WebPage/public/static/OutputModel/` directory by default. Each model corresponds to a subdirectory named after the model name, which contains a `.db` file with the same name as the model:

```
WebPage/public/static/OutputModel/
└── Example/                  # Model name is "Example"
    ├── Example.db            # Model database file
    ├── root.opt              # Model geometry file
    ├── instance.json
    └── ...
```

To modify the database path, edit the `OUTPUT_MODEL_PATH` constant in `nodeApi/server.js`.

### Environment Requirements

- **Node.js** >= 16.x

### Installation and Startup

#### Method 1: Use Startup Script (Windows)

Double-click `nodeApi/start.bat`, the script will automatically check the Node.js environment, install dependencies, and start the service.

#### Method 2: Manual Startup

```bash
# Enter nodeApi directory
cd nodeApi

# Install dependencies (first run)
npm install

# Start service (default port 18084)
node server.js

# Or specify port
node server.js --port=18084
# or
node server.js -p 18084
```

After successful startup, you will see:

```
Model database path: ...\WebPage\public\static\OutputModel
Server address: http://localhost:18084
Vue project static files mounted: ...\WebPage
SQLite API server started
Model database path: ...\WebPage\public\static\OutputModel
Access URL: http://localhost:18084
```

### API Endpoint List

All interfaces are GET requests, parameters are passed through Query String.

| Endpoint | Path | Required Parameters | Optional Parameters | Description |
|------|------|---------|---------|------|
| Floor Structure Data | `/api/app/model/GetFloorStructureData` | `lightweightName` | `pid` | Get model tree (model_tree) data, pid defaults to '0' (root node) |
| Floor Component IDs | `/api/app/model/GetModelTreeFeatureIdByPid` | `lightweightName` | `pid` | Recursively get externalId of a node and all child nodes in the model tree |
| Professional Structure Data | `/api/app/model/GetProfessionalStructureData` | `lightweightName` | `pid` | Get professional classification (model_type) data, pid defaults to '0' |
| Professional Component IDs | `/api/app/model/GetModelTypeFeatureIdByPid` | `lightweightName` | `pid` | Recursively get externalId of a node and all child nodes in professional classification |
| Component Property Data | `/api/app/model/GetPropertyDataByExternalId` | `lightweightName`, `externalId` | — | Query complete property data of components by externalId |

### API Call Examples

```bash
# Get floor structure of Example model (root node)
curl "http://localhost:18084/api/app/model/GetFloorStructureData?lightweightName=Example"

# Get floor structure under node with pid=1 in Example model
curl "http://localhost:18084/api/app/model/GetFloorStructureData?lightweightName=Example&pid=1"

# Get professional classification structure of Example model
curl "http://localhost:18084/api/app/model/GetProfessionalStructureData?lightweightName=Example"

# Recursively get all component externalIds under a floor node
curl "http://localhost:18084/api/app/model/GetModelTreeFeatureIdByPid?lightweightName=Example&pid=1"

# Query component properties by externalId
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

- `baseUrl`: Access address of the NodeAPI service
- `modelName`: The model name to load, must match the subdirectory name under `OutputModel/`

### Place Custom Models

1. Use OptFileGenerator desktop converter (download from https://www.opt3ds.com/) to convert 3D/BIM models to `.opt` + `.db` format
2. Place the output files into the `WebPage/public/static/OutputModel/{modelName}/` directory
3. Ensure the `.db` file name matches the model folder name (e.g., `MyModel/MyModel.db`)
4. Modify `modelName` in `config.json` to the new model name
5. Refresh the frontend page to load

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
| `modelName` | Model name to load (corresponds to the model folder under backend OutputModel directory) | `Example` |

### Model Loading Path

The application will automatically concatenate the model loading address based on the configuration:

```
{baseUrl}/OutputModel/{modelName}/root.opt
```

For example, when configured as `baseUrl: http://localhost:18084`, `modelName: Example`, the loading path is:
`http://localhost:18084/OutputModel/Example/root.opt`

---

## Core Features

### Page Structure

The application is a single page, consisting of a 3D scene + left toolbar:

- **Left Toolbar**: 6 function buttons, click to open corresponding floating operation panels
- **3D Scene**: Model view rendered by Three.js, supports mouse rotation/zoom/pan (OrbitControls)

### Six Interaction Panels

| Panel | Function | Interaction Method |
|------|------|---------|
| **Component Properties** | Click component to query property data and type data, displayed in two tabs | Click to pick → highlight component (yellow) → API query properties → table display |
| **Component Color** | Modify component color through color picker | Click to pick → pop up color selection dialog → confirm coloring |
| **Component Visibility** | Hide/show specified components | Click to pick automatically hides → list management → switch toggle |
| **Component Transparency** | Set component transparency (0~1) | Click to pick → dialog input transparency → confirm effect |
| **Component Offset** | Offset components along X/Y/Z axes (-10~10m) | Click to pick highlight → slider control offset |
| **Component Rotation** | Rotate components along X/Y/Z axes (0~360°) | Click to pick highlight → slider control rotation angle |

> All panels will automatically restore components to original state when closed.

---

## OptRapid3dLoader API Documentation

The core loader is now available as an npm package `opt-rapid3d-loader`. Install it via `npm install opt-rapid3d-loader` and import from `'opt-rapid3d-loader'`. Detailed API documentation is in `public/README.md`.

### Installation

```bash
npm install opt-rapid3d-loader
```

### Import

```javascript
import OptRapid3dLoader from 'opt-rapid3d-loader';
```

### Constructor Parameters

```javascript
new OptRapid3dLoader({
  renderer,   // WebGLRenderer - Three.js renderer
  camera,     // Camera - Three.js camera
  parent,     // Scene/Group - Scene container
  libs,       // String - Decoder file directory (default using CDN)
  url,        // String - .opt format model path
  callback    // Function - Loading completion callback
})
```

### Interaction Interfaces (loader.interface)

| Method | Parameters | Description |
|------|------|------|
| `pick({ position })` | `position: Vector2` | Component picking (mouse coordinates) |
| `setColor({ featureIds, type, color })` | `type: 0=mixed, 1=replace` | Set component color |
| `setVisible({ featureIds, visible })` | `visible: boolean` | Set component visibility |
| `setAlpha({ featureIds, color, alpha })` | `alpha: 0~1` | Set component transparency |
| `offset({ featureIds, x, y, z })` | `x/y/z: offset value (m)` | Component offset |
| `clearOffset({ featureIds })` | — | Clear offset |
| `rotate({ featureIds, x, y, z, angle })` | `angle: degrees` | Component rotation |
| `clearRotate({ featureIds })` | — | Clear rotation |
| `zoomTo({ featureIds })` | — | Component positioning (camera flies to component position) |
| `update()` | — | Update per frame (needs to be called in animation loop) |
| `dispose()` | — | Destroy and release resources |

### Usage Example

```javascript
import * as THREE from 'three'
import OptRapid3dLoader from 'opt-rapid3d-loader'

// Create scene
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000)
const renderer = new THREE.WebGLRenderer({ antialias: true })

// Load model
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

// Component picking
loader.interface.pick({ position: new THREE.Vector2(x, y) })

// Set component color
loader.interface.setColor({ featureIds: ['id1'], type: 1, color: '#ff0000' })

// Component positioning
loader.interface.zoomTo({ featureIds: ['id1'] })
```

---

## API Interface Documentation

The project encapsulates backend API requests through `src/api/index.ts`:

| Interface | Path | Description |
|------|------|------|
| `getPropertiesStation` | `/api/app/model/GetPropertyDataByExternalId` | Query component property data by externalId |

### Request Mechanism

- **Development environment**: API requests are proxied to `baseUrl` in `config.json` via `/api` prefix
- **Production environment**: Directly use the full `baseUrl` address in `config.json`
- HTTP client uses native `fetch` (`src/utils/request.ts`)

---

## Deployment Guide

### 1. Build Production Version

```bash
npm run build
```

### 2. Deploy Files

Deploy the `dist/` directory to a web server, ensuring the directory structure is as follows:

```
Deployment root directory/
├── index.html                     # Entry page
├── assets/                        # Built JS/CSS resources
└── static/                        # Static resources (must be preserved)
    ├── config.json                # ⭐ Runtime configuration (modify per actual environment)
    ├── libs/                      # Decoder libraries
    └── ...
```

### 3. Modify Configuration

Modify `baseUrl` in `static/config.json` to the actual backend service address, and `modelName` to the model name to load.

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

    # Static resource caching
    location /static/ {
        expires 7d;
    }
}
```

> This project uses Hash mode for routing, so no additional route fallback configuration is required for normal operation.

---

## Development Conventions

- **Path Alias**: `@` maps to `./src` directory
- **Auto Import**: Vue APIs (`ref`, `computed`, `onMounted`, etc.) are automatically imported via `unplugin-auto-import`, no manual import needed
- **Auto Component Registration**: Ant Design Vue components are loaded on demand via `unplugin-vue-components` + `AntDesignVueResolver`
- **UI Style**: Global dark translucent theme, visually integrated with the 3D scene
- **Panel Interaction**: Operation panels are presented as Ant Design `notification` components, floating on the right side of the 3D scene

---

## FAQ

### Q: Page is blank or model cannot be loaded after startup?

1. Check if `baseUrl` in `public/static/config.json` points to the correct backend service address
2. Ensure the backend service has started and is accessible
3. Confirm that the model files corresponding to `modelName` exist in the backend `OutputModel` directory
4. Check the browser console for CORS errors in network requests

### Q: Three.js version requirement?

OptRapid3dLoader requires **three >= 0.170**, the current project installs ^0.184.0, which meets the requirement.

### Q: How to load other models?

Modify `modelName` in `public/static/config.json` to the target model name and refresh the page.

### Q: How to configure libs decoder path?

Default is `./static/libs/`, which is the project `public/static/libs/` directory. To use CDN, modify the `libs` parameter in the `OptRapid3dLoader` constructor to the CDN address.

---

## Related Links

- [Three.js Documentation](https://threejs.org/)
- [Vue 3 Documentation](https://vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Ant Design Vue Documentation](https://antdv.com/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- 3D Expert official website: [https://www.opt3ds.com/](https://www.opt3ds.com/)
- OptRapid3dLoader npm package: [https://www.npmjs.com/package/opt-rapid3d-loader](https://www.npmjs.com/package/opt-rapid3d-loader)

---

## License

- OptRapid3dLoader npm package is free to use
- OptFileGenerator desktop converter is charged by model conversion volume, see 3D Expert official website EULA for details
- Project includes NASA AMMOS's 3DTilesRendererJS component (Apache 2.0 License)
