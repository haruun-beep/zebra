"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanyProfileForm } from "@/components/shared/company-profile-form";
import { TeamManager } from "@/components/shared/team-manager";

interface SettingsTabsProps {
  profile: Record<string, unknown> | null;
  company: Record<string, unknown> | null;
  teamMembers: Record<string, unknown>[];
  pendingInvites: Record<string, unknown>[];
}

export function SettingsTabs({
  profile,
  company,
  teamMembers,
  pendingInvites,
}: SettingsTabsProps) {
  return (
    <Tabs defaultValue="company" className="space-y-4">
      <TabsList>
        <TabsTrigger value="company">Company Profile</TabsTrigger>
        <TabsTrigger value="team">Team</TabsTrigger>
        <TabsTrigger value="billing">Billing & Invoicing</TabsTrigger>
      </TabsList>

      <TabsContent value="company">
        <CompanyProfileForm company={company} />
      </TabsContent>

      <TabsContent value="team">
        <TeamManager
          teamMembers={teamMembers}
          pendingInvites={pendingInvites}
          companyId={profile?.company_id as string}
        />
      </TabsContent>

      <TabsContent value="billing">
        <CompanyProfileForm company={company} section="billing" />
      </TabsContent>
    </Tabs>
  );
}
