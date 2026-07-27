-- Add secretariaId column to processos table
ALTER TABLE "processos" ADD COLUMN "secretariaId" TEXT;

-- Add foreign key constraint
ALTER TABLE "processos" ADD CONSTRAINT "processos_secretariaId_fkey" FOREIGN KEY ("secretariaId") REFERENCES "secretarias"("id") ON DELETE SET NULL ON UPDATE CASCADE;
