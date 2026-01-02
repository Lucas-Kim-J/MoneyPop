const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || '';
const apiBaseUrl = import.meta.env.VITE_DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
const apiModel = import.meta.env.VITE_DEEPSEEK_MODEL || 'deepseek-chat';

export async function callDeepSeek(prompt) {
  if (!apiKey) {
    console.error('Missing VITE_DEEPSEEK_API_KEY');
    return null;
  }

  try {
    const response = await fetch(`${apiBaseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: apiModel,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (error) {
    console.error('DeepSeek API Error:', error);
    return null;
  }
}
