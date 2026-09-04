# Opt Rapid3D Loader for Three.js

A collection of high-performance web-based 3D / BIM model loading and rendering demos built on Three.js (by 3D Expert), demonstrating the capability of the `OptRapid3dLoader` plugin to load, render, and interact with `.opt` lightweight 3D / BIM models in the browser.

## Directory Structure

```
├── nodeApi/      # Backend API service (Node.js + Express + SQLite)
├── VuePage/      # Vue 3 frontend demo (main project)
└── ReactPage/    # React 18 frontend demo (same features as the Vue version)
```

## Module Overview

### nodeApi

Backend API service based on Node.js + Express + SQLite. It reads model `.db` database files and provides data endpoints for the frontend, including feature property queries, floor structure, and professional (discipline) structure (default port **18084**). It also mounts the `public` and `dist` directories of VuePage as static resources.

### VuePage

The main frontend demo, built on **Vue 3 + Vite + TypeScript + Three.js + Ant Design Vue**. It demonstrates loading `.opt` lightweight models via `OptRapid3dLoader` and provides 6 interaction panels: feature properties, feature coloring, show/hide, feature transparency, feature offset, and feature rotation, plus an official website link.

### ReactPage

The React version of the frontend demo, built on **React 18 + Vite + TypeScript + Ant Design 5**. Its features and styles are basically consistent with VuePage, reusing the same backend (nodeApi) and loader (`OptRapid3dLoader.js`, copied as-is and unmodified).

## Quick Start

```bash
# 1. Start the backend service (port 18084)
cd nodeApi
npm install
npm start

# 2. Start the frontend (choose one)
cd ../VuePage && npm install && npm run dev      # Vue version, port 18083
cd ../ReactPage && npm install && npm run dev    # React version, port 18085

# 3. Configure
# Edit the public/static/config.json of the chosen frontend project:
# { "baseUrl": "http://localhost:18084", "modelName": "Example" }
```

Model files are placed by default in `VuePage/public/static/OutputModel/{modelName}/` (containing `root.opt` and a `.db` file with the same name as the model).

## Documentation

For detailed information (installation, deployment, API endpoints, configuration, loader API, FAQ, etc.) of each module, please refer to the README.md of each sub-project:

- [nodeApi/README.md](./nodeApi/README.md) — Backend API documentation and startup guide
- [VuePage/README.md](./VuePage/README.md) — Full documentation of the main project (including OptRapid3dLoader API and deployment guide)
- [ReactPage/README.md](./ReactPage/README.md) — React version documentation

## Related Links

- 3D Expert official website: [www.opt3ds.com](https://www.opt3ds.com)
- [Three.js Documentation](https://threejs.org/)
