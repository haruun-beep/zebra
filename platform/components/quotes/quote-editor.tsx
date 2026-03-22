"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
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

interface QuoteEditorProps {
  companyId: string;
  clients: { id: string; name: string; email: string | null }[];
  defaultTaxRate: number;
  quote?: Record<string, unknown>;
  existingItems?: LineItem[];
}

export function QuoteEditor({
  companyId,
  clients,
  defaultTaxRate,
  quote,
  existingItems,
}: QuoteEditorProps) {
  const router = useRouter();
  const supabase = createClient();

  const [clientId, setClientId] = useState((quote?.client_id as string) ?? "");
  const [taxRate, setTaxRate] = useState((quote?.tax_rate as number) ?? defaultTaxRate);
  const [notes, setNotes] = useState((quote?.notes as string) ?? "");
  const [validUntil, setValidUntil] = useState((quote?.valid_until as string) ?? "");
  const [items, setItems] = useState<LineItem[]>(
    existingItems ?? [{ description: "", quantity: 1, unit_price: 0 }]
  );
  const [saving, setSaving] = useState(false);

  function addItem() {
    setItems((prev) => [...prev, { description: "", quantity: 1, unit_price: 0 }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof LineItem, value: string | number) {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  }

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  async function handleSave(asDraft = true) {
    if (!clientId) { toast.error("Select a client"); return; }
    if (items.some((i) => !i.description)) { toast.error("All items need a description"); return; }

    setSaving(true);

    // Get quote number
    const { data: qNum } = await supabase.rpc("next_quote_number", { p_company_id: companyId });

    const quotePayload = {
      company_id: companyId,
      client_id: clientId,
      quote_number: qNum ?? `Q-${Date.now()}`,
      status: asDraft ? "draft" : "sent",
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total,
      notes: notes || null,
      valid_until: validUntil || null,
    };

    let quoteId = quote?.id as string | undefined;

    if (quoteId) {
      const { error } = await supabase.from("quotes").update(quotePayload).eq("id", quoteId);
      if (error) { toast.error("Failed to save quote"); setSaving(false); return; }
      await supabase.from("quote_items").delete().eq("quote_id", quoteId);
    } else {
      const { data, error } = await supabase.from("quotes").insert(quotePayload).select().single();
      if (error || !data) { toast.error("Failed to create quote"); setSaving(false); return; }
      quoteId = data.id;
    }

    // Insert items
    const itemPayloads = items.map((item, i) => ({
      quote_id: quoteId!,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      sort_order: i,
    }));

    await supabase.from("quote_items").insert(itemPayloads);

    setSaving(false);
    toast.success(asDraft ? "Quote saved as draft" : "Quote saved");
    router.push(`/quotes/${quoteId}`);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Quote Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Client *</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Valid Until</Label>
              <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Line items */}
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
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-center">
              <Input
                className="col-span-6"
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateItem(index, "description", e.target.value)}
              />
              <Input
                className="col-span-2"
                type="number"
                min="0"
                step="0.01"
                value={item.quantity}
                onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value) || 0)}
              />
              <Input
                className="col-span-2"
                type="number"
                min="0"
                step="0.01"
                value={item.unit_price}
                onChange={(e) => updateItem(index, "unit_price", parseFloat(e.target.value) || 0)}
              />
              <div className="col-span-1 text-right text-sm font-medium">
                {formatCurrency(item.quantity * item.unit_price)}
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="col-span-1 h-8 w-8 text-destructive"
                onClick={() => removeItem(index)}
                disabled={items.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {/* Totals */}
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
            placeholder="Any additional notes for the client..."
            rows={3}
            className="mt-2"
          />
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={() => handleSave(true)} variant="outline" disabled={saving}>
          Save as Draft
        </Button>
        <Button onClick={() => handleSave(false)} disabled={saving}>
          {saving ? "Saving..." : "Save Quote"}
        </Button>
        <Button variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
