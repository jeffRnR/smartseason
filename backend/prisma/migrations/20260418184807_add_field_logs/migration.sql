-- CreateTable
CREATE TABLE "field_logs" (
    "id" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "prevStage" "Stage" NOT NULL,
    "newStage" "Stage" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "field_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "field_logs_fieldId_idx" ON "field_logs"("fieldId");

-- CreateIndex
CREATE INDEX "field_logs_agentId_idx" ON "field_logs"("agentId");

-- AddForeignKey
ALTER TABLE "field_logs" ADD CONSTRAINT "field_logs_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "field_logs" ADD CONSTRAINT "field_logs_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
