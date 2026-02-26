import { TagsIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const topicType = defineType({
  name: 'topic',
  title: 'Topic',
  type: 'document',
  icon: TagsIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
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
      name: 'description',
      type: 'text',
    }),
    defineField({
      name: 'parent',
      title: 'Parent Topic',
      type: 'reference',
      to: { type: 'topic' },
      options: {
        filter: ({ document }) => ({
          filter: '_id != $id',
          params: { id: document._id },
        }),
      },
    }),
  ],
})
