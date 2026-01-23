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
}

export interface Vocab {
  id: number;
  word: string;
  furigana: string | null;
  meaning: string | null;
  notes: string | null;
  created_at: string;
}

// Text yang disimpan user
export interface Text {
  id: number;
  title: string;
  content: string;           // raw Japanese text
  source: string | null;     // sumber text (optional)
  created_at: string;
}

// Junction table interface
export interface TextVocab {
  id: number;
  text_id: number;
  vocab_id: number;
  sentence: string;
  created_at: string;
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
    text_id: number;
    text_title: string;
    sentence: string;
  }>;
}

export interface TextDetailResponse extends Text {
  vocabs: Array<{
    vocab_id: number;
    word: string;
    furigana: string | null;
    sentence: string;
  }>;
}
