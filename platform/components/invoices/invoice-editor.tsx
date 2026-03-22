"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { addDays, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
}

interface InvoiceEditorProps {
  companyId: string;
  clients: { id: string; name: string; email: string | null }[];
  defaultTaxRate: number;
  paymentTerms: number;
  linkedJob?: Record<string, unknown>;
  invoice?: Record<string, unknown>;
  existingItems?: LineItem[];
}

export function InvoiceEditor({
  companyId,
  clients,
  defaultTaxRate,
  paymentTerms,
  linkedJob,
  invoice,
  existingItems,
}: InvoiceEditorProps) {
  const router = useRouter();
  const supabase = createClient();

  const defaultDueDate = format(addDays(new Date(), paymentTerms), "yyyy-MM-dd");

  const [clientId, setClientId] = useState(
    (invoice?.client_id as string) ?? (linkedJob?.client_id as string) ?? ""
  );
  const [taxRate, setTaxRate] = useState((invoice?.tax_rate as number) ?? defaultTaxRate);
  const [notes, setNotes] = useState((invoice?.notes as string) ?? "");
  const [dueDate, setDueDate] = useState((invoice?.due_date as string) ?? defaultDueDate);
  const [items, setItems] = useState<LineItem[]>(
    existingItems ?? [{ description: linkedJob ? (linkedJob.title as string) : "", quantity: 1, unit_price: 0 }]
  );
  const [saving, setSaving] = useState(false);

  function addItem() {
    setItems((prev) => [...prev, { description: "", quantity: 1, unit_price: 0 }]);
  }
  function removeItem(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }
  function updateItem(i: number, field: keyof LineItem, value: string | number) {
    setItems((prev) => prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  }

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  async function handleSave() {
    if (!clientId) { toast.error("Select a client"); return; }
    setSaving(true);

    const { data: invNum } = await supabase.rpc("next_invoice_number", { p_company_id: companyId });

    const payload = {
      company_id: companyId,
      client_id: clientId,
      job_id: (linkedJob?.id as string) ?? null,
      invoice_number: invNum ?? `INV-${Date.now()}`,
      status: "draft" as const,
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total,
      notes: notes || null,
      due_date: dueDate || null,
    };

    let invoiceId = invoice?.id as string | undefined;

    if (invoiceId) {
      await supabase.from("invoices").update(payload).eq("id", invoiceId);
      await supabase.from("invoice_items").delete().eq("invoice_id", invoiceId);
    } else {
      const { data, error } = await supabase.from("invoices").insert(payload).select().single();
      if (error || !data) { toast.error("Failed to create invoice"); setSaving(false); return; }
      invoiceId = data.id;
    }

    const itemPayloads = items.map((item, i) => ({
      invoice_id: invoiceId!,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      sort_order: i,
    }));

    await supabase.from("invoice_items").insert(itemPayloads);
    setSaving(false);
    toast.success("Invoice saved");
    router.push(`/invoices/${invoiceId}`);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Invoice Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Client *</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
          {linkedJob && (
            <p className="text-sm text-muted-foreground">
              Linked to job: <strong>{linkedJob.title as string}</strong>
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Line Items</CardTitle>
          <Button size="sm" variant="outline" onClick={addItem}>
            <Plus className="h-4 w-4 mr-1" /> Add Item
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-1">
            <span className="col-span-6">Description</span>
            <span className="col-span-2">Qty</span>
            <span className="col-span-2">Unit Price</span>
            <span className="col-span-2 text-right">Total</span>
          </div>
          {items.map((item, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <Input
                className="col-span-6"
                value={item.description}
                onChange={(e) => updateItem(i, "description", e.target.value)}
                placeholder="Description"
              />
              <Input
                className="col-span-2"
                type="number"
                min="0"
                step="0.01"
                value={item.quantity}
                onChange={(e) => updateItem(i, "quantity", parseFloat(e.target.value) || 0)}
              />
              <Input
                className="col-span-2"
                type="number"
                min="0"
                step="0.01"
                value={item.unit_price}
                onChange={(e) => updateItem(i, "unit_price", parseFloat(e.target.value) || 0)}
              />
              <div className="col-span-1 text-right text-sm font-medium">
                {formatCurrency(item.quantity * item.unit_price)}
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="col-span-1 h-8 w-8 text-destructive"
                onClick={() => removeItem(i)}
                disabled={items.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <div className="border-t pt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Tax</span>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-20 h-7 text-xs"
                />
                <span className="text-muted-foreground">%</span>
              </div>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t pt-2">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Label>Notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Payment instructions or notes..."
            rows={3}
            className="mt-2"
          />
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Invoice"}
        </Button>
        <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
      </div>
    </div>
  );
}
