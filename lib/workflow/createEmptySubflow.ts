// 新建 createEmptySubflow()：返回 { nodes, edges }，包含：

import { NodeType, SubflowGraph } from "./types";

export function createEmptySubflow(): SubflowGraph {
  const now = Date.now();
  return {
    nodes: [
      {
        id: `sub_start_${now}`,
        type: NodeType.START,
        data: { label: "循环开始", inputs: [], triggerType: "manual" },
        position: { x: 100, y: 160 },
      },
      {
        id: `sub_end_${now}`,
        type: NodeType.END,
        data: { label: "循环结束", outputVariables: [], endStatus: "success" },
        position: { x: 420, y: 160 },
      },
    ],
    edges: [
      {
        id: `sub_edge_${now}`,
        source: `sub_start_${now}`,
        target: `sub_end_${now}`,
      },
    ],
  };
}
