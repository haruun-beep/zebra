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
  paid: "secondary",
  overdue: "destructive",
  cancelled: "outline",
};

interface InvoicesTableProps {
  invoices: Record<string, unknown>[];
}

export function InvoicesTable({ invoices }: InvoicesTableProps) {
  const router = useRouter();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No invoices yet
              </TableCell>
            </TableRow>
          ) : (
            invoices.map((invoice) => (
              <TableRow
                key={invoice.id as string}
                className="cursor-pointer hover:bg-accent/50"
                onClick={() => router.push(`/invoices/${invoice.id}`)}
              >
                <TableCell className="font-medium">{invoice.invoice_number as string}</TableCell>
                <TableCell>
                  {((invoice.clients as Record<string, string>)?.name) ?? "—"}
                </TableCell>
                <TableCell>{formatCurrency(invoice.total as number)}</TableCell>
                <TableCell>
                  {invoice.due_date ? formatDate(invoice.due_date as string) : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={statusBadge[invoice.status as string] ?? "outline"}>
                    {invoice.status as string}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(invoice.created_at as string)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
