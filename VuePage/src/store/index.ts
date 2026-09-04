import { createPinia } from "pinia"; // Import pinia
import piniaPluginPersistedstate from "pinia-plugin-persistedstate"; // Import the pinia persistence plugin

// Create pinia
const pinia = createPinia();

// Use the pinia persistence plugin
pinia.use(piniaPluginPersistedstate);

// Export pinia
export default pinia;
