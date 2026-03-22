import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { AlertCircle, ArrowRight } from "lucide-react";

interface OutstandingInvoicesProps {
  invoices: Record<string, unknown>[];
}

export function OutstandingInvoices({ invoices }: OutstandingInvoicesProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertCircle className="h-4 w-4" /> Outstanding Invoices
        </CardTitle>
        <Link href="/invoices?status=sent" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-2">
        {invoices.length === 0 ? (
          <p className="text-sm text-muted-foreground">No outstanding invoices</p>
        ) : (
          invoices.map((invoice) => {
            const isOverdue = invoice.status === "overdue";
            return (
              <Link
                key={invoice.id as string}
                href={`/invoices/${invoice.id}`}
                className="flex items-center justify-between p-2 rounded-md hover:bg-accent transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">{invoice.invoice_number as string}</p>
                  <p className="text-xs text-muted-foreground">
                    {((invoice.clients as Record<string, string>)?.name) ?? "—"}
                    {invoice.due_date && ` · Due ${formatDate(invoice.due_date as string)}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${isOverdue ? "text-red-600" : ""}`}>
                    {formatCurrency((invoice.total as number) - (invoice.amount_paid as number || 0))}
                  </p>
                  {isOverdue && (
                    <Badge variant="destructive" className="text-xs">Overdue</Badge>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
