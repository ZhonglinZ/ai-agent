import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../generated/prisma/client";
import type { Agent } from "../lib/types/agent";

/** 原 agentListStore 中的 INITIAL_MOCK_AGENTS */
const MOCK_AGENTS: Agent[] = [
  {
    id: "agent_001",
    name: "客服助手",
    status: "published",
    description: "面向企业客服场景，支持 FAQ、工单分流与多轮对话。",
    logo: "客",
    modelId: "deepseek-r1",
    rolePrompt:
      "你是一个专业的客服助手，负责解答用户问题、处理工单分流。请保持友好、专业的态度。",
    abilities: {
      knowledgeBases: [{ id: "kb_001", name: "产品FAQ知识库" }],
      workflows: [],
    },
    conversation: {
      openingStatement: "您好！我是客服助手，有什么可以帮您的吗？",
      suggestedQuestions: ["如何退款？", "订单查询", "联系人工客服"],
    },
    createdAt: "2025-05-01T09:30:00.000Z",
    updatedAt: "2025-05-01T09:30:00.000Z",
  },
  {
    id: "agent_002",
    name: "数据分析官",
    status: "draft",
    description: "将数据表格转为洞察报告，支持自定义指标解读。",
    logo: "数",
    modelId: "gpt-4o",
    rolePrompt:
      "你是一个数据分析专家，擅长从数据中发现洞察，生成清晰的分析报告。",
    abilities: {
      knowledgeBases: [],
      workflows: [{ id: "wf_001", name: "数据分析流程" }],
    },
    conversation: {
      openingStatement: "您好！请上传您的数据，我来帮您分析。",
      suggestedQuestions: ["分析销售趋势", "生成月度报告", "对比同期数据"],
    },
    createdAt: "2025-04-28T14:12:00.000Z",
    updatedAt: "2025-04-28T14:12:00.000Z",
  },
  {
    id: "agent_003",
    name: "运营策划师",
    status: "published",
    description: "用于活动策划与内容生成，可结合历史数据生成方案。",
    logo: "运",
    modelId: "claude-3.5",
    rolePrompt: "你是一个资深运营策划师，擅长活动策划、内容创作和用户增长。",
    abilities: {
      knowledgeBases: [{ id: "kb_002", name: "运营案例库" }],
      workflows: [{ id: "wf_002", name: "活动策划流程" }],
    },
    conversation: {
      openingStatement: "您好！我是运营策划师，可以帮您策划活动、生成内容。",
      suggestedQuestions: ["策划双11活动", "写一篇推广文案", "分析竞品活动"],
    },
    createdAt: "2025-04-26T18:08:00.000Z",
    updatedAt: "2025-04-26T18:08:00.000Z",
  },
];

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    for (const agent of MOCK_AGENTS) {
      await prisma.agent.upsert({
        where: { id: agent.id },
        create: {
          id: agent.id,
          name: agent.name,
          description: agent.description,
          logo: agent.logo,
          status: agent.status,
          modelId: agent.modelId,
          rolePrompt: agent.rolePrompt,
          abilities: agent.abilities,
          conversation: agent.conversation,
          createdAt: new Date(agent.createdAt),
          updatedAt: new Date(agent.updatedAt),
        },
        update: {
          name: agent.name,
          description: agent.description,
          logo: agent.logo,
          status: agent.status,
          modelId: agent.modelId,
          rolePrompt: agent.rolePrompt,
          abilities: agent.abilities,
          conversation: agent.conversation,
          updatedAt: new Date(agent.updatedAt),
        },
      });
    }

    console.log(`Seeded ${MOCK_AGENTS.length} agents.`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
