"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Client } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

const clientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  company_name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  notes: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormProps {
  companyId: string;
  client?: Client;
}

export function ClientForm({ companyId, client }: ClientFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: client?.name ?? "",
      company_name: client?.company_name ?? "",
      phone: client?.phone ?? "",
      email: client?.email ?? "",
      address: client?.address ?? "",
      city: client?.city ?? "",
      state: client?.state ?? "",
      zip: client?.zip ?? "",
      notes: client?.notes ?? "",
    },
  });

  async function onSubmit(data: ClientFormData) {
    if (client) {
      const { error } = await supabase
        .from("clients")
        .update(data)
        .eq("id", client.id);
      if (error) { toast.error("Failed to update client"); return; }
      toast.success("Client updated");
      router.push(`/clients/${client.id}`);
    } else {
      const { data: newClient, error } = await supabase
        .from("clients")
        .insert({ ...data, company_id: companyId })
        .select()
        .single();
      if (error || !newClient) { toast.error("Failed to create client"); return; }
      toast.success("Client created");
      router.push(`/clients/${newClient.id}`);
    }
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Input {...register("company_name")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input {...register("phone")} placeholder="(555) 000-0000" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Street Address</Label>
            <Input {...register("address")} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>City</Label>
              <Input {...register("city")} />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Input {...register("state")} maxLength={2} placeholder="CA" />
            </div>
            <div className="space-y-2">
              <Label>ZIP</Label>
              <Input {...register("zip")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea {...register("notes")} rows={3} />
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : client ? "Update Client" : "Create Client"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
