const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");
const fs = require("fs");

/**
 * Get port from command line arguments
 *
 * Usage:
 * 1. Specify port via --port=18084: node server.js --port=18084
 * 2. Specify port via -p 18084: node server.js -p 18084
 * 3. Specify port via --port 18084: node server.js --port 18084
 *
 * If no port is specified, the default port 18084 will be used
 */
function getPortFromArgs() {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--port=")) {
      return parseInt(arg.split("=")[1], 10);
    }
    if (arg === "-p" || arg === "--port") {
      if (args[i + 1] && !args[i + 1].startsWith("-")) {
        return parseInt(args[i + 1], 10);
      }
    }
  }
  return null;
}

const portFromArgs = getPortFromArgs();
const PORT = portFromArgs || 18084;
const HOST = "localhost";

// Model database storage path: points to WebPage/public/static/OutputModel
const OUTPUT_MODEL_PATH = path.join(__dirname, "../public/static/OutputModel/");

console.log(`Model database path: ${OUTPUT_MODEL_PATH}`);
console.log(`Server address: http://${HOST}:${PORT}`);

const app = express();

// ========== Global Error Handling ==========
// Capture unhandled Promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Promise rejection:", reason);
  // Do not exit process, only log error
});

// Capture uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  // Do not exit process, only log error
});

// ========== Middleware ==========
app.use(express.json());

// ========== Vue Project Static File Service ==========
// Configure Vue build output path (modify according to actual path)
const vueDistPath = path.join(__dirname, "../WebPage");
const vuePublicPath = path.join(__dirname, "../WebPage/public");

// Mount public directory (In Vite projects, public directory content is mapped to root)
if (fs.existsSync(vuePublicPath)) {
  app.use(express.static(vuePublicPath));
  console.log(`Static resources mounted: ${vuePublicPath}`);
}

// Check if dist directory exists
if (fs.existsSync(vueDistPath)) {
  // Static file service
  app.use(express.static(vueDistPath));

  console.log(`Vue project static files mounted: ${vueDistPath}`);
} else {
  console.warn(`Warning: Vue build directory not found: ${vueDistPath}`);
  console.warn(
    "Please ensure the Vue project has been built and placed in the specified location",
  );
}

// Connect to SQLite database
function connectToDatabase(dbPath) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(db);
      }
    });
  });
}

// Execute query
function executeQuery(db, query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// API routes

// Get floor structure data
app.get("/api/app/model/GetFloorStructureData", async (req, res) => {
  let db = null;
  try {
    // Get values from query parameters, not path parameters
    const { lightweightName, pid } = req.query;

    // Check required parameters
    if (!lightweightName) {
      return res
        .status(400)
        .json({
          code: 0,
          codeMsg: "lightweightName parameter is required",
          datas: [],
        });
    }

    const dbPath = path.join(
      OUTPUT_MODEL_PATH,
      lightweightName,
      `${lightweightName}.db`,
    );

    // Check if database file exists
    if (!fs.existsSync(dbPath)) {
      return res
        .status(404)
        .json({
          code: 0,
          codeMsg: `Database ${lightweightName} not found`,
          datas: [],
        });
    }

    db = await connectToDatabase(dbPath);
    const tables = await executeQuery(
      db,
      "SELECT * FROM sqlite_master where tbl_name='model_tree'",
    );
    if (tables.length === 0) {
      return res.status(404).json({
        code: 0,
        codeMsg: `model_tree table not found in database ${lightweightName}`,
        datas: [],
      });
    } else {
      // If pid is empty or undefined, default to '0'
      const parentId = pid == "" || pid == null || pid == undefined ? "0" : pid;
      const floorStructureData = await executeQuery(
        db,
        "SELECT * FROM model_tree where pGlid=?",
        [parentId],
      );
      if (floorStructureData.length === 0) {
        res.json({ code: 1, datas: [] });
      } else {
        res.json({ code: 1, datas: floorStructureData });
      }
    }
  } catch (error) {
    console.error("GetFloorStructureData Error:", error);
    res.json({ code: 0, codeMsg: error.message, datas: [] });
  } finally {
    if (db) {
      try {
        db.close();
      } catch (closeError) {
        console.error("Failed to close database:", closeError);
      }
    }
  }
});
app.get("/api/app/model/GetModelTreeFeatureIdByPid", async (req, res) => {
  let db = null;
  try {
    // Get values from query parameters, not path parameters
    const { lightweightName, pid } = req.query;

    // Check required parameters
    if (!lightweightName) {
      return res
        .status(400)
        .json({
          code: 0,
          codeMsg: "lightweightName parameter is required",
          datas: [],
        });
    }

    const dbPath = path.join(
      OUTPUT_MODEL_PATH,
      lightweightName,
      `${lightweightName}.db`,
    );

    // Check if database file exists
    if (!fs.existsSync(dbPath)) {
      return res
        .status(404)
        .json({
          code: 0,
          codeMsg: `Database ${lightweightName} not found`,
          datas: [],
        });
    }

    db = await connectToDatabase(dbPath);
    const tables = await executeQuery(
      db,
      "SELECT * FROM sqlite_master where tbl_name='model_tree'",
    );
    if (tables.length === 0) {
      return res.status(404).json({
        code: 0,
        codeMsg: `model_tree table not found in database ${lightweightName}`,
        datas: [],
      });
    } else {
      // If pid is empty or undefined, default to '0'
      const parentId = pid == "" || pid == null || pid == undefined ? "0" : pid;
      const sql =
        "with recursive p as " +
        "                            (select t1.* from model_tree t1 WHERE t1.glid = ?" +
        "                            union all  " +
        "                            select t2.* from model_tree t2 inner join p on t2.pGlid=p.glid" +
        "                            )" +
        "                            select IFNULL(GROUP_CONCAT(DISTINCT externalId),'')  as externalId   from p where externalId!=0";
      const externalIdData = await executeQuery(db, sql, [parentId]);
      if (externalIdData.length === 0) {
        res.json({ code: 1, datas: "" });
      } else {
        res.json({ code: 1, datas: externalIdData[0].externalId });
      }
    }
  } catch (error) {
    console.error("GetModelTreeFeatureIdByPid Error:", error);
    res.json({ code: 0, codeMsg: error.message, datas: [] });
  } finally {
    if (db) {
      try {
        db.close();
      } catch (closeError) {
        console.error("Failed to close database:", closeError);
      }
    }
  }
});
app.get("/api/app/model/GetProfessionalStructureData", async (req, res) => {
  let db = null;
  try {
    // Get values from query parameters, not path parameters
    const { lightweightName, pid } = req.query;

    // Check required parameters
    if (!lightweightName) {
      return res
        .status(400)
        .json({
          code: 0,
          codeMsg: "lightweightName parameter is required",
          datas: [],
        });
    }

    const dbPath = path.join(
      OUTPUT_MODEL_PATH,
      lightweightName,
      `${lightweightName}.db`,
    );

    // Check if database file exists
    if (!fs.existsSync(dbPath)) {
      return res
        .status(404)
        .json({
          code: 0,
          codeMsg: `Database ${lightweightName} not found`,
          datas: [],
        });
    }

    db = await connectToDatabase(dbPath);
    const tables = await executeQuery(
      db,
      "SELECT * FROM sqlite_master where tbl_name='model_type'",
    );
    if (tables.length === 0) {
      return res.status(404).json({
        code: 0,
        codeMsg: `model_type table not found in database ${lightweightName}`,
        datas: [],
      });
    } else {
      // If pid is empty or undefined, default to '0'
      const parentId = pid == "" || pid == null || pid == undefined ? "0" : pid;
      const floorStructureData = await executeQuery(
        db,
        "SELECT * FROM model_type where pGlid=?",
        [parentId],
      );
      if (floorStructureData.length === 0) {
        res.json({ code: 1, datas: [] });
      } else {
        res.json({ code: 1, datas: floorStructureData });
      }
    }
  } catch (error) {
    console.error("GetProfessionalStructureData Error:", error);
    res.json({ code: 0, codeMsg: error.message, datas: [] });
  } finally {
    if (db) {
      try {
        db.close();
      } catch (closeError) {
        console.error("Failed to close database:", closeError);
      }
    }
  }
});
app.get("/api/app/model/GetModelTypeFeatureIdByPid", async (req, res) => {
  let db = null;
  try {
    // Get values from query parameters, not path parameters
    const { lightweightName, pid } = req.query;

    // Check required parameters
    if (!lightweightName) {
      return res
        .status(400)
        .json({
          code: 0,
          codeMsg: "lightweightName parameter is required",
          datas: [],
        });
    }

    const dbPath = path.join(
      OUTPUT_MODEL_PATH,
      lightweightName,
      `${lightweightName}.db`,
    );

    // Check if database file exists
    if (!fs.existsSync(dbPath)) {
      return res
        .status(404)
        .json({
          code: 0,
          codeMsg: `Database ${lightweightName} not found`,
          datas: [],
        });
    }

    db = await connectToDatabase(dbPath);
    const tables = await executeQuery(
      db,
      "SELECT * FROM sqlite_master where tbl_name='model_type'",
    );
    if (tables.length === 0) {
      return res.status(404).json({
        code: 0,
        codeMsg: `model_type table not found in database ${lightweightName}`,
        datas: [],
      });
    } else {
      // If pid is empty or undefined, default to '0'
      const parentId = pid == "" || pid == null || pid == undefined ? "0" : pid;
      const sql =
        "with recursive p as " +
        "                            (select t1.* from model_type t1 WHERE t1.glid = ?" +
        "                            union all  " +
        "                            select t2.* from model_type t2 inner join p on t2.pGlid=p.glid" +
        "                            )" +
        "                            select IFNULL(GROUP_CONCAT(DISTINCT externalId),'')  as externalId   from p where externalId!=0";
      const externalIdData = await executeQuery(db, sql, [parentId]);
      if (externalIdData.length === 0) {
        res.json({ code: 1, datas: "" });
      } else {
        res.json({ code: 1, datas: externalIdData[0].externalId });
      }
    }
  } catch (error) {
    console.error("GetModelTypeFeatureIdByPid Error:", error);
    res.json({ code: 0, codeMsg: error.message, datas: [] });
  } finally {
    if (db) {
      try {
        db.close();
      } catch (closeError) {
        console.error("Failed to close database:", closeError);
      }
    }
  }
});
app.get("/api/app/model/GetPropertyDataByExternalId", async (req, res) => {
  let db = null;
  try {
    // Get values from query parameters, not path parameters
    const { lightweightName, externalId } = req.query;

    // Check required parameters
    if (!lightweightName) {
      return res
        .status(400)
        .json({
          code: 0,
          codeMsg: "lightweightName parameter is required",
          datas: [],
        });
    }
    const dbPath = path.join(
      OUTPUT_MODEL_PATH,
      lightweightName,
      `${lightweightName}.db`,
    );

    // Check if database file exists
    if (!fs.existsSync(dbPath)) {
      return res
        .status(404)
        .json({
          code: 0,
          codeMsg: `Database ${lightweightName} not found`,
          datas: [],
        });
    }

    db = await connectToDatabase(dbPath);
    const tables = await executeQuery(
      db,
      "SELECT * FROM sqlite_master where tbl_name='model_property'",
    );
    if (tables.length === 0) {
      return res.status(404).json({
        code: 0,
        codeMsg: `model_property table not found in database ${lightweightName}`,
        datas: [],
      });
    } else {
      const sql = `select *
                         from model_property
                         where externalId = '${externalId}'
                         order by propertyTypeName, propertySetName, propertyname`;
      const externalData = await executeQuery(db, sql);
      if (externalData.length === 0) {
        res.json({ code: 1, datas: "" });
      } else {
        res.json({ code: 1, datas: externalData });
      }
    }
  } catch (error) {
    console.error("GetPropertyDataByExternalId Error:", error);
    res.json({ code: 0, codeMsg: error.message, datas: [] });
  } finally {
    if (db) {
      try {
        db.close();
      } catch (closeError) {
        console.error("Failed to close database:", closeError);
      }
    }
  }
});

// ========== SPA Route Support (must be after all API routes)==========
if (fs.existsSync(vueDistPath)) {
  // SPA route support: All non-API requests return index.html
  app.get("*", (req, res) => {
    // If it's an API request, don't handle (should have been handled by routes above)
    if (req.path.startsWith("/api")) {
      return res
        .status(404)
        .json({ code: 0, codeMsg: "API endpoint not found", datas: [] });
    }
    res.sendFile(path.join(vueDistPath, "index.html"));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`SQLite API server started`);
  console.log(`Model database path: ${OUTPUT_MODEL_PATH}`);
  console.log(`Access URL: http://${HOST}:${PORT}`);
});

module.exports = app;
