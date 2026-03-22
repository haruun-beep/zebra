"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials, formatDate } from "@/lib/utils";
import { UserPlus, Clock } from "lucide-react";

interface TeamManagerProps {
  teamMembers: Record<string, unknown>[];
  pendingInvites: Record<string, unknown>[];
  companyId: string;
}

export function TeamManager({ teamMembers, pendingInvites, companyId }: TeamManagerProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "technician">("technician");
  const [inviting, setInviting] = useState(false);
  const supabase = createClient();

  async function handleInvite() {
    if (!email) return;
    setInviting(true);

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("invitations").insert({
      company_id: companyId,
      email,
      role,
      created_by: user!.id,
    });

    setInviting(false);
    if (error) {
      toast.error("Failed to send invite");
    } else {
      toast.success(`Invitation sent to ${email}`);
      setEmail("");
    }
  }

  return (
    <div className="space-y-6">
      {/* Invite form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Invite Team Member
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="team@example.com"
              />
            </div>
            <div className="w-40">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as "admin" | "technician")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technician">Technician</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleInvite} disabled={inviting || !email}>
                {inviting ? "Sending..." : "Send Invite"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current members */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members ({teamMembers.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {teamMembers.map((member) => (
            <div
              key={member.id as string}
              className="flex items-center justify-between p-3 rounded-lg border"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {getInitials((member.full_name as string) ?? (member.email as string))}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{(member.full_name as string) ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">{member.email as string}</p>
                </div>
              </div>
              <Badge variant={member.role === "admin" ? "default" : "secondary"}>
                {member.role as string}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Pending invites */}
      {pendingInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Invitations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingInvites.map((invite) => (
              <div
                key={invite.id as string}
                className="flex items-center justify-between p-3 rounded-lg border border-dashed"
              >
                <div>
                  <p className="text-sm font-medium">{invite.email as string}</p>
                  <p className="text-xs text-muted-foreground">
                    Expires {formatDate(invite.expires_at as string)}
                  </p>
                </div>
                <Badge variant="outline">{invite.role as string}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
