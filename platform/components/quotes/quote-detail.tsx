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
import { Send, CheckCircle, ArrowRight, Printer } from "lucide-react";

const statusBadge: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "outline",
  sent: "default",
  approved: "secondary",
  rejected: "destructive",
  converted: "secondary",
};

interface QuoteDetailProps {
  quote: Record<string, unknown>;
  items: Record<string, unknown>[];
  company: Record<string, unknown>;
}

export function QuoteDetail({ quote, items, company }: QuoteDetailProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const client = quote.clients as Record<string, string>;

  async function sendQuote() {
    setLoading(true);
    const { error } = await supabase
      .from("quotes")
      .update({ status: "sent" })
      .eq("id", quote.id as string);

    if (error) { toast.error("Failed to send quote"); setLoading(false); return; }

    // Email via API
    const approvalUrl = `${window.location.origin}/api/quotes/approve?token=${quote.approval_token}`;
    await fetch("/api/quotes/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quoteId: quote.id,
        clientEmail: client.email,
        clientName: client.name,
        companyName: company.name,
        quoteNumber: quote.quote_number,
        total: quote.total,
        approvalUrl,
        validUntil: quote.valid_until,
      }),
    });

    setLoading(false);
    toast.success("Quote sent to client!");
    router.refresh();
  }

  async function convertToJob() {
    setLoading(true);
    await supabase
      .from("quotes")
      .update({ status: "converted" })
      .eq("id", quote.id as string);
    setLoading(false);
    toast.success("Quote converted! Create a job for this client.");
    router.push(`/jobs/new?client=${quote.client_id}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{quote.quote_number as string}</h1>
          <p className="text-muted-foreground">{client?.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={statusBadge[quote.status as string] ?? "outline"}>
            {quote.status as string}
          </Badge>
          {quote.status === "draft" && (
            <Button onClick={sendQuote} disabled={loading}>
              <Send className="mr-2 h-4 w-4" />
              {loading ? "Sending..." : "Send to Client"}
            </Button>
          )}
          {quote.status === "approved" && (
            <Button onClick={convertToJob} disabled={loading}>
              <ArrowRight className="mr-2 h-4 w-4" />
              Convert to Job
            </Button>
          )}
        </div>
      </div>

      {/* Client & company info */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Bill To</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            <p className="font-medium">{client?.name}</p>
            {client?.email && <p className="text-muted-foreground">{client.email}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">From</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            <p className="font-medium">{company.name as string}</p>
            {company.address && <p className="text-muted-foreground">{company.address as string}</p>}
            {quote.valid_until && (
              <p className="text-muted-foreground">Valid until {formatDate(quote.valid_until as string)}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Line items */}
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
              <span>{formatCurrency(quote.subtotal as number)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax ({quote.tax_rate as number}%)</span>
              <span>{formatCurrency(quote.tax_amount as number)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t pt-2">
              <span>Total</span>
              <span>{formatCurrency(quote.total as number)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {quote.notes && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Notes</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm">{quote.notes as string}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
