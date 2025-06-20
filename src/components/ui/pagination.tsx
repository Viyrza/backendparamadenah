import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
    currentPage: number
    totalPages: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
}

export function Pagination({
    currentPage,
    totalPages,
    pageSize,
    total,
    onPageChange,
}: PaginationProps) {
    const startItem = (currentPage - 1) * pageSize + 1
    const endItem = Math.min(currentPage * pageSize, total)

    const getPageNumbers = () => {
        const pages = []

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            pages.push(1)

            if (currentPage > 3) {
                pages.push('...')
            }

            const start = Math.max(2, currentPage - 1)
            const end = Math.min(totalPages - 1, currentPage + 1)

            for (let i = start; i <= end; i++) {
                pages.push(i)
            }

            if (currentPage < totalPages - 2) {
                pages.push('...')
            }

            pages.push(totalPages)
        }

        return pages
    }

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1)
        }
    }

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1)
        }
    }

    const handlePageClick = (page: number) => {
        if (page !== currentPage) {
            onPageChange(page)
        }
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {' '}
            <p className="text-sm text-gray-500">
                Showing{' '}
                <span className="font-medium text-gray-900">{startItem}</span>{' '}
                to <span className="font-medium text-gray-900">{endItem}</span>{' '}
                of <span className="font-medium text-gray-900">{total}</span>{' '}
                items
            </p>
            <div className="flex items-center gap-1">
                <Button
                    variant="outline"
                    size="icon"
                    disabled={currentPage === 1}
                    onClick={handlePrevious}
                    className="h-9 w-9 rounded-lg border-slate-100"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Previous page</span>
                </Button>

                {getPageNumbers().map((page, index) =>
                    page === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-2">
                            ...
                        </span>
                    ) : (
                        <Button
                            key={`page-${page}`}
                            variant={
                                page === currentPage ? 'default' : 'outline'
                            }
                            size="icon"
                            className={`h-9 w-9 rounded-lg ${
                                page === currentPage
                                    ? 'bg-slate-800 hover:bg-slate-700 text-white'
                                    : 'border-gray-200'
                            }`}
                            onClick={() => handlePageClick(Number(page))}
                        >
                            {page}
                        </Button>
                    )
                )}

                <Button
                    variant="outline"
                    size="icon"
                    disabled={currentPage === totalPages}
                    onClick={handleNext}
                    className="h-9 w-9 rounded-lg border-gray-200"
                >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Next page</span>
                </Button>
            </div>
        </div>
    )
}
