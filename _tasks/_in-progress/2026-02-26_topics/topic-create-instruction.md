Please use [SCRIPT] to fetch the next unprocessed item from [JSON_TASK_LIST_FILE].

For the selected item: [ITEM]

Fetch the item from Sanity CMS using your Sanity skill.

Read the entire post including all the fields. It includes these fields:

- title — Display title (required)
- originalTitle — The article's original title
- slug — URL slug, derived from title (required)
- originalUrl — Link to the source article (required)
- discussionUrl — Link to discussion (e.g. HN comments)
- category — Single category ref (deprecated, hidden)
- categories — Array of category references
- featuredImage — Image with alt text and caption
- savedAt — Datetime when added to the reading list
- detailedSummary — Full article summary
- keyPoints — 3-5 key points from the article
- conclusion — Author's final conclusion
- shortSummary — Brief 3-sentence summary
- gist — One-line essence of the article
- newTitle — Rewritten descriptive headline
- discussionDetailedSummary — Full summary of the discussion
- keyAgreeingViewpoints — Arguments agreeing with the article
- keyOpposingViewpoints — Arguments against the article
- sentiment — Overall discussion sentiment
- discussionShortSummary — Brief 3-sentence discussion summary
- discussionGist — One-line essence of the discussion
- discussionTitle — Rewritten headline for the discussion
- body — NOT USED

Also, use your Sanity skill to fetch a list of all the TOPICs used so far on the site.

Your goal is to categorize the post (using the topic sanity type).

Based on the content of the post, what are the main 2-5 topics that best encapsulate the content? You can and should create new topics as needed. Use your Sanity skill to do so. If one of the topics is already in the system, use that instead of adding a new one.

Create/attach the topics to the post as needed.

When you are done, use [SCRIPT] to mark the item as complete.
