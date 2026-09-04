# Opt Rapid3D Loader for Three.js — React Demo

A BIM 3D model viewer demo based on **React 18 + Vite 5 + TypeScript + Ant Design 5 + three.js**.
Its features and styles are basically consistent with the Vue version `VuePage` in the sibling directory, and it reuses the same backend and loader:

- Continues to use the original backend program `nodeApi` (port **18084**, no changes made)
- Still based on `OptRapid3dLoader.js` (copied as-is from VuePage, unmodified)
- 7 tools: Feature properties, Feature coloring, Show/Hide, Feature transparency, Feature offset, Feature rotation, Official website

## Prerequisites

1. Node.js (18+ recommended)
2. Start the original backend service `nodeApi` (port 18084):

```bash
cd ..\nodeApi
npm install
npm start
```

The backend provides `/static/**` (model, draco/basis/rhino3dm and other runtime libraries) and `/api/**` (feature property and other query endpoints).

## Directory Structure

```
ReactPage/
├── index.html                  # Entry
├── package.json
├── vite.config.ts              # Dev server 18085, proxies /api and /static to 18084
├── tsconfig.json
├── static-server.js            # Production static server 18090 (ESM, http-proxy-middleware proxies /api)
├── build.cmd                   # One-click build (esbuild bundles dist/main.bundle.js, used with static-server.js)
├── public/
│   ├── bimlogo.ico
│   └── static/
│       └── config.json         # {"baseUrl": "", "modelName": "Example"}
└── src/
    ├── main.tsx                # Reads config.json then mounts the app
    ├── App.tsx                 # ConfigProvider (zhCN + theme token)
    ├── index.css               # Global styles (aligned with VuePage/src/style.less)
    ├── config.ts               # Global model configuration (baseUrl / modelName)
    ├── api/
    │   └── index.ts            # Endpoints such as getPropertiesStation
    ├── utils/
    │   ├── OptRapid3dLoader.js     # Loader (copied as-is, do not modify)
    │   ├── OptRapid3dLoader.d.ts   # Type declarations
    │   └── request.ts              # fetch wrapper
    ├── components/
    │   └── DraggableModal.tsx      # Draggable modal (aligned with the Vue version Modal.vue)
    └── views/
        ├── Index.tsx                   # Main scene (camera/controls/loader/left navigation/notification panel)
        └── panels/
            ├── AttributePanel.tsx      # Feature properties
            ├── ColorPanel.tsx          # Feature coloring
            ├── VisiblePanel.tsx        # Show/Hide
            ├── AlphaPanel.tsx          # Feature transparency
            ├── OffsetPanel.tsx         # Feature offset
            ├── RotatePanel.tsx         # Feature rotation
            └── useCanvasPick.ts        # Canvas pick listener (bind on mount / restore on unmount)
```

## Development Mode (Port 18085)

```bash
npm install
npm run dev
```

Open `http://localhost:18085` in the browser. In development mode, the `baseUrl` in `config.json` is forced to `""`,
and `/api` and `/static` requests are proxied by Vite to `http://localhost:18084` (same origin, avoiding CORS).

## Production Mode (Port 18090)

```bash
npm run build
node static-server.js
```

Or first double-click `build.cmd` (uses local esbuild to bundle directly into `dist/main.bundle.js`, suitable for environments
where `npm run build` cannot run), then run `node static-server.js`. Open `http://localhost:18090` in the browser.
(Note: ports 18086~18089 are reserved by Windows/Hyper-V on this machine and cannot be listened on, hence 18090 is used.)
`static-server.js` uses http-proxy-middleware to proxy `/api` to 18084; `/static` first takes the local
`public/static` (config.json), and the remaining static resources (models, decoders) are shared from `../VuePage/public/static`.

## Configuration (public/static/config.json)

| Field | Description |
| --- | --- |
| `baseUrl` | Backend address. Since `nodeApi` does not enable CORS, **it must remain `""`**; requests are forwarded through the same-port proxy |
| `modelName` | Model name, corresponding to `nodeApi/OutputModel/{modelName}/root.opt` and `{modelName}.db`, default `Example` |

The model loading address is `{baseUrl}/static/OutputModel/{modelName}/root.opt`,
and the runtime libraries (draco / basis / rhino3dm wasm) are located in `./static/libs`, shared with the Vue version.

## Tech Stack

| Dependency | Version | Purpose |
| --- | --- | --- |
| react / react-dom | ^18 | UI framework |
| vite | ^5 | Build / dev server |
| typescript | ^5 | Types |
| antd | ^5 | Component library (Tabs/Table/List/Switch/Slider/ColorPicker/Modal, etc.) |
| @ant-design/icons | ^5 | Icons |
| three | 0.184.0 | 3D rendering (matches the loader requirement of three >= 0.170) |
| express + http-proxy-middleware | - | Production static server / API proxy |

## Feature Description (Consistent with the Vue Version)

1. **Feature properties**: Click to pick a feature (highlighted yellow), and feature properties are displayed in pages by "Property / Type"; data comes from `/api/app/model/GetPropertyDataByExternalId`;
2. **Feature coloring**: After picking a feature, a dialog pops up to select and apply a color; the list on the right supports single deletion (restoring white) or "Delete all";
3. **Show/Hide**: Picked features are hidden immediately; the Switch in the list toggles show/hide; supports single deletion and delete all;
4. **Feature transparency**: After picking a feature, a dialog pops up to set transparency (0~1); supports single deletion and delete all;
5. **Feature offset**: After picking a feature, offset in real time via X/Y/Z sliders (±10m); the input boxes show the cumulative offset;
6. **Feature rotation**: After picking a feature, rotate via X/Y/Z sliders (0~360°); the input boxes show the current angle;
7. **Website**: Opens https://www.opt3ds.com in a new window.

When a tool is closed (deselected), everything is automatically restored: restore white, clear offset/rotation, restore visibility, and clear the list.
