'use client'

import Link from 'next/link'
import { X } from 'lucide-react'
import { ReadingListCard } from '@/components/blog/ReadingListCard'
import { CategoryPills } from '@/components/blog/CategoryPills'
import { ReadingListItemMeta } from '@/models/readingList'
import { Category } from '@/models/category'
import { PaginationControls } from '@/components/ui/PaginationControls'
import { usePagination } from '@/hooks/usePagination'
import { Badge } from '@/components/ui/badge'

interface ReadingListPageClientProps {
  items: ReadingListItemMeta[]
  categories: Category[]
  currentPage: number
  totalItems: number
  pageSize: number
  selectedCategory: string | null
  selectedTopic: string | null
  activeTopicTitle: string | null
}

export function ReadingListPageClient({
  items,
  categories,
  currentPage,
  totalItems,
  pageSize,
  selectedCategory,
  selectedTopic,
  activeTopicTitle,
}: ReadingListPageClientProps) {
  const {
    pagination,
    pageNumbers,
    showPagination,
    handlePageChange,
    generateUrl,
  } = usePagination({
    currentPage,
    totalItems,
    pageSize,
    basePath: '/reading',
  })

  const clearTopicHref = selectedCategory
    ? `/reading?category=${selectedCategory}`
    : '/reading'

  return (
    <div className="relative">
      <CategoryPills
        categories={categories}
        selectedCategory={selectedCategory}
        basePath="/reading"
      />
      {activeTopicTitle && (
        <div className="flex items-center justify-center mb-6 -mt-4">
          <Badge
            variant="secondary"
            className="flex items-center gap-1.5 px-3 py-1 text-sm"
          >
            <span>Topic: {activeTopicTitle}</span>
            <Link
              href={clearTopicHref}
              aria-label="Clear topic filter"
              className="ml-1 rounded-full p-0.5 transition-colors hover:bg-secondary-foreground/10"
            >
              <X className="h-3 w-3" />
            </Link>
          </Badge>
        </div>
      )}
      {items.length === 0 ? (
        <p className="px-4 text-muted-foreground sm:px-6 lg:px-8">
          {selectedCategory || selectedTopic
            ? 'No reading list items match this filter.'
            : 'No reading list items yet. Check back soon!'}
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <ReadingListCard key={item._id} item={item} />
            ))}
          </div>
          {showPagination && (
            <PaginationControls
              pagination={pagination}
              pageNumbers={pageNumbers}
              onPageChange={handlePageChange}
              generateUrl={generateUrl}
            />
          )}
        </>
      )}
    </div>
  )
}
