import type { ThemeConfig } from "antd";

export const theme: ThemeConfig = {
  token: {
    // 主色调
    colorPrimary: "#1677ff",
    colorSuccess: "#52c41a",
    colorWarning: "#faad14",
    colorError: "#ff4d4f",
    colorInfo: "#1677ff",

    // 字体
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,

    // 圆角
    borderRadius: 6,

    // 间距
    padding: 16,
    margin: 16,

    // 阴影
    boxShadow:
      "0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)",
  },
  components: {
    Layout: {
      headerBg: "#ffffff",
      siderBg: "#ffffff",
      bodyBg: "#f5f5f5",
    },
    Menu: {
      itemBg: "transparent",
      itemSelectedBg: "#e6f4ff",
      itemSelectedColor: "#1677ff",
      itemHoverBg: "#f5f5f5",
    },
    Button: {
      borderRadius: 6,
    },
    Card: {
      borderRadius: 8,
    },
  },
};
