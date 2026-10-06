# 钢卷 Agent Loop 演示配置与面试话术

面试 MVP：用现有**循环节点**当 ReAct 外壳，用 LLM **Prompt + JSON 解析**做决策，用扁平 `context.variables` 当工作记忆。不做 for-each、不做厂商 JSON mode、不做独立 Memory 节点。

## 主图

```
开始(钢卷号) → API(钢卷查询) → 循环 → 结束
```

| 节点 | 关键配置 |
| --- | --- |
| 开始 | 输入 `钢卷号`（string） |
| API | 按钢卷号查信息；输出写入如 `钢卷查询.body` |
| 循环 | `maxIterations: 5`；`breakCondition`: `{{推理.shouldStop}} == true`；outputs 如 `finalReport` → `{{汇总.text}}` |
| 结束 | 引用 `{{循环.finalReport}}` |

子图内变量与父图共享，**不必**在子图开始节点再「注入」钢卷信息；循环每轮会写 `{{循环.index}}`。

## 子图（循环体）

```
循环开始
  → 推理(LLM, JSON)
  → 分支(按 nextAction)
       ├─ 判定表面质量 → RAG 表面标准 → 表面判定(LLM text) → 循环结束
       ├─ 判定成分     → RAG 成分标准 → 成分判定(LLM text) → 循环结束
       ├─ 汇总         → 汇总(LLM text/JSON) → 循环结束
       └─ 结束 / else  → 循环结束
```

### 大脑节点「推理」

- 开启 **解析为 JSON**（`responseFormat: "json"`）
- 输出变量（名称须与 JSON 字段一致）：

| name | type | 说明 |
| --- | --- | --- |
| nextAction | string | `判定表面质量` / `判定成分` / `汇总` / `结束` |
| reasoning | string | 本轮理由 |
| shouldStop | boolean | 工具动作为 false；汇总或结束为 true |

Prompt 约定示例（节选）：

```text
你是钢卷质检 Agent。根据钢卷信息与已有判定，决定下一步动作。
只返回 JSON，不要其它文字：
{"nextAction":"...","reasoning":"...","shouldStop":false}

钢卷信息：{{钢卷查询.body}}
当前轮次：{{循环.index}}
已有表面判定：{{表面判定.text}}
已有成分判定：{{成分判定.text}}
已有汇总：{{汇总.text}}

规则：
- 缺表面判定 → nextAction=判定表面质量, shouldStop=false
- 缺成分判定 → nextAction=判定成分, shouldStop=false
- 两者齐全且无汇总 → nextAction=汇总, shouldStop=true
- 已可结束 → nextAction=结束, shouldStop=true
```

### 分支条件

- `{{推理.nextAction}} == "判定表面质量"`
- `{{推理.nextAction}} == "判定成分"`
- `{{推理.nextAction}} == "汇总"`
- else → 结束

### 工具链写回（工作记忆）

推荐三个不同 label，避免字段互相覆盖：

| 节点 label | 输出名 | 大脑下一轮引用 |
| --- | --- | --- |
| 表面判定 | text | `{{表面判定.text}}` |
| 成分判定 | text | `{{成分判定.text}}` |
| 汇总 | text（或 JSON 的 report） | `{{汇总.text}}` |

循环 outputs 映射示例：`finalReport` → `{{汇总.text}}`。

大脑 prompt 里引用上述键即可。路径互斥时每轮只跑一条工具链。

### 退出

- 循环 `breakCondition`: `{{推理.shouldStop}} == true`
- 约定：选「汇总」或「结束」时大脑必须 `shouldStop: true`；同一轮仍会跑完汇总分支再检查 break
- `maxIterations` 防止模型永不 stop

## 面试话术（约 1 分钟）

> 循环节点对外是普通 1 入 1 出，对内是一层子图。执行到循环时，引擎用 `executeGraph` 递归跑子图，每轮全新 visited，共享同一份 `context.variables`。
>
> 子图里是经典 ReAct：LLM 当大脑，输出结构化 JSON（Prompt 约束 + 服务端解析，不是厂商 JSON mode），分支按 `nextAction` 选工具（RAG + 判定），结果写回变量，下一轮大脑从变量里读「已有判定」——这就是工作记忆，没有另起 Memory 服务。
>
> `shouldStop` + `maxIterations` 负责收敛。所以 Agent Loop 在这个项目里是编排能力的组合，不是独立 Agent 框架。

## 相关实现

- `LLMNodeData.responseFormat`: `text` | `json`
- 解析：`lib/services/llmJsonOutput.ts`，由 `app/api/workflow/nodes/llm/route.ts` 调用
- 预览走同一 `executeLLMNode` API，JSON 模式会展示映射后的字段
