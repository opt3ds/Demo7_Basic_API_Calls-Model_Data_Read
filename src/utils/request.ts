import { useModelStore } from "../store/modules/model";

interface RequestOptions {
  url: string;
  method?: "get" | "post" | "put" | "delete";
  params?: Record<string, any>;
  data?: any;
  headers?: Record<string, string>;
}

interface RequestInstance {
  request: (options: RequestOptions) => Promise<any>;
}

const request: RequestInstance = {
  async request(options: RequestOptions): Promise<any> {
    const store = useModelStore();
    const baseUrl = store.baseUrl || "";

    let url = baseUrl + options.url;
    const method = options.method || "get";
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (options.params && Object.keys(options.params).length > 0) {
      const queryString = new URLSearchParams(
        Object.entries(options.params).reduce(
          (acc, [key, value]) => {
            acc[key] = String(value);
            return acc;
          },
          {} as Record<string, string>
        )
      ).toString();
      url += `?${queryString}`;
    }

    const fetchOptions: RequestInit = {
      method: method.toUpperCase(),
      headers,
    };

    if (method !== "get" && options.data) {
      if (typeof options.data === "string") {
        fetchOptions.body = options.data;
      } else {
        fetchOptions.body = JSON.stringify(options.data);
      }
    }

    try {
      const response = await fetch(url, fetchOptions);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Request error:", error);
      throw error;
    }
  },
};

export default request;
