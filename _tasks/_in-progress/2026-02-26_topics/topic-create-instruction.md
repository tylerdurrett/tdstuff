For the item you were given:

Fetch the item with all its fields and attached topics by id using your Sanity skill.

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

Also, use your Sanity skill to fetch a list of all the TOPICs used so far on the site along with a count of how many posts use that topic.

Your goal is to categorize the post (using the topic sanity type).

Based on the content of the post, what are the main 2-5 topics that best encapsulate the content? Think like a blog maintainer. The topics you choose should be important aspects of the article that people might search or browse by.

You can and should create new topics as needed. Use your Sanity skill to do so. If one of the topics is already in the system, use that instead of adding a new one. If the post already has 2-5 topics, you do not need to add more. Do not create the same topic twice or attache the same topic to a post that already has it.

Use your sanity skill to create the topics (if needed) and attach them to the post.

When you have successfully attached the topics to the post, you are done.

Now:
Output the topics list, comma separated, inside <output></output> tags as part of your response.
If there is an unsolvable error (this should not happen or be exceedingly rare), output an error message in <error></error> tags.
