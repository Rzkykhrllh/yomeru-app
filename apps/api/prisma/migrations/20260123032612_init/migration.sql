-- CreateTable
CREATE TABLE "vocabs" (
    "id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "furigana" TEXT,
    "meaning" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vocabs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "texts" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "source" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "texts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "text_vocabs" (
    "id" TEXT NOT NULL,
    "vocab_id" TEXT NOT NULL,
    "text_id" TEXT NOT NULL,
    "sentence" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "text_vocabs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "text_vocabs" ADD CONSTRAINT "text_vocabs_vocab_id_fkey" FOREIGN KEY ("vocab_id") REFERENCES "vocabs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "text_vocabs" ADD CONSTRAINT "text_vocabs_text_id_fkey" FOREIGN KEY ("text_id") REFERENCES "texts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
