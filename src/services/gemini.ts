/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export interface GenerateResponseOptions {
  prompt: string;
  history?: ChatMessage[];
  activeFileName?: string;
  activeFileContent?: string;
  onChunk?: (chunkText: string) => void;
}

/**
 * Client-side service function that calls our secure server-side Gemini API endpoint
 * (`/api/ai/chat/stream`) which initializes `@google/genai` with process.env.GEMINI_API_KEY.
 * Streams response text back to the caller in real-time.
 */
export async function generateResponse(options: GenerateResponseOptions): Promise<string> {
  const { prompt, history = [], activeFileName, activeFileContent, onChunk } = options;

  try {
    const response = await fetch('/api/ai/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        history,
        activeFileName,
        activeFileContent,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP status ${response.status}`);
    }

    if (!response.body) {
      const json = await response.json().catch(() => ({}));
      const text = json.text || '';
      if (onChunk) onChunk(text);
      return text;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let accumulated = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) continue;

        if (trimmed === 'data: [DONE]') {
          break;
        }

        if (trimmed.startsWith('data: ')) {
          const jsonStr = trimmed.slice(6);
          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed.text) {
              accumulated += parsed.text;
              if (onChunk) {
                onChunk(parsed.text);
              }
            }
          } catch {
            // Ignore partial SSE chunk parse errors
          }
        }
      }
    }

    return accumulated;
  } catch (err: any) {
    console.warn('[Gemini Service] Falling back to non-stream endpoint:', err?.message || err);
    try {
      const fallbackRes = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, history, activeFileName, activeFileContent }),
      });
      if (!fallbackRes.ok) {
        throw new Error(`Fallback endpoint returned HTTP status ${fallbackRes.status}`);
      }

      const data = await fallbackRes.json();
      const text = typeof data.text === 'string' ? data.text : '';
      if (!text.trim()) {
        throw new Error('The AI endpoint returned an empty response.');
      }

      if (onChunk) onChunk(text);
      return text;
    } catch (fallbackErr) {
      console.error('[Gemini Service] Failed to generate response:', fallbackErr);
      throw new Error(
        fallbackErr instanceof Error
          ? `Unable to generate an AI response: ${fallbackErr.message}`
          : 'Unable to generate an AI response. Please try again.'
      );
    }
  }
}
