/*
  Warnings:

  - You are about to drop the column `hasBorder` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `hasGlass` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `hasBorder` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the column `hasGlass` on the `ProductVariant` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "MountType" AS ENUM ('NONE', 'OPTION_1', 'OPTION_2');

-- CreateEnum
CREATE TYPE "GlassType" AS ENUM ('NONE', 'OPTION_1', 'OPTION_2');

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "hasBorder",
DROP COLUMN "hasGlass",
ADD COLUMN     "glassType" "GlassType" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "mountType" "MountType" NOT NULL DEFAULT 'NONE';

-- AlterTable
ALTER TABLE "ProductVariant" DROP COLUMN "hasBorder",
DROP COLUMN "hasGlass",
ADD COLUMN     "glassType" "GlassType" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "mountType" "MountType" NOT NULL DEFAULT 'NONE';
