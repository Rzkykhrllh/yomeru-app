/**
 * One-time backfill script: normalize all vocab `word` and `furigana`
 * to their dictionary form (basic_form) via kuromoji.
 *
 * Run:  npx tsx prisma/backfill-basic-form.ts
 */
import { PrismaClient } from "@prisma/client";
import { tokenizeText } from "../src/services/tokenizer";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Fetching all vocabs...");
  const vocabs = await prisma.vocab.findMany();
  console.log(`   Found ${vocabs.length} vocabs\n`);

  let updated = 0;
  let skipped = 0;

  for (const vocab of vocabs) {
    const tokens = await tokenizeText(vocab.word);

    // Should be exactly one meaningful token for a single word
    if (tokens.length === 0) {
      console.log(`⚠️  No tokens for "${vocab.word}" — skipping`);
      skipped++;
      continue;
    }

    const token = tokens[0];
    const newWord = token.basic_form;

    // Guard: kuromoji returns "*" for unknown words (e.g. non-Japanese)
    if (newWord === "*") {
      console.log(`⚠️  "${vocab.word}" → unknown to kuromoji — skipping`);
      skipped++;
      continue;
    }

    // Guard: if kuromoji split the word into multiple tokens, the word is a compound — skip
    // (e.g. "年生" splits into "年" + "生", we don't want to lose "生")
    if (tokens.length > 1) {
      console.log(`⚠️  "${vocab.word}" — compound word (${tokens.length} tokens), skipping`);
      skipped++;
      continue;
    }

    // Already in basic_form — no change needed
    if (newWord === vocab.word) {
      console.log(`✓  "${vocab.word}" — already basic_form`);
      skipped++;
      continue;
    }

    // Fetch correct furigana by re-tokenizing the basic_form itself
    const basicTokens = await tokenizeText(newWord);
    const newFurigana = basicTokens.length > 0 ? basicTokens[0].reading : token.reading;

    // Check for duplicate: another vocab already has this basic_form
    const duplicate = await prisma.vocab.findFirst({
      where: { word: newWord, id: { not: vocab.id } },
    });

    if (duplicate) {
      console.log(`⚠️  "${vocab.word}" → "${newWord}" — duplicate exists (id: ${duplicate.id}), skipping`);
      skipped++;
      continue;
    }

    console.log(`📝 "${vocab.word}" (${vocab.furigana}) → "${newWord}" (${newFurigana})`);

    await prisma.vocab.update({
      where: { id: vocab.id },
      data: {
        word: newWord,
        furigana: newFurigana,
      },
    });

    updated++;
  }

  console.log(`\n✅ Done! Updated: ${updated}, Skipped: ${skipped}`);
}

main()
  .catch((e) => {
    console.error("❌ Backfill failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
