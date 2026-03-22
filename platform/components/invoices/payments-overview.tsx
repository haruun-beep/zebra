"use client";

import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertCircle } from "lucide-react";
import Link from "next/link";

interface PaymentsOverviewProps {
  recentPayments: Record<string, unknown>[];
  overdue: Record<string, unknown>[];
}

export function PaymentsOverview({ recentPayments, overdue }: PaymentsOverviewProps) {
  const totalReceived = recentPayments.reduce(
    (sum, inv) => sum + (inv.amount_paid as number || inv.total as number || 0),
    0
  );
  const totalOverdue = overdue.reduce(
    (sum, inv) => sum + ((inv.total as number) - (inv.amount_paid as number || 0)),
    0
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Received (30 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{formatCurrency(totalReceived)}</p>
            <p className="text-xs text-muted-foreground">{recentPayments.length} payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> Overdue Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalOverdue)}</p>
            <p className="text-xs text-muted-foreground">{overdue.length} overdue invoices</p>
          </CardContent>
        </Card>
      </div>

      {overdue.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-red-600">Overdue Invoices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {overdue.map((inv) => (
              <Link
                key={inv.id as string}
                href={`/invoices/${inv.id}`}
                className="flex items-center justify-between p-3 rounded-md hover:bg-accent border border-red-100"
              >
                <div>
                  <p className="text-sm font-medium">{inv.invoice_number as string}</p>
                  <p className="text-xs text-muted-foreground">
                    {((inv.clients as Record<string, string>)?.name) ?? "—"}
                    {inv.due_date && ` · Due ${formatDate(inv.due_date as string)}`}
                  </p>
                </div>
                <p className="text-sm font-bold text-red-600">
                  {formatCurrency((inv.total as number) - (inv.amount_paid as number || 0))}
                </p>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Payments (30 days)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentPayments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments in the last 30 days</p>
          ) : (
            recentPayments.map((inv) => (
              <Link
                key={inv.id as string}
                href={`/invoices/${inv.id}`}
                className="flex items-center justify-between p-3 rounded-md hover:bg-accent"
              >
                <div>
                  <p className="text-sm font-medium">{inv.invoice_number as string}</p>
                  <p className="text-xs text-muted-foreground">
                    {((inv.clients as Record<string, string>)?.name) ?? "—"}
                    {inv.paid_at && ` · Paid ${formatDate(inv.paid_at as string)}`}
                  </p>
                </div>
                <p className="text-sm font-bold text-green-600">
                  {formatCurrency(inv.amount_paid as number || inv.total as number)}
                </p>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
