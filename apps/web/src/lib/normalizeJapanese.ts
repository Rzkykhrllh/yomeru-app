/**
 * Normalize Japanese text for search matching
 * - Converts to lowercase
 * - Converts full-width alphanumeric to half-width
 * - Converts katakana to hiragana for matching
 */
export function normalizeJapanese(text: string): string {
  if (!text) return "";

  return (
    text
      .toLowerCase()
      // Convert full-width alphanumeric to half-width (Ａ → A, １ → 1)
      .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (char) => {
        return String.fromCharCode(char.charCodeAt(0) - 0xfee0);
      })
      // Convert katakana to hiragana (カ → か)
      .replace(/[\u30A0-\u30FF]/g, (char) => {
        const code = char.charCodeAt(0);
        // Keep special marks like ー (long vowel) and ・ (middle dot)
        if (code === 0x30fc || code === 0x30fb) {
          return char;
        }
        // Convert katakana to hiragana by subtracting 0x60
        return String.fromCharCode(code - 0x60);
      })
  );
}
