export interface Token {
  surface_form: string; // kata yang muncul di text (e.g., "食べた")
  pos: string; // part of speech (e.g., "動詞")
  pos_detail_1: string; // detail POS
  pos_detail_2: string;
  pos_detail_3: string;
  conjugated_type: string;
  conjugated_form: string;
  basic_form: string; // bentuk dasar (e.g., "食べる")
  reading: string; // cara baca katakana (e.g., "タベタ")
  pronunciation: string;
  whitespace_before?: string; // whitespace/formatting before this token
}

export interface Vocab {
  id: string;
  word: string;
  furigana: string | null;
  meaning: string | null;
  notes: string | null;
  createdAt: string;
}

// Text yang disimpan user
export interface Text {
  id: string;
  title: string | null;
  content: string; // raw Japanese text
  source: string | null; // sumber text (optional)
  createdAt: string;
}

// Junction table interface
export interface TextVocab {
  id: string;
  textId: string;
  vocabId: string;
  sentence: string;
  createdAt: string;
}

export interface TokenizeResponse {
  tokens: Token[];
}

export interface VocabsResponse {
  vocabs: Vocab[];
}

export interface TextsResponse {
  texts: Text[];
}

export interface VocabDetailResponse extends Vocab {
  appearances: Array<{
    textId: string;
    textTitle: string;
    textSource: string | null;
    sentence: string;
  }>;
}

export interface TextDetailResponse extends Text {
  vocabs: Array<{
    vocabId: string;
    word: string;
    furigana: string | null;
    sentence: string;
  }>;
}
