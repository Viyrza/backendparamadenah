import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Pagination } from '@/components/ui/pagination'

export type DataTableData<T = Record<string, any>> = {
    id: number
} & T

export type DataTableRows<T = Record<string, any>> = DataTableData<T>[]

export type DataTableColumns = {
    key: string
    title: string
    isImage?: boolean
    isVideo?: boolean
    isAudio?: boolean
    className?: string
}[]

export type DataTableProps<T = Record<string, any>> = {
    columns: DataTableColumns
    rows: DataTableRows<T>
    isLoading?: boolean
    isError?: boolean
    errorMessages?: string
    refreshCb?: () => void
    className?: string
    emptyMessage?: string
    // Pagination props
    pagination?: {
        currentPage: number
        totalPages: number
        pageSize: number
        total: number
        onPageChange: (page: number) => void
    }
}

const RenderCell = <T extends Record<string, any>>(
    column: DataTableColumns[number],
    row: DataTableData<T>
) => {
    const cell = row[column.key]

    if (typeof cell === 'function') {
        return cell(row)
    }

    if (typeof cell === 'boolean') {
        return (
            <span
                className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    cell
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                )}
            >
                {cell ? 'Yes' : 'No'}
            </span>
        )
    }

    if (typeof cell === 'number') {
        return <span className="font-mono">{cell.toLocaleString()}</span>
    }

    if (cell instanceof Date) {
        return (
            <span className="text-sm text-gray-600">
                {cell.toLocaleDateString()}
            </span>
        )
    }

    if (typeof cell === 'string' && cell.length > 50) {
        return (
            <span className="block max-w-xs truncate" title={cell}>
                {cell}
            </span>
        )
    }

    return cell || '-'
}

export default function DataTable<T = Record<string, any>>({
    columns,
    rows,
    isLoading = false,
    isError = false,
    errorMessages,
    refreshCb,
    className,
    emptyMessage = 'No data available',
    pagination,
}: DataTableProps<T>) {
    // Error State
    if (!isLoading && isError) {
        return (
            <Card className={cn('w-full', className)}>
                <CardContent className="flex flex-col items-center justify-center py-16 border-b">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Something went wrong
                    </h3>
                    <p className="text-red-600 text-center mb-4 max-w-sm">
                        {errorMessages ||
                            'An error occurred while loading the data'}
                    </p>
                    {refreshCb && (
                        <Button
                            onClick={refreshCb}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Try Again
                        </Button>
                    )}
                </CardContent>
            </Card>
        )
    }

    if (isLoading) {
        return (
            <Card className={cn('w-full', className)}>
                <CardContent className="p-0">
                    <div className="overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    {columns.map((column) => (
                                        <TableHead
                                            key={column.key}
                                            className={cn(
                                                'bg-gray-50 font-semibold text-gray-900',
                                                column.className
                                            )}
                                        >
                                            {column.title}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <TableRow
                                        key={index}
                                        className="hover:bg-transparent"
                                    >
                                        {columns.map((column) => (
                                            <TableCell
                                                key={column.key}
                                                className="py-4"
                                            >
                                                <Skeleton className="h-8 w-full rounded-md" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        )
    }

    // Empty State
    if (!isLoading && rows.length === 0) {
        return (
            <Card className={cn('w-full', className)}>
                <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Table className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No data found
                    </h3>
                    <p className="text-gray-500 text-center max-w-sm">
                        {emptyMessage}
                    </p>
                </CardContent>
            </Card>
        )
    }

    // Data Table
    return (
        <div className={cn('w-full space-y-4', className)}>
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-gray-100">
                                    {columns.map((column) => (
                                        <TableHead
                                            key={column.key}
                                            className={cn(
                                                'bg-gray-50 font-semibold text-gray-900 h-12',
                                                column.className
                                            )}
                                        >
                                            {column.title}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map((row, index) => (
                                    <TableRow
                                        key={row.id}
                                        className={cn(
                                            'border-gray-50 hover:bg-gray-50/50 transition-colors',
                                            index % 2 === 0
                                                ? 'bg-white'
                                                : 'bg-gray-50/30'
                                        )}
                                    >
                                        {columns.map((column) => (
                                            <TableCell
                                                key={column.key}
                                                className={cn(
                                                    'py-4',
                                                    column.className
                                                )}
                                            >
                                                {RenderCell(column, row)}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    pageSize={pagination.pageSize}
                    total={pagination.total}
                    onPageChange={pagination.onPageChange}
                />
            )}
        </div>
    )
}
