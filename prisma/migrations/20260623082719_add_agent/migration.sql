-- CreateEnum
CREATE TYPE "AgentStatus" AS ENUM ('draft', 'published', 'offline');

-- CreateTable
CREATE TABLE "agents" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "logo" TEXT NOT NULL DEFAULT 'A',
    "status" "AgentStatus" NOT NULL DEFAULT 'draft',
    "modelId" TEXT NOT NULL,
    "rolePrompt" TEXT NOT NULL DEFAULT '',
    "abilities" JSONB NOT NULL,
    "conversation" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);
