/**
 * 节点注册中心
 *
 * 使用注册表模式（Registry Pattern）管理所有节点类型
 * 好处：
 * 1. 集中管理：所有节点配置在一个地方
 * 2. 动态注册：可以在运行时添加新节点类型
 * 3. 解耦：核心代码不需要知道具体有哪些节点
 */

import type { NodeConfig, NodeType, NodeCategory, WorkflowNodeData } from './types';

class NodeRegistry {
  /**
   * 使用 Map 存储节点配置
   * key: 节点类型（NodeType 枚举值）
   * value: 节点配置对象
   */
  private registry: Map<NodeType, NodeConfig> = new Map();
    /**
   * 注册一个节点类型
   *
   * @param config 节点配置
   * @throws 如果节点类型已存在，会打印警告
   */
  register<T extends WorkflowNodeData>(config: NodeConfig<T>): void {
    if (this.registry.has(config.type)) {
      console.warn(`节点类型 ${config.type} 已存在，将被覆盖`);
    }
    this.registry.set(config.type, config as unknown as NodeConfig);
  }
    /**
   * 获取指定类型的节点配置
   */
  get(type: NodeType): NodeConfig | undefined {
    return this.registry.get(type);
  }

  /**
   * 获取所有节点配置
   */
  getAll(): NodeConfig[] {
    return Array.from(this.registry.values());
  }

  /**
   * 按分类获取节点配置
   * 用于在左侧面板中分组显示节点
   */
  getByCategory(category: NodeCategory): NodeConfig[] {
    return this.getAll().filter(config => config.category === category);
  }

    /**
   * 获取 ReactFlow 需要的 nodeTypes 映射
   *
   * ReactFlow 的 nodeTypes 是一个对象：
   * {
   *   'start': StartNodeComponent,
   *   'end': EndNodeComponent,
   * }
   *
   * 这个方法从注册表中提取所有节点组件，构建这个映射
   */
  getNodeTypes(): Record<string, React.ComponentType<unknown>> {
    const nodeTypes: Record<string, React.ComponentType<unknown>> = {};

    this.registry.forEach((config, type) => {
      nodeTypes[type] = config.component as React.ComponentType<unknown>;
    });

    return nodeTypes;
  }
    /**
   * 获取指定类型节点的默认数据
   * 用于创建新节点时初始化数据
   */
  getDefaultData(type: NodeType): WorkflowNodeData | undefined {
    const config = this.registry.get(type);
    return config?.defaultData;
  }

 /**
   * 检查节点类型是否已注册
   * 
   * @param type 节点类型
   * @returns 是否已注册
   */
  has(type: NodeType): boolean {
    return this.registry.has(type);
  }

  /**
   * 获取已注册的节点类型数量
   */
  get size(): number {
    return this.registry.size;
  }
}
  /**
 * 导出单例实例
 *
 * 使用单例模式确保整个应用只有一个注册中心实例
 * 这样所有地方注册的节点都会在同一个注册表中
 */
export const nodeRegistry = new NodeRegistry();