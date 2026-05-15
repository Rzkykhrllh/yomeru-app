-- CreateTable: users
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AlterTable: add user_id to vocabs (nullable first for backfill)
ALTER TABLE "vocabs" ADD COLUMN "user_id" TEXT;

-- AlterTable: add user_id to texts (nullable first for backfill)
ALTER TABLE "texts" ADD COLUMN "user_id" TEXT;

-- Create a default system user to own existing data
INSERT INTO "users" ("id", "email", "created_at")
VALUES ('system_migration_user', 'migration@yomeru.local', NOW())
ON CONFLICT DO NOTHING;

-- Backfill existing vocabs with the migration user
UPDATE "vocabs" SET "user_id" = 'system_migration_user' WHERE "user_id" IS NULL;

-- Backfill existing texts with the migration user
UPDATE "texts" SET "user_id" = 'system_migration_user' WHERE "user_id" IS NULL;

-- Make user_id NOT NULL now that all rows have a value
ALTER TABLE "vocabs" ALTER COLUMN "user_id" SET NOT NULL;
ALTER TABLE "texts" ALTER COLUMN "user_id" SET NOT NULL;

-- Drop the old global unique constraint on vocabs.word
DROP INDEX IF EXISTS "vocabs_word_key";

-- CreateIndex: unique per user+word
CREATE UNIQUE INDEX "vocabs_user_id_word_key" ON "vocabs"("user_id", "word");

-- AddForeignKey
ALTER TABLE "vocabs" ADD CONSTRAINT "vocabs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "texts" ADD CONSTRAINT "texts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
