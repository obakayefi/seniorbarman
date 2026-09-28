"use client";

import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2, Inbox } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface ColumnDef<T> {
  header: React.ReactNode;
  accessorKey?: keyof T;
  cell?: (row: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  pagination?: PaginationState;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  limitOptions?: number[];
  rowKey?: (row: T, index: number) => string;
  className?: string;
  containerClassName?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  emptyMessage = "No records found.",
  emptyIcon,
  pagination,
  onPageChange,
  onLimitChange,
  limitOptions = [5, 10, 20, 50],
  rowKey,
  className,
  containerClassName,
}: DataTableProps<T>) {
  const getRowKey = (row: T, index: number): string => {
    if (rowKey) return rowKey(row, index);
    if (row._id) return String(row._id);
    if (row.id) return String(row.id);
    return `row-${index}`;
  };

  return (
    <div className={`space-y-4 w-full ${containerClassName || ""}`}>
      <div className={`rounded-md border border-border bg-card shadow-sm overflow-hidden ${className || ""}`}>
        <Table>
          <TableHeader className="bg-muted/60 dark:bg-zinc-900/60 border-b border-border">
            <TableRow className="hover:bg-transparent border-border">
              {columns.map((col, idx) => (
                <TableHead
                  key={idx}
                  className={`text-[10px] uppercase tracking-widest font-black text-muted-foreground py-3.5 px-4 ${
                    col.headerClassName || ""
                  }`}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="h-44 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-7 w-7 animate-spin text-orange-500" />
                    <p className="text-xs font-semibold animate-pulse">Loading data...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="h-44 text-center py-10">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground/60">
                    {emptyIcon || <Inbox className="h-9 w-9 opacity-40" />}
                    <p className="text-xs font-medium text-muted-foreground max-w-sm italic">
                      {emptyMessage}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rIdx) => (
                <TableRow
                  key={getRowKey(row, rIdx)}
                  className="border-border hover:bg-muted/40 transition-colors"
                >
                  {columns.map((col, cIdx) => (
                    <TableCell
                      key={cIdx}
                      className={`px-4 py-3.5 text-xs text-foreground align-middle ${col.className || ""}`}
                    >
                      {col.cell
                        ? col.cell(row, rIdx)
                        : col.accessorKey
                        ? String(row[col.accessorKey] ?? "")
                        : null}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Bar */}
      {pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-1 text-xs text-muted-foreground">
          {/* Item count summary */}
          <div className="flex items-center gap-4">
            <span>
              Showing{" "}
              <strong className="text-foreground font-bold">
                {pagination.total === 0
                  ? 0
                  : (pagination.page - 1) * pagination.limit + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-foreground font-bold">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </strong>{" "}
              of <strong className="text-foreground font-bold">{pagination.total}</strong> entries
            </span>

            {onLimitChange && (
              <div className="flex items-center gap-1.5">
                <span className="hidden sm:inline text-[11px]">Per page:</span>
                <Select
                  value={String(pagination.limit)}
                  onValueChange={(val) => onLimitChange(Number(val))}
                >
                  <SelectTrigger className="h-7 w-[70px] text-xs bg-background border-border">
                    <SelectValue placeholder={String(pagination.limit)} />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {limitOptions.map((opt) => (
                      <SelectItem key={opt} value={String(opt)} className="text-xs">
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange?.(1)}
              disabled={pagination.page <= 1 || loading}
              className="h-8 w-8 rounded-md"
              title="First Page"
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={!pagination.hasPrevPage && pagination.page <= 1 || loading}
              className="h-8 w-8 rounded-md"
              title="Previous Page"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>

            <span className="px-3 font-semibold text-foreground text-xs">
              Page {pagination.page} of {Math.max(1, pagination.totalPages)}
            </span>

            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={!pagination.hasNextPage && pagination.page >= pagination.totalPages || loading}
              className="h-8 w-8 rounded-md"
              title="Next Page"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange?.(pagination.totalPages)}
              disabled={pagination.page >= pagination.totalPages || loading}
              className="h-8 w-8 rounded-md"
              title="Last Page"
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
