import { defineStore } from "pinia";

export interface modelState {
  baseUrl: string;
  modelName: string;
}

export const useModelStore = defineStore({
  persist: false,
  id: "model",
  state: (): modelState => ({
    baseUrl: "",
    modelName: "",
  }),
  getters: {},
  actions: {
    setModelMessage(data: any) {
      const isDev = import.meta.env.DEV;
      this.baseUrl = isDev ? '' : data.baseUrl;
      this.modelName = data.modelName || "";
    },
  },
});
