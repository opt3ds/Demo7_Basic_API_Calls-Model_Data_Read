# SQLite Node API (BIM Model Data Service)

A backend API service based on Node.js + Express + SQLite, used to read model `.db` database files,
providing data interfaces for the frontend (VuePage / ReactPage demo projects) for feature property queries, floor structure, professional (discipline) structure, and other functions.

Meanwhile, this service also mounts the `public` and `dist` directories of VuePage as static resources, so the frontend pages can be accessed directly.

## Directory Structure

```
nodeApi/
├── server.js          # Main API service file
├── package.json       # Dependency configuration
├── start.bat          # Windows one-click startup script
└── README.md          # This document
```

## Environment Requirements

- **Node.js** >= 16.x

## Install Dependencies

```bash
cd nodeApi
npm install
```

## Start the Service

### Method 1: Using the Startup Script (Windows)

Double-click `start.bat`. The script will automatically check the Node.js environment, install dependencies, and start the service.

### Method 2: Manual Startup

```bash
# Install dependencies (first run)
npm install

# Start the service (default port 18084)
npm start

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

> If VuePage has not been built first (the `dist` directory does not exist), a corresponding warning will be output at startup; the API functionality is not affected.

## Database Path Description

The API service reads model database files from the `../VuePage/public/static/OutputModel/` directory by default.
Each model corresponds to a subdirectory named after the model, which contains a `.db` file with the same name as the model:

```
VuePage/public/static/OutputModel/
└── Example/                  # The model name is "Example"
    ├── Example.db            # Model database file
    ├── root.opt              # Model geometry file
    └── ...
```

To change the database path, edit the `OUTPUT_MODEL_PATH` constant in `server.js`.

## API Endpoint List

All endpoints are GET requests, with parameters passed via Query String.

| Endpoint | Path | Required Params | Optional Params | Description |
|------|------|---------|---------|------|
| Floor structure data | `/api/app/model/GetFloorStructureData` | `lightweightName` | `pid` | Get the model tree (model_tree) data; pid defaults to '0' (root node) |
| Floor feature IDs | `/api/app/model/GetModelTreeFeatureIdByPid` | `lightweightName` | `pid` | Recursively get the externalId of a node and all its child nodes under the model tree (comma-separated string) |
| Professional structure data | `/api/app/model/GetProfessionalStructureData` | `lightweightName` | `pid` | Get the professional classification (model_type) data; pid defaults to '0' |
| Professional feature IDs | `/api/app/model/GetModelTypeFeatureIdByPid` | `lightweightName` | `pid` | Recursively get the externalId of a node and all its child nodes under the professional classification |
| Feature property data | `/api/app/model/GetPropertyDataByExternalId` | `lightweightName`, `externalId` | — | Query feature property data in the model_property table by externalId |

### Response Format

- Success: `{ "code": 1, "datas": ... }`
- Failure / missing parameters / database not found: `{ "code": 0, "codeMsg": "...", "datas": [] }` (HTTP status 400/404 or 200)

## API Call Examples

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

## Frontend Configuration

After starting the NodeAPI service, you need to point the frontend configuration to the service address. Edit `VuePage/public/static/config.json`:

```json
{
  "baseUrl": "http://localhost:18084",
  "modelName": "Example"
}
```

- `baseUrl`: The access address of the NodeAPI service
- `modelName`: The name of the model to load, which must match the subfolder name under the `OutputModel/` directory

> The model loading address is `{baseUrl}/static/OutputModel/{modelName}/root.opt`.

## Notes

- This service **does not enable CORS**: requests will be blocked by the browser when the frontend and the API are deployed across domains.
  Both VuePage development mode and ReactPage (development/production) avoid this issue by proxying `/api` requests through the same port.
- After modifying `server.js`, the service must be restarted for the changes to take effect.
