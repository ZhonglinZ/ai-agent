# TypeScript 修复笔记：动态组件 union 过于复杂

> 案例来源：`components/agent/editor/AgentPreviewChartBlock.tsx`  
> 报错：`Expression produces a union type that is too complex to represent.`

---

## 场景

根据 JSON 配置动态选择 `@ant-design/plots` 的图表组件（Line / Column / Bar / Pie / Area），并把解析出的配置 spread 到组件 props 上。

---

## 修复前

```tsx
const CHART_COMPONENTS = {
  line: Line,
  column: Column,
  bar: Bar,
  pie: Pie,
  area: Area,
};

const chartType = String(config.type ?? "line").toLowerCase();
const ChartComponent =
  CHART_COMPONENTS[chartType as keyof typeof CHART_COMPONENTS];

return (
  <ChartComponent
    autoFit
    height={height}
    {...(restConfig as Record<string, unknown>)}
  />
);
```

**问题：** 只在 spread 处断言 `Record<string, unknown>`，无法消除报错。

---

## 修复后

```tsx
type PreviewChartProps = {
  autoFit?: boolean;
  height?: number;
  data?: unknown[];
} & Record<string, unknown>;

type PreviewChartComponent = React.ComponentType<PreviewChartProps>;

const CHART_COMPONENTS: Record<string, PreviewChartComponent> = {
  line: Line as PreviewChartComponent,
  column: Column as PreviewChartComponent,
  bar: Bar as PreviewChartComponent,
  pie: Pie as PreviewChartComponent,
  area: Area as PreviewChartComponent,
};

const chartType = String(config.type ?? "line").toLowerCase();
const ChartComponent = CHART_COMPONENTS[chartType];

return (
  <ChartComponent autoFit height={height} {...restConfig} />
);
```

---

## 根因

1. **主因：** `ChartComponent` 被推断为 `Line | Column | Bar | Pie | Area` 的 union。每个组件的 props 都嵌套了 G2 的大量配置类型，TypeScript 在 JSX 处尝试对 union 做 props 校验，组合爆炸。
2. **次因：** 配置来自 `JSON.parse`，字段是动态的，需要允许 spread 额外字段。

---

## 两部分各自的作用

| 改动 | 作用 |
|------|------|
| `as PreviewChartComponent` | **解决 union 太复杂**（关键） |
| `& Record<string, unknown>` | **允许动态 spread JSON 配置**（辅助） |

只做 `restConfig as Record<string, unknown>` 而不统一组件类型，TypeScript 仍可能对 union 报同样的错。

---

## 可复用经验

### 1. 动态组件 + 第三方复杂类型 → 提前收窄

从 map 里取组件时，不要直接让 TS 推断 union。定义一个**业务侧够用的窄类型**，在注册表处一次性断言：

```tsx
type DynamicComponent = React.ComponentType<MyProps>;
const COMPONENTS: Record<string, DynamicComponent> = {
  foo: Foo as DynamicComponent,
  bar: Bar as DynamicComponent,
};
```

断言放在**注册表**，而不是散落在每次 render 的 JSX 上，边界更清晰。

### 2. 动态 props 用「已知字段 + 索引签名」

配置来自运行时（JSON、API、CMS）时，显式列出你关心的字段，再用 `Record<string, unknown>` 兜底：

```tsx
type DynamicProps = {
  id?: string;
  title?: string;
} & Record<string, unknown>;
```

比单独断言 spread 值更安全，也比 `any` 更可维护。

### 3. 识别这类错误的典型模式

- 从对象/map 动态取 React 组件
- 组件来自 props 类型很重的第三方库（图表、编辑器、表单等）
- JSX 处 spread 动态对象
- 报错：`union type that is too complex to represent`

### 4. 替代方案（按场景选择）

| 方案 | 适用 |
|------|------|
| 注册表 + 窄类型断言 | 组件种类多、配置动态（本案例） |
| `switch` / `if` 分支分别渲染 | 种类少（2～3 个），可接受重复 JSX |
| `React.createElement(Component, props)` + 窄类型 | 不想写 JSX 时 |

### 5. 注意边界

- 这是**类型层面的收窄**，运行时行为不变。
- 窄类型不会校验 JSON 里每个字段是否合法，业务层仍需做 schema 校验（如 `data` 是否为数组）。
- 不要滥用 `as any`；`as NarrowComponentType` 通常足够且更安全。
