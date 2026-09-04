/**
 * Application entry
 * 1. First load static/config.json and inject the model base configuration into the global state
 * 2. Then start the React root component
 * The initialization order is consistent with WebPage/src/main.ts
 */
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setModelMessage } from "./config";

// Consistent with the Vue version: first load config.json to inject the configuration, then render the app
const container = document.getElementById("root");
if (container) {
  fetch("./static/config.json")
    .then((response) => response.json())
    .then((data) => {
      setModelMessage(data);
      createRoot(container).render(<App />);
    })
    .catch((error) => {
      console.error("Failed to load config.json:", error);
    });
}
