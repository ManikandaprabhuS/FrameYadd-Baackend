/*
  Warnings:

  - A unique constraint covering the columns `[phoneNumber]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `phoneNumber` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `users` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "addressLine" TEXT,
ADD COLUMN     "cityName" TEXT,
ADD COLUMN     "countryName" TEXT,
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "phoneNumber" TEXT NOT NULL,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
ADD COLUMN     "stateName" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "name" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_phoneNumber_key" ON "users"("phoneNumber");
