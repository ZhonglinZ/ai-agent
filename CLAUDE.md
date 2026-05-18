# CLAUDE.md

## 技术栈

| 类别 | 技术 | 备注 |
|------|------|------|
| 框架 | Next.js 16 (App Router) | `reactCompiler: true` 启用 |
| UI | React 19 + Ant Design 6 + Tailwind CSS v4 | 图标用 `@ant-design/icons` |
| 画布 | @xyflow/react 12 (React Flow) | 工作流编辑器核心 |
| 状态管理 | Zustand 5 + Zundo (undo/redo) + Immer | Zundo 只追踪 nodes/edges 变化 |
| 数据库 | Prisma 7 + PostgreSQL | 客户端单例模式，适配器用 `@prisma/adapter-pg` |
| 工具 | clsx + tailwind-merge + dayjs | 无 lodash/moment |
| 包管理 | pnpm-lock.yaml 存在 | 实际使用 pnpm |
| Lint | ESLint 9 flat config | `@typescript-eslint/no-explicit-any: off` |

## 目录结构

```
app/                          # Next.js App Router
  api/workflow/[id]/route.ts  # 工作流 CRUD API
  api/users/[id]/route.ts     # 用户 CRUD API（mock 数据）
  workflow/editor/page.tsx    # 编辑器页面
  workflow/list/page.tsx      # 工作流列表页面
  layout.tsx                  # 根布局（AntdRegistry + ConfigProvider）
components/
  common/                     # 通用组件（DataTable, PageHeader）
  layouts/                    # 主布局（侧边栏 + 顶栏 + 面包屑）
  workflow/
    editor/                   # React Flow 画布 + 顶部工具栏
    nodes/                    # 节点组件（6 种类型 + BaseNode + CustomHandle）
    panels/                   # 属性面板 + 运行面板（按节点类型分子目录）
    toolbar/                  # 画布工具栏 + 节点选择器
lib/
  config/layout.ts            # 布局菜单配置
  constants.ts                # 全局常量（API 端点、状态、分页、正则等）
  theme.ts                    # Ant Design 主题 token
  db/prisma.ts                # Prisma 客户端单例
  hooks/                      # 自定义 hooks（useApi, useLayout 等）
  services/
    http.ts                   # HttpClient 类（拦截器、错误处理、fetch 封装）
    workflowDb.service.ts     # 服务端 Prisma 持久化（仅服务端使用）
    workflow.service.ts       # 浏览器端 API 调用（http 客户端）
    workflowStorage.service.ts # localStorage 版本（已被 DB 版本替代）
  stores/
    workflowStore.ts          # 工作流编辑器 Zustand Store（core）
    workflowRunStore.ts       # 运行状态管理
    routerStore.ts            # 路由状态
  types/
    api.ts                    # ApiResponse<T>, PaginatedResponse, RequestConfig
    workflow.ts               # Workflow 基础类型
  utils/index.ts              # 通用工具（storageUtils 等）
  workflow/
    types.ts                  # 节点类型系统（NodeType 枚举、各节点 Data 接口）
    nodeRegistry.ts           # 节点注册表单例
    registerNodes.ts          # 注册 6 种节点
    validator.ts              # 工作流校验
    collisionAlgorithm.ts     # 节点拖拽防撞
    layoutAlgorithm.ts        # 自动布局（dagre）
    engine/                   # 工作流执行引擎（BFS，模拟执行）
prisma/schema.prisma          # StoredWorkflow 模型
```

## 编码风格

### 命名

- **组件文件**: PascalCase（`LLMNode.tsx`, `CanvasContent.tsx`）
- **页面路由**: kebab-case 文件夹 + `page.tsx`
- **服务/工具**: camelCase（`workflowStore.ts`, `workflowEngine.ts`）
- **类型文件**: camelCase（`types.ts`, `api.ts`）
- **路径别名**: `@/` 映射到项目根目录

### 组件模式

所有组件使用 `"use client"` 指令，函数组件 + interface 定义 Props：

```tsx
"use client";
import React from "react";

interface FooProps {
  id: string;
  data: FooData;
  selected?: boolean;
}

export const Foo: React.FC<FooProps> = ({ id, data, selected }) => {
  // ...
};
```

CSS 用 Tailwind className 直接写在 JSX 中，避免 inline style。

### 状态管理（Zustand）

定义 `interface XxxState { ... }`，用 `create<XxxState>()(...)` 创建。Zundo 中间件只追踪 nodes/edges，配置 `partialize` + `equality` + `limit: 50`：

```ts
export const useWorkflowStore = create<WorkflowState>()(
  temporal(
    (set) => ({ ...initialState, ...actions }),
    { partialize: (state) => ({ nodes: state.nodes, edges: state.edges }), limit: 50 }
  )
);
```

### 服务层

服务端用 Class + 单例 export（`export const workflowDbService = new WorkflowDbService()`）。
浏览器端同理（`export const workflowService = new WorkflowService()`）。
服务端直接使用 Prisma client，浏览器端通过 `http` 客户端调用 `/api` 路由。

### 节点系统

使用注册表模式：`NodeRegistry` 是存储 `NodeConfig` 的 Map 单例，通过 `initializeNodeRegistry()` 注册所有节点类型。添加新节点类型需：定义 Data 接口 → 创建组件 → 注册到 registry → 添加执行器。

## API 规范

### 通用响应格式

所有 API 返回统一结构：

```ts
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  code?: number;
}
```

成功：`{ success: true, data: <T> }`
失败：`{ success: false, message: "错误描述" }`

### 错误处理

Route Handler 层使用 try-catch，按状态码区分：

```ts
try {
  // ...
} catch (error) {
  console.error('操作描述失败:', error);
  return NextResponse.json(
    { success: false, message: '操作描述失败' },
    { status: 500 }
  );
}
```

业务错误返回对应状态码：400（参数不一致）、404（资源不存在）、500（服务端异常）。

### HTTP 客户端

浏览器端通过 `HttpClient` 类（`lib/services/http.ts`）发起请求，支持：
- 拦截器链（请求/响应/错误）
- 自动注入 Authorization header
- `silent: true` 选项跳过全局错误提示
- 401 时自动清除 token 跳转登录页
- 方法：`http.get<T>()`, `http.post<T>()`, `http.put<T>()`, `http.patch<T>()`, `http.delete<T>()`

### URL 参数

Next.js 16 App Router：`params` 是 `Promise<{ id: string }>`，需 `await params` 解包。

## 关键约定

- 中文注释和界面文案，英文变量名和类型名
- 枚举用 `enum` 而非 union string literal（`NodeType`, `WorkflowRunMode` 等）
- 常量集中在 `lib/constants.ts`，用 `as const` 保证字面量类型
- Prisma 生成输出到 `generated/prisma/`（非默认位置）
- 不使用 `any`（ESLint 已关闭该规则，但仍应避免）
- 新增文件时按功能归类到现有目录，不创建新的顶层目录
- `components/` 扁平结构，顶层按业务/功能分文件夹
