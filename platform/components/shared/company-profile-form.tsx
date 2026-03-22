"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  tax_rate: z.coerce.number().min(0).max(100),
  payment_terms: z.coerce.number().min(0),
  invoice_notes: z.string().optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

interface CompanyProfileFormProps {
  company: Record<string, unknown> | null;
  section?: "company" | "billing";
}

export function CompanyProfileForm({ company, section = "company" }: CompanyProfileFormProps) {
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: (company?.name as string) ?? "",
      address: (company?.address as string) ?? "",
      phone: (company?.phone as string) ?? "",
      email: (company?.email as string) ?? "",
      website: (company?.website as string) ?? "",
      tax_rate: (company?.tax_rate as number) ?? 0,
      payment_terms: (company?.payment_terms as number) ?? 30,
      invoice_notes: (company?.invoice_notes as string) ?? "",
    },
  });

  async function onSubmit(data: CompanyFormData) {
    setSaving(true);
    const { error } = await supabase
      .from("companies")
      .update(data)
      .eq("id", company?.id as string);

    setSaving(false);
    if (error) {
      toast.error("Failed to save settings");
    } else {
      toast.success("Settings saved");
    }
  }

  if (section === "billing") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Billing & Invoicing</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tax Rate (%)</Label>
                <Input type="number" step="0.01" {...register("tax_rate")} />
                {errors.tax_rate && (
                  <p className="text-xs text-destructive">{errors.tax_rate.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Payment Terms (days)</Label>
                <Input type="number" {...register("payment_terms")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Invoice Notes / Footer</Label>
              <Textarea
                {...register("invoice_notes")}
                placeholder="e.g. Thank you for your business!"
                rows={3}
              />
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Billing Settings"}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input {...register("name")} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input {...register("address")} placeholder="123 Main St, City, State ZIP" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input {...register("phone")} placeholder="(555) 000-0000" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" {...register("email")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Website</Label>
            <Input {...register("website")} placeholder="https://example.com" />
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Company Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
