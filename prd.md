## 需求描述

这是本项目工作流的service层，原有的存储逻辑是将数据存入localStorage进行读写，现在我已经在项目中配置了prisma 连接到本地数据库中（配置已经写好）请按照以下步骤为我逐步替换service层

1. 按照lib/services/workflowStorage.service.ts 文件中的StoredWorkflowData类型定义 创建对应的StoredWorkflow schema
2. npx prisma migrate dev --name add_stored_workflow
3. 请按照service中的方法，帮我完成prisma的script编写 重构这几个方法，路由在 app/api/workflow/[id]/route.ts 判断是否需要重构
