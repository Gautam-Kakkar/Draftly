export function buildPrompt({ content, persona = 'storyteller', tone = 'professional', length = 'medium', emojiLevel = 'medium' }) {
  const lengthWords = {
    short: 100,
    medium: 200,
    long: 300
  };

  const emojiCount = {
    none: 0,
    low: 1,
    medium: 3,
    high: 5
  };

  const personas = {
    storyteller: `You are a storyteller. Structure the post as:
1. A compelling hook that grabs attention
2. A narrative that shares an experience or story
3. A clear takeaway or lesson learned`,

    data: `You are a data-driven thought leader. Structure the post as:
1. A surprising statistic or data point
2. The insight behind what this means
3. The implication for the reader`,

    advisor: `You are a practical advisor. Structure the post as:
1. A single, actionable piece of advice
2. Brief explanation (2-3 sentences)
3. Quick closing encouragement`
  };

  const toneInstructions = {
    professional: 'Use professional, business-appropriate language',
    casual: 'Use conversational, friendly language',
    bold: 'Use confident, assertive language',
    humble: 'Use modest, authentic language'
  };

  const wordLimit = lengthWords[length] || 200;
  const emojis = emojiCount[emojiLevel] || 3;
  const personaInstruction = personas[persona] || personas.storyteller;
  const toneInstruction = toneInstructions[tone] || toneInstructions.professional;

  return `You are a LinkedIn content creator.

${personaInstruction}

Tone: ${toneInstruction}

Requirements:
- Word count: Approximately ${wordLimit} words
- Emojis: Use exactly ${emojis} relevant emojis
- Format: Short paragraphs (2-3 sentences max), use line breaks
- Hashtags: Include 3-5 relevant hashtags at the end
- NO bullet points, write in flowing prose

User's raw thoughts/notes:
${content}

Generate the LinkedIn post now:`;
}
