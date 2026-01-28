/**
 * Convert katakana string to hiragana
 * Katakana range: U+30A0 to U+30FF
 * Hiragana range: U+3040 to U+309F
 * Offset: -96 (0x60)
 */
export const katakanaToHiragana = (str: string): string => {
  if (!str) return str;
  
  return str.replace(/[\u30A0-\u30FF]/g, (char) => {
    const code = char.charCodeAt(0);
    // Convert katakana to hiragana by subtracting 96
    // But keep certain characters as is:
    // ー (U+30FC) - long vowel mark
    // ・ (U+30FB) - middle dot
    if (code === 0x30FC || code === 0x30FB) {
      return char;
    }
    return String.fromCharCode(code - 0x60);
  });
};
