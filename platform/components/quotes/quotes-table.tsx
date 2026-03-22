"use client";

import { useRouter } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const statusBadge: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "outline",
  sent: "default",
  approved: "secondary",
  rejected: "destructive",
  converted: "secondary",
};

interface QuotesTableProps {
  quotes: Record<string, unknown>[];
}

export function QuotesTable({ quotes }: QuotesTableProps) {
  const router = useRouter();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Quote #</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Valid Until</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No quotes yet
              </TableCell>
            </TableRow>
          ) : (
            quotes.map((quote) => (
              <TableRow
                key={quote.id as string}
                className="cursor-pointer hover:bg-accent/50"
                onClick={() => router.push(`/quotes/${quote.id}`)}
              >
                <TableCell className="font-medium">{quote.quote_number as string}</TableCell>
                <TableCell>
                  {((quote.clients as Record<string, string>)?.name) ?? "—"}
                </TableCell>
                <TableCell>{formatCurrency(quote.total as number)}</TableCell>
                <TableCell>
                  {quote.valid_until ? formatDate(quote.valid_until as string) : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={statusBadge[quote.status as string] ?? "outline"}>
                    {quote.status as string}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(quote.created_at as string)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
