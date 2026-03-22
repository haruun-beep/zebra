"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Send, CheckCircle, CreditCard, ExternalLink } from "lucide-react";

const statusBadge: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "outline",
  sent: "default",
  paid: "secondary",
  overdue: "destructive",
  cancelled: "outline",
};

interface InvoiceDetailProps {
  invoice: Record<string, unknown>;
  items: Record<string, unknown>[];
  company: Record<string, unknown>;
}

export function InvoiceDetail({ invoice, items, company }: InvoiceDetailProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const client = invoice.clients as Record<string, string>;

  async function sendInvoice() {
    setLoading(true);
    await supabase
      .from("invoices")
      .update({ status: "sent" })
      .eq("id", invoice.id as string);

    // TODO: send via Resend in API route
    setLoading(false);
    toast.success("Invoice sent to client!");
    router.refresh();
  }

  async function markPaid() {
    setLoading(true);
    await supabase
      .from("invoices")
      .update({
        status: "paid",
        amount_paid: invoice.total as number,
        paid_at: new Date().toISOString(),
      })
      .eq("id", invoice.id as string);
    setLoading(false);
    toast.success("Invoice marked as paid");
    router.refresh();
  }

  async function createPaymentLink() {
    setLoading(true);
    const res = await fetch("/api/invoices/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceId: invoice.id }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.url) {
      window.open(data.url, "_blank");
    } else {
      toast.error("Failed to create payment link");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{invoice.invoice_number as string}</h1>
          <p className="text-muted-foreground">{client?.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={statusBadge[invoice.status as string] ?? "outline"}>
            {invoice.status as string}
          </Badge>
          {invoice.status === "draft" && (
            <Button onClick={sendInvoice} disabled={loading}>
              <Send className="mr-2 h-4 w-4" />
              {loading ? "Sending..." : "Send Invoice"}
            </Button>
          )}
          {(invoice.status === "sent" || invoice.status === "overdue") && (
            <>
              <Button variant="outline" onClick={createPaymentLink} disabled={loading}>
                <CreditCard className="mr-2 h-4 w-4" />
                Pay via Stripe
              </Button>
              <Button onClick={markPaid} disabled={loading}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark Paid
              </Button>
            </>
          )}
          {invoice.stripe_payment_link && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(invoice.stripe_payment_link as string, "_blank")}
            >
              <ExternalLink className="mr-2 h-4 w-4" /> Payment Link
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Bill To</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            <p className="font-medium">{client?.name}</p>
            {client?.email && <p className="text-muted-foreground">{client.email}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Invoice Info</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            <p><span className="text-muted-foreground">Issued:</span> {formatDate(invoice.created_at as string)}</p>
            {invoice.due_date && (
              <p><span className="text-muted-foreground">Due:</span> {formatDate(invoice.due_date as string)}</p>
            )}
            {invoice.paid_at && (
              <p className="text-green-600 font-medium">Paid {formatDate(invoice.paid_at as string)}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id as string}>
                  <TableCell>{item.description as string}</TableCell>
                  <TableCell className="text-right">{item.quantity as number}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.unit_price as number)}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.total as number)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 border-t pt-4 space-y-2 text-sm max-w-xs ml-auto">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(invoice.subtotal as number)}</span>
            </div>
            {(invoice.tax_rate as number) > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax ({invoice.tax_rate as number}%)</span>
                <span>{formatCurrency(invoice.tax_amount as number)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base border-t pt-2">
              <span>Total</span>
              <span>{formatCurrency(invoice.total as number)}</span>
            </div>
            {(invoice.amount_paid as number) > 0 && (
              <>
                <div className="flex justify-between text-green-600">
                  <span>Amount Paid</span>
                  <span>{formatCurrency(invoice.amount_paid as number)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Balance Due</span>
                  <span>{formatCurrency((invoice.total as number) - (invoice.amount_paid as number))}</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
