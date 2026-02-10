/**
 * One-time backfill script: convert katakana furigana to hiragana.
 *
 * Run:  npx tsx prisma/backfill-furigana-hiragana.ts
 */
import { PrismaClient } from "@prisma/client";
import { katakanaToHiragana } from "../src/utils/kanaConverter";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Fetching all vocabs...");
  const vocabs = await prisma.vocab.findMany();
  console.log(`   Found ${vocabs.length} vocabs\n`);

  let updated = 0;
  let skipped = 0;

  for (const vocab of vocabs) {
    if (!vocab.furigana) {
      console.log(`⚠️  "${vocab.word}" — no furigana, skipping`);
      skipped++;
      continue;
    }

    const converted = katakanaToHiragana(vocab.furigana);

    // Already hiragana — no change needed
    if (converted === vocab.furigana) {
      console.log(`✓  "${vocab.word}" (${vocab.furigana}) — already hiragana`);
      skipped++;
      continue;
    }

    console.log(`📝 "${vocab.word}" | furigana: "${vocab.furigana}" → "${converted}"`);

    await prisma.vocab.update({
      where: { id: vocab.id },
      data: { furigana: converted },
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
