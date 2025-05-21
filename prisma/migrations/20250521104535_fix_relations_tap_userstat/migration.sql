-- CreateTable
CREATE TABLE "Tap" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "roundId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,

    CONSTRAINT "Tap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserStat" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "roundId" TEXT NOT NULL,
    "tapCount" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Tap_userId_idx" ON "Tap"("userId");

-- CreateIndex
CREATE INDEX "Tap_roundId_idx" ON "Tap"("roundId");

-- CreateIndex
CREATE INDEX "UserStat_userId_idx" ON "UserStat"("userId");

-- CreateIndex
CREATE INDEX "UserStat_roundId_idx" ON "UserStat"("roundId");

-- CreateIndex
CREATE UNIQUE INDEX "UserStat_userId_roundId_key" ON "UserStat"("userId", "roundId");

-- AddForeignKey
ALTER TABLE "Tap" ADD CONSTRAINT "Tap_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tap" ADD CONSTRAINT "Tap_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStat" ADD CONSTRAINT "UserStat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStat" ADD CONSTRAINT "UserStat_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
