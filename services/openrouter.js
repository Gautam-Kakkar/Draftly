import axios from 'axios';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Retry configuration
const MAX_RETRIES = 3;
const BASE_DELAY = 1000; // 1 second

// Sleep function for retry delay
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Retry logic with exponential backoff
async function retryWithBackoff(fn, retries = MAX_RETRIES) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = attempt === retries - 1;
      const isRetryable = error.response?.status >= 500 || error.code === 'ECONNRESET';

      if (isLastAttempt || !isRetryable) {
        throw error;
      }

      const delay = BASE_DELAY * Math.pow(2, attempt);
      console.log(`Retry attempt ${attempt + 1}/${retries} after ${delay}ms`);
      await sleep(delay);
    }
  }
}

export async function generateContent(prompt) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is missing. Please set it in your .env file.');
  }

  try {
    const response = await retryWithBackoff(async () => {
      return await axios.post(
        OPENROUTER_API_URL,
        {
          model: 'google/gemini-2.5-flash-lite',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.SITE_URL || 'https://draftly.gautamkakkar.live',
            'X-Title': 'Ghostwriter'
          },
          timeout: 30000 // 30 second timeout
        }
      );
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    const errorMsg = error.response?.data?.error?.message || error.message;
    console.error('OpenRouter error:', errorMsg);

    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      throw new Error('Request timed out. Please try again.');
    }

    throw new Error(`OpenRouter API error: ${errorMsg}`);
  }
}
