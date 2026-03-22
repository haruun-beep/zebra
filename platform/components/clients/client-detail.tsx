"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Client, Job, Invoice } from "@/types/database";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Briefcase, FileText, Phone, Mail, MapPin, Building2, Plus } from "lucide-react";

const jobStatusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  complete: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
};

const invoiceStatusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
};

interface ClientDetailProps {
  client: Client;
  jobs: Job[];
  invoices: Invoice[];
  role: string;
}

export function ClientDetail({ client, jobs, invoices, role }: ClientDetailProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{client.name}</h1>
          {client.company_name && (
            <p className="text-muted-foreground flex items-center gap-1 mt-1">
              <Building2 className="h-4 w-4" />
              {client.company_name}
            </p>
          )}
        </div>
        {role === "admin" && (
          <div className="flex gap-2">
            <Link href={`/jobs/new?client=${client.id}`}>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" /> New Job
              </Button>
            </Link>
            <Link href={`/clients/${client.id}/edit`}>
              <Button size="sm">
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {client.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${client.phone}`} className="hover:text-primary">
                  {client.phone}
                </a>
              </div>
            )}
            {client.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${client.email}`} className="hover:text-primary">
                  {client.email}
                </a>
              </div>
            )}
            {client.address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>
                  {client.address}
                  {client.city && `, ${client.city}`}
                  {client.state && `, ${client.state}`}
                  {client.zip && ` ${client.zip}`}
                </span>
              </div>
            )}
            {client.notes && (
              <div className="pt-2 border-t text-muted-foreground">{client.notes}</div>
            )}
          </CardContent>
        </Card>

        {/* Recent jobs */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> Jobs ({jobs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {jobs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No jobs yet</p>
            ) : (
              jobs.slice(0, 5).map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer"
                  onClick={() => router.push(`/jobs/${job.id}`)}
                >
                  <div>
                    <p className="text-sm font-medium">{job.title}</p>
                    {job.scheduled_date && (
                      <p className="text-xs text-muted-foreground">
                        {formatDate(job.scheduled_date)}
                      </p>
                    )}
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${jobStatusColors[job.status]}`}
                  >
                    {job.status.replace("_", " ")}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent invoices */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" /> Invoices ({invoices.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {invoices.length === 0 ? (
              <p className="text-sm text-muted-foreground">No invoices yet</p>
            ) : (
              invoices.slice(0, 5).map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer"
                  onClick={() => router.push(`/invoices/${inv.id}`)}
                >
                  <div>
                    <p className="text-sm font-medium">{inv.invoice_number}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(inv.total)}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${invoiceStatusColors[inv.status]}`}
                  >
                    {inv.status}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
