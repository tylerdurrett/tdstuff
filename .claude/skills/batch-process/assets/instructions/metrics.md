For the item you were given:

## Step 1: Fetch the item

Fetch the item with all its fields by `_id` using your Sanity skill. You need these fields:

- `_id`
- `title`
- `originalUrl`
- `discussionUrl`
- `savedAt`
- `detailedSummary`
- `keyPoints`
- `conclusion`
- `shortSummary`
- `gist`
- `sentiment`
- `keyAgreeingViewpoints`
- `keyOpposingViewpoints`
- `discussionDetailedSummary`
- `discussionShortSummary`
- `hnScore` (may already be set)
- `hnCommentCount` (may already be set)
- `sentimentArticle` (may already be set)
- `sentimentCommunity` (may already be set)
- `controversyScore` (may already be set)

If ALL five metric fields are already set, skip this item — output `<output>{"skipped": true, "reason": "metrics already set"}</output>` and emit your completion marker.

## Step 2: Score article sentiment

Based on the article's `detailedSummary`, `keyPoints`, `conclusion`, `shortSummary`, and `gist`, score the article's overall tone on a scale from **-100 to 100** (integer).

**Scoring guidelines:**

- **-100**: Extremely negative, doom-laden, catastrophic framing
- **-50**: Notably pessimistic, warning-heavy
- **0**: Neutral, factual, balanced
- **50**: Notably optimistic, encouraging
- **100**: Extremely positive, utopian framing

Consider the author's framing, word choice, and conclusions. Do NOT factor in the topic itself — a well-written article about a negative topic can still have a neutral or positive tone if it offers solutions or balanced analysis.

If the article has no summary fields at all (all are null/empty), set `sentimentArticle` to `0` (neutral).

Record your `sentimentArticle` score.

## Step 3: Fetch HN data (if applicable)

Check if `discussionUrl` exists and contains `news.ycombinator.com/item?id=`.

**If yes:**

1. Extract the HN item ID from the URL (the `id` query parameter).
2. Fetch the HN API: `https://hacker-news.firebaseio.com/v0/item/{id}.json`
3. From the response, extract:
   - `score` → this becomes `hnScore`
   - `descendants` → this becomes `hnCommentCount`

If the HN API call fails or the URL doesn't match the pattern, set `hnScore` and `hnCommentCount` to `null` and continue.

**If no `discussionUrl`:** Leave `hnScore` and `hnCommentCount` as `null`.

## Step 4: Score community sentiment and controversy (if applicable)

**Only if the item has discussion fields** (`sentiment`, `keyAgreeingViewpoints`, `keyOpposingViewpoints`, or `discussionDetailedSummary` — at least one must be non-null/non-empty):

Based on these discussion fields, provide two scores:

### Community Sentiment (-100 to 100, integer)

- **-100**: Overwhelmingly hostile, dismissive, doom-saying
- **0**: Mixed or neutral
- **100**: Overwhelmingly enthusiastic, supportive, optimistic

### Controversy Score (0 to 100, integer)

- **0**: Complete consensus (everyone agrees)
- **50**: Notably divided opinions
- **100**: Deeply divisive (strong opposing camps, heated arguments)

Consider the balance of agreeing vs. opposing viewpoints, the emotional intensity, and whether the discussion generated constructive debate or hostile conflict.

If there are no discussion fields at all, leave `sentimentCommunity` and `controversyScore` as `null`.

Record your `sentimentCommunity` and `controversyScore` scores.

## Step 5: Patch the Sanity document

Use your Sanity skill to patch the document by `_id`. Set only the fields you computed (skip null values — do NOT write null to fields that should remain unset).

Example patch (adjust values based on your scoring):

```bash
node .claude/skills/sanity-cms/scripts/mutate.js --action patch --id "THE_DOCUMENT_ID" --set '{"sentimentArticle": 25, "hnScore": 342, "hnCommentCount": 187, "sentimentCommunity": -15, "controversyScore": 65}'
```

For non-HN items (no discussion), only set `sentimentArticle`:

```bash
node .claude/skills/sanity-cms/scripts/mutate.js --action patch --id "THE_DOCUMENT_ID" --set '{"sentimentArticle": 25}'
```

## Step 6: Report results

When you have successfully patched the document, report your results and emit your stop code.

Include an output tag with the values you set:

```
<output>{"sentimentArticle": 25, "hnScore": 342, "hnCommentCount": 187, "sentimentCommunity": -15, "controversyScore": 65}</output>
```

Then emit `<promise>COMPLETE</promise>`.
