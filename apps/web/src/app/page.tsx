'use client';

import { useState } from "react";

interface Token {
  surface_form: string;
  pos: string;
  pos_detail_1: string;
  basic_form: string;
  reading: string;
}

export default function Home() {

  const [text, setText] = useState('');
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setEror] = useState('');

  const handleTokenize = async () => {
    if (!text.trim()){
      setEror('Please enter some text to tokenize.');
      return;
    }

    setLoading(true);
    setEror('');

    try {
      const response = await fet
    } catch (err) {

    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Paste Japanese Text</h1>
        <div className="space-y-4">
          className="w-full min-h-[200px] p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          <textarea
            placeholder="Paste your Japanese text here..."
          />
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Tokenize
          </button>
        </div>
      </div>
    </main>
  );
}
