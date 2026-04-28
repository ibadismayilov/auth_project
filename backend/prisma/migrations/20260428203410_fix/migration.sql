-- AlterTable
ALTER TABLE "RefreshToken" ALTER COLUMN "userAgent" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "username" DROP NOT NULL;
