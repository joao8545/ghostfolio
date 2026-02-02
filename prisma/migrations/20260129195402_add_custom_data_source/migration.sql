-- CreateTable
CREATE TABLE "CustomDataSource" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "scraperConfiguration" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "CustomDataSource_pkey" PRIMARY KEY ("id")
);

-- AlterEnum
ALTER TYPE "DataSource" ADD VALUE 'CUSTOM';

-- AlterTable
ALTER TABLE "SymbolProfile" ADD COLUMN "customDataSourceId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CustomDataSource_name_key" ON "CustomDataSource"("name");

-- CreateIndex
CREATE INDEX "CustomDataSource_name_idx" ON "CustomDataSource"("name");

-- CreateIndex
CREATE INDEX "CustomDataSource_userId_idx" ON "CustomDataSource"("userId");

-- CreateIndex
CREATE INDEX "SymbolProfile_customDataSourceId_idx" ON "SymbolProfile"("customDataSourceId");

-- AddForeignKey
ALTER TABLE "CustomDataSource" ADD CONSTRAINT "CustomDataSource_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SymbolProfile" ADD CONSTRAINT "SymbolProfile_customDataSourceId_fkey" FOREIGN KEY ("customDataSourceId") REFERENCES "CustomDataSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;
