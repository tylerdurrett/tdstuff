import { BookIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const readingListType = defineType({
  name: 'readingList',
  title: 'Reading List',
  type: 'document',
  icon: BookIcon,
  fieldsets: [
    {
      name: 'summaryFields',
      title: 'Article Summary & Analysis',
      options: {
        collapsible: true,
        collapsed: false,
      },
    },
    {
      name: 'discussionFields',
      title: 'Discussion Summary',
      options: {
        collapsible: true,
        collapsed: false,
      },
    },
  ],
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'originalTitle',
      title: 'Original Title',
      type: 'string',
      description: 'The original title of the article',
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {
        source: 'title',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'originalUrl',
      title: 'Original Article URL',
      type: 'url',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'discussionUrl',
      title: 'Discussion URL',
      type: 'url',
      description: 'URL to the discussion (e.g., Hacker News comments)',
    }),
    defineField({
      name: 'category',
      title: 'Category (deprecated)',
      type: 'reference',
      to: { type: 'category' },
      deprecated: {
        reason:
          'Use "categories" field instead. This field will be removed in a future version.',
      },
      hidden: true,
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: { type: 'category' },
        },
      ],
    }),
    defineField({
      name: 'topics',
      title: 'Topics',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: { type: 'topic' },
        },
      ],
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alt text',
        }),
        defineField({
          name: 'caption',
          type: 'string',
          title: 'Caption',
        }),
      ],
    }),
    defineField({
      name: 'savedAt',
      title: 'Added to Reading List',
      type: 'datetime',
      initialValue: new Date().toISOString(),
    }),
    defineField({
      name: 'detailedSummary',
      title: 'Detailed Summary',
      type: 'text',
      description: 'A full summary, include all key information',
      fieldset: 'summaryFields',
    }),
    defineField({
      name: 'keyPoints',
      title: 'Key Points',
      type: 'array',
      description: '3-5 key points that the author makes',
      of: [{ type: 'string' }],
      fieldset: 'summaryFields',
    }),
    defineField({
      name: 'conclusion',
      title: 'Conclusion',
      type: 'text',
      description: "What's the final conclusion the author makes?",
      fieldset: 'summaryFields',
    }),
    defineField({
      name: 'shortSummary',
      title: 'Short Summary',
      type: 'text',
      description: 'A brief, 3 sentence summary',
      fieldset: 'summaryFields',
    }),
    defineField({
      name: 'gist',
      title: 'Gist',
      type: 'string',
      description: 'A one-liner that captures the essence in one sentence.',
      fieldset: 'summaryFields',
    }),
    defineField({
      name: 'newTitle',
      title: 'New Title',
      type: 'string',
      description:
        'Your version of a descriptive title based on the above. Try to communicate the gist in only a short headline.',
      fieldset: 'summaryFields',
    }),
    defineField({
      name: 'discussionDetailedSummary',
      title: 'Discussion Detailed Summary',
      type: 'text',
      description: 'A full, detailed summary, include all key information',
      fieldset: 'discussionFields',
    }),
    defineField({
      name: 'keyAgreeingViewpoints',
      title: 'Key Agreeing Viewpoints',
      type: 'array',
      description:
        'What are the key viewpoints and arguments made in agreement with the article?',
      of: [{ type: 'string' }],
      fieldset: 'discussionFields',
    }),
    defineField({
      name: 'keyOpposingViewpoints',
      title: 'Key Opposing Viewpoints',
      type: 'array',
      description:
        'What are the key viewpoints and arguments against the point of the article?',
      of: [{ type: 'string' }],
      fieldset: 'discussionFields',
    }),
    defineField({
      name: 'sentiment',
      title: 'Sentiment',
      type: 'text',
      description:
        'Overall, describe the overall sentiment of the discussion as it relates to the article at hand. Does Hacker News agree or disagree?',
      fieldset: 'discussionFields',
    }),
    defineField({
      name: 'discussionShortSummary',
      title: 'Discussion Short Summary',
      type: 'text',
      description: 'A brief, 3 sentence summary of the Hacker News discussion',
      fieldset: 'discussionFields',
    }),
    defineField({
      name: 'discussionGist',
      title: 'Discussion Gist',
      type: 'string',
      description:
        'A one-liner that captures the essence of the discussion in one sentence.',
      fieldset: 'discussionFields',
    }),
    defineField({
      name: 'discussionTitle',
      title: 'Discussion Title',
      type: 'string',
      description:
        'Your version of a descriptive title of the discussion based on the above. Try to communicate the gist in only a short headline.',
      fieldset: 'discussionFields',
    }),
    defineField({
      name: 'body',
      title: 'Summary & Notes',
      type: 'blockContent',
      description: 'Your summary, thoughts, and notes about this article',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      categories: 'categories',
      media: 'featuredImage',
    },
    prepare(selection) {
      const { categories } = selection
      const categoryTitles =
        categories?.map((cat: { title: string }) => cat.title) || []
      return {
        ...selection,
        subtitle:
          categoryTitles.length > 0
            ? categoryTitles.join(', ')
            : 'No categories',
      }
    },
  },
})
