-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "aadharVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "ageVerified" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "User_aadharVerified_idx" ON "public"."User"("aadharVerified");
