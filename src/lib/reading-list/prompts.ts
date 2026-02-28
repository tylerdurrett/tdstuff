/**
 * LLM prompt for scoring article sentiment.
 * Expects JSON response: { "sentimentArticle": number }
 */
export function buildArticleSentimentPrompt(articleContent: string): string {
  return `You are a sentiment analyst. Read the following article and score its overall tone on a scale from -100 to 100.

Scale:
- -100: Extremely negative, doom-laden, catastrophic framing
- -50: Notably pessimistic, warning-heavy
- 0: Neutral, factual, balanced
- 50: Notably optimistic, encouraging
- 100: Extremely positive, utopian framing

Consider the author's framing, word choice, and conclusions. Do not factor in the topic itself — a well-written article about a negative topic can still have a neutral or even positive tone if it offers solutions or balanced analysis.

Respond with ONLY a JSON object: { "sentimentArticle": <number> }

Article:
${articleContent}`
}

/**
 * LLM prompt for scoring community sentiment and controversy.
 * Expects JSON response: { "sentimentCommunity": number, "controversyScore": number }
 */
export function buildCommunitySentimentPrompt(
  articleSummary: string,
  discussionContent: string
): string {
  return `You are a community sentiment analyst. Read the article summary and the discussion comments below, then provide two scores.

1. **Community Sentiment** (-100 to 100): The overall tone of the community's reaction.
   - -100: Overwhelmingly hostile, dismissive, doom-saying
   - 0: Mixed or neutral
   - 100: Overwhelmingly enthusiastic, supportive, optimistic

2. **Controversy Score** (0 to 100): How polarizing the discussion is.
   - 0: Complete consensus (everyone agrees)
   - 50: Notably divided opinions
   - 100: Deeply divisive (strong opposing camps, heated arguments)

Consider the balance of agreeing vs. opposing viewpoints, the emotional intensity, and whether the discussion generated constructive debate or hostile conflict.

Respond with ONLY a JSON object: { "sentimentCommunity": <number>, "controversyScore": <number> }

Article Summary:
${articleSummary}

Discussion:
${discussionContent}`
}
