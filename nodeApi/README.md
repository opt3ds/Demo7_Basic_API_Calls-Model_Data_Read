# SQLite Node API

This is a Node.js-based RESTful API for querying SQLite databases.

## Install Dependencies

```bash
npm install
```

## Configuration

Configuration file is located at `config/default.json`:

```json
{
  "database": {
    "storagePath": "./databases"
  },
  "server": {
    "port": 3000,
    "host": "localhost"
  }
}
```

- `database.storagePath`: SQLite database file storage path
- `server.port`: API server port
- `server.host`: API server host address

## Start Service

```bash
# Production environment
npm start

# Development environment (requires nodemon installed)
npm run dev
```

## API Endpoints

### 1. Get All Available Databases

```
GET /api/databases
```

Response example:
```json
{
  "databases": ["mydb", "testdb", "users"]
}
```

### 2. Get All Tables in Database

```
GET /api/:dbName/tables
```

Example:
```
GET /api/mydb/tables
```

Response example:
```json
{
  "tables": ["users", "products", "orders"]
}
```

### 3. Query Database

```
POST /api/:dbName/query
```

Request body:
```json
{
  "query": "SELECT * FROM users WHERE age > ?",
  "params": [18]
}
```

Example:
```
POST /api/mydb/query
```

Response example:
```json
{
  "data": [
    {"id": 1, "name": "John", "age": 25},
    {"id": 2, "name": "Jane", "age": 30}
  ]
}
```

### 4. Get Table Schema

```
GET /api/:dbName/tables/:tableName/schema
```

Example:
```
GET /api/mydb/tables/users/schema
```

Response example:
```json
{
  "schema": [
    {"cid": 0, "name": "id", "type": "INTEGER", "notnull": 1, "dflt_value": null, "pk": 1},
    {"cid": 1, "name": "name", "type": "TEXT", "notnull": 1, "dflt_value": null, "pk": 0},
    {"cid": 2, "name": "age", "type": "INTEGER", "notnull": 0, "dflt_value": null, "pk": 0}
  ]
}
```

## Security Notes

- API only allows SELECT queries, does not allow INSERT, UPDATE, DELETE and other modification operations
- All queries undergo security checks
- Database files must be stored in the configured path

## Usage Examples

### Using curl to Query Database

```bash
# Get all databases
curl http://localhost:3000/api/databases

# Get tables in database
curl http://localhost:3000/api/mydb/tables

# Query data
curl -X POST http://localhost:3000/api/mydb/query \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT * FROM users LIMIT 10"}'

# Get table schema
curl http://localhost:3000/api/mydb/tables/users/schema
```

### Using JavaScript Client

```javascript
// Query data
const response = await fetch('http://localhost:3000/api/mydb/query', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    query: 'SELECT * FROM users WHERE age > ?',
    params: [18]
  })
});

const result = await response.json();
console.log(result.data);
```
