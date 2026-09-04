/**
 * Minimal configuration module
 * Functionally equivalent to WebPage/src/store/modules/model (Pinia store),
 * used to store the backend address and model name required for model loading
 */
export interface ModelMessage {
  baseUrl: string;
  modelName: string;
}

// Global singleton state, avoiding passing through props layer by layer between multiple components/panels
const state: ModelMessage = { baseUrl: "", modelName: "" };

/**
 * Set the model configuration
 * @param data the configuration read from config.json
 * @note In the development environment, Vite forwards /api and /static requests via the proxy, so baseUrl is set to empty
 */
export function setModelMessage(data: Partial<ModelMessage>) {
  state.baseUrl = import.meta.env.DEV ? "" : (data.baseUrl ?? "");
  state.modelName = data.modelName || "";
}

/** Get the current model configuration */
export function getModelMessage(): ModelMessage {
  return state;
}
