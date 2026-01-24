import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.textVocab.deleteMany();
  await prisma.vocab.deleteMany();
  await prisma.text.deleteMany();

  // Create sample texts
  const text1 = await prisma.text.create({
    data: {
      title: "My First Japanese Text",
      content: "私は日本語を勉強しています。毎日練習します。",
      source: "Study notes",
    },
  });

  const text2 = await prisma.text.create({
    data: {
      title: "Simple Conversation",
      content: "おはようございます。今日は良い天気ですね。",
      source: null,
    },
  });

  const text3 = await prisma.text.create({
    data: {
      title: "Reading Practice",
      content: "私は本を読むのが好きです。図書館によく行きます。",
      source: "Textbook",
    },
  });

  console.log("✅ Created 3 sample texts");

  // Create sample vocabs
  const vocab1 = await prisma.vocab.create({
    data: {
      word: "勉強",
      furigana: "べんきょう",
      meaning: "study",
      notes: "Common verb for studying",
    },
  });

  const vocab2 = await prisma.vocab.create({
    data: {
      word: "毎日",
      furigana: "まいにち",
      meaning: "every day",
      notes: "Time expression",
    },
  });

  const vocab3 = await prisma.vocab.create({
    data: {
      word: "天気",
      furigana: "てんき",
      meaning: "weather",
      notes: null,
    },
  });

  const vocab4 = await prisma.vocab.create({
    data: {
      word: "図書館",
      furigana: "としょかん",
      meaning: "library",
      notes: "Public building for books",
    },
  });

  const vocab5 = await prisma.vocab.create({
    data: {
      word: "好き",
      furigana: "すき",
      meaning: "to like",
      notes: "Na-adjective",
    },
  });

  console.log("✅ Created 5 sample vocabs");

  // Link vocabs to texts (text_vocabs)
  await prisma.textVocab.create({
    data: {
      vocabId: vocab1.id,
      textId: text1.id,
      sentence: "私は日本語を勉強しています。",
    },
  });

  await prisma.textVocab.create({
    data: {
      vocabId: vocab2.id,
      textId: text1.id,
      sentence: "毎日練習します。",
    },
  });

  await prisma.textVocab.create({
    data: {
      vocabId: vocab3.id,
      textId: text2.id,
      sentence: "今日は良い天気ですね。",
    },
  });

  await prisma.textVocab.create({
    data: {
      vocabId: vocab4.id,
      textId: text3.id,
      sentence: "図書館によく行きます。",
    },
  });

  await prisma.textVocab.create({
    data: {
      vocabId: vocab5.id,
      textId: text3.id,
      sentence: "私は本を読むのが好きです。",
    },
  });

  console.log("✅ Linked vocabs to texts");

  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
