-- AlterTable: add updated_at to vocabs with default for existing rows
ALTER TABLE "vocabs" ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT NOW();
ALTER TABLE "vocabs" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable: add updated_at to texts with default for existing rows
ALTER TABLE "texts" ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT NOW();
ALTER TABLE "texts" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable: add updated_at to text_vocabs with default for existing rows
ALTER TABLE "text_vocabs" ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT NOW();
ALTER TABLE "text_vocabs" ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateIndex: unique constraint on vocabs.word
CREATE UNIQUE INDEX "vocabs_word_key" ON "vocabs"("word");

-- CreateIndex: unique constraint on text_vocabs(vocab_id, text_id, sentence)
CREATE UNIQUE INDEX "text_vocabs_vocab_id_text_id_sentence_key" ON "text_vocabs"("vocab_id", "text_id", "sentence");
