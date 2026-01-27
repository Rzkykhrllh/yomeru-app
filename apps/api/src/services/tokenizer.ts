import kuromoji from "kuromoji";
import path from "path";

let tokenizer: any = null;

// Initialize tokenizer
const initTokenizer = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (tokenizer) {
      return resolve(tokenizer);
    }

    // Try multiple possible paths
    const possiblePaths = [
      path.resolve(process.cwd(), "../../node_modules/kuromoji/dict"), // from apps/api
      path.resolve(process.cwd(), "node_modules/kuromoji/dict"), // from root
      "/Users/rizky/Desktop/Code/Personal/yomeru-app/node_modules/kuromoji/dict", // absolute
    ];

    let dicPath = possiblePaths[0];

    // Check which path exists
    const fs = require("fs");
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        dicPath = p;
        break;
      }
    }

    kuromoji.builder({ dicPath }).build((err: Error, _tokenizer: any) => {
      if (err) {
        return reject(err);
      }
      tokenizer = _tokenizer;
      resolve(tokenizer);
    });
  });
};

export interface Token {
  surface_form: string;
  pos: string;
  pos_detail_1: string;
  pos_detail_2: string;
  pos_detail_3: string;
  conjugated_type: string;
  conjugated_form: string;
  basic_form: string;
  reading: string;
  pronunciation: string;
  whitespace_before?: string; // Whitespace/formatting before this token
}

export const tokenizeText = async (text: string): Promise<Token[]> => {
  const tok = await initTokenizer();
  
  // Split text by lines to preserve line breaks
  const lines = text.split('\n');
  const allTokens: Token[] = [];
  
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    
    // Skip empty lines but add newline token (except for last line)
    if (line.trim() === '') {
      if (lineIndex < lines.length - 1) {
        allTokens.push({
          surface_form: '\n',
          pos: '',
          pos_detail_1: '',
          pos_detail_2: '',
          pos_detail_3: '',
          conjugated_type: '',
          conjugated_form: '',
          basic_form: '\n',
          reading: '',
          pronunciation: '',
          whitespace_before: '',
        });
      }
      continue;
    }
    
    // Tokenize the line
    const rawTokens = tok.tokenize(line);
    let currentPos = 0;
    
    for (const token of rawTokens) {
      const surfaceForm = token.surface_form;
      
      // Find token position in the line
      const tokenIndex = line.indexOf(surfaceForm, currentPos);
      
      // Extract whitespace before token
      const whitespaceBefore = tokenIndex > currentPos && tokenIndex !== -1
        ? line.substring(currentPos, tokenIndex)
        : '';
      
      // Update position
      if (tokenIndex !== -1) {
        currentPos = tokenIndex + surfaceForm.length;
      }
      
      allTokens.push({
        surface_form: surfaceForm,
        pos: token.pos,
        pos_detail_1: token.pos_detail_1,
        pos_detail_2: token.pos_detail_2,
        pos_detail_3: token.pos_detail_3,
        conjugated_type: token.conjugated_type,
        conjugated_form: token.conjugated_form,
        basic_form: token.basic_form,
        reading: token.reading,
        pronunciation: token.pronunciation,
        whitespace_before: whitespaceBefore,
      });
    }
    
    // Add newline token after each line (except last)
    if (lineIndex < lines.length - 1) {
      allTokens.push({
        surface_form: '\n',
        pos: '',
        pos_detail_1: '',
        pos_detail_2: '',
        pos_detail_3: '',
        conjugated_type: '',
        conjugated_form: '',
        basic_form: '\n',
        reading: '',
        pronunciation: '',
        whitespace_before: '',
      });
    }
  }
  
  return allTokens;
};
