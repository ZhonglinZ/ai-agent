-- CreateEnum
CREATE TYPE "WorkflowRunMode" AS ENUM ('once', 'periodic');

-- CreateEnum
CREATE TYPE "WorkflowStatus" AS ENUM ('offline', 'online');

-- CreateTable
CREATE TABLE "stored_workflows" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "runMode" "WorkflowRunMode" NOT NULL,
    "status" "WorkflowStatus" NOT NULL,
    "nodes" JSONB NOT NULL,
    "edges" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stored_workflows_pkey" PRIMARY KEY ("id")
);
