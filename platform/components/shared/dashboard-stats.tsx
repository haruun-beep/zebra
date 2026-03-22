import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, AlertCircle, TrendingUp, Clock } from "lucide-react";

interface DashboardStatsProps {
  todayJobs: number;
  outstandingTotal: number;
  monthRevenue: number;
  outstandingCount: number;
}

export function DashboardStats({
  todayJobs,
  outstandingTotal,
  monthRevenue,
  outstandingCount,
}: DashboardStatsProps) {
  const stats = [
    {
      title: "Today's Jobs",
      value: todayJobs.toString(),
      icon: Briefcase,
      description: "Scheduled for today",
      color: "text-primary",
    },
    {
      title: "Outstanding",
      value: formatCurrency(outstandingTotal),
      icon: AlertCircle,
      description: `${outstandingCount} unpaid invoice${outstandingCount !== 1 ? "s" : ""}`,
      color: outstandingTotal > 0 ? "text-orange-500" : "text-primary",
    },
    {
      title: "Revenue This Month",
      value: formatCurrency(monthRevenue),
      icon: TrendingUp,
      description: "From paid invoices",
      color: "text-primary",
    },
    {
      title: "Avg Job Duration",
      value: "—",
      icon: Clock,
      description: "Coming soon",
      color: "text-muted-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
