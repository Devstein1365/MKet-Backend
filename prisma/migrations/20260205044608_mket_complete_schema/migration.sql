/*
  Warnings:

  - The values [deleted] on the enum `ProductStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to alter the column `phone` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(15)` to `VarChar(11)`.
  - Made the column `phone` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProductStatus_new" AS ENUM ('draft', 'available', 'sold');
ALTER TABLE "products" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "products" ALTER COLUMN "status" TYPE "ProductStatus_new" USING ("status"::text::"ProductStatus_new");
ALTER TYPE "ProductStatus" RENAME TO "ProductStatus_old";
ALTER TYPE "ProductStatus_new" RENAME TO "ProductStatus";
DROP TYPE "ProductStatus_old";
ALTER TABLE "products" ALTER COLUMN "status" SET DEFAULT 'available';
COMMIT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "moderation_passed" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "status" SET DEFAULT 'available';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "phone" SET NOT NULL,
ALTER COLUMN "phone" SET DATA TYPE VARCHAR(11),
ALTER COLUMN "bio" SET DATA TYPE TEXT;
