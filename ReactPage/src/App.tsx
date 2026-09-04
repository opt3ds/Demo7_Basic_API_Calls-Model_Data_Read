/**
 * Application root component
 * - Provides the antd Chinese language pack and theme configuration
 * - Wraps <App> to support calling message/notification in hook form
 *   (Under React 19, the antd v5 static API cannot be mounted automatically, so useApp must be used instead)
 */
import { App as AntApp, ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import Index from "./views/Index";

// Theme configuration aligned with WebPage/src/App.vue
const theme = {
  token: {
    colorPrimary: "#1677ff",
    borderRadius: 2,
  },
  components: {
    Button: {
      colorPrimary: "#1677ff",
    },
    Input: {
      colorPrimary: "#1677ff",
      colorPrimaryHover: "#1677ff",
    },
    Tabs: {
      colorPrimary: "#1677ff",
      itemActiveColor: "#1677ff",
      itemHoverColor: "#1677ff",
      inkBarColor: "#1677ff",
    },
    Select: {
      colorPrimary: "#1677ff",
      optionSelectedBg: "#e6f7ff",
      optionActiveBg: "#e6f7ff",
    },
    Checkbox: {
      colorPrimary: "#1677ff",
      colorBgContainer: "#1677ff",
    },
    Radio: {
      colorPrimary: "#1677ff",
      colorPrimaryBg: "#1677ff",
      buttonSolidCheckedColor: "#fff",
      buttonSolidCheckedBg: "#1677ff",
      buttonSolidCheckedBorderColor: "#1677ff",
    },
    Menu: {
      colorPrimary: "#1677ff",
      itemSelectedBg: "#e6f7ff",
      itemSelectedColor: "#1677ff",
    },
    Tooltip: {
      colorPrimary: "#1677ff",
    },
    Slider: {
      colorPrimary: "#1677ff",
      trackBg: "#1677ff",
      handleColor: "#1677ff",
    },
  },
};

export default function App() {
  return (
    <ConfigProvider locale={zhCN} theme={theme}>
      {/* antd App component: provides the useApp context for message/notification, etc.
          Under React 19, the holder of the antd v5 static API cannot be mounted (the react-dom main entry
          no longer exports createRoot/render), so the <App> + useApp hook form must be used instead. */}
      <AntApp>
        <Index />
      </AntApp>
    </ConfigProvider>
  );
}
