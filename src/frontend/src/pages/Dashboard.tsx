import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  Clock,
  DollarSign,
  Package,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAllOrders, useDashboardStats } from "../hooks/useQueries";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(value);
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  index,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
    >
      <Card className="shadow-card border-border/60 hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">
                {title}
              </p>
              <p className="text-2xl font-display font-bold text-foreground mt-1">
                {value}
              </p>
            </div>
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
            >
              <Icon className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

const SKELETON_IDS = ["sk-a", "sk-b", "sk-c", "sk-d"];

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: orders = [], isLoading: ordersLoading } = useAllOrders();

  const monthlyData = (() => {
    const months: Record<
      string,
      { month: string; orders: number; revenue: number }
    > = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString("default", { month: "short" });
      months[key] = { month: key, orders: 0, revenue: 0 };
    }
    for (const order of orders) {
      const d = new Date(Number(order.createdAt / 1_000_000n));
      const key = d.toLocaleString("default", { month: "short" });
      if (months[key]) {
        months[key].orders += 1;
        months[key].revenue += order.revenue;
      }
    }
    return Object.values(months);
  })();

  const statusData = [
    { name: "Pending", value: stats ? Number(stats.pendingCount) : 0 },
    { name: "Completed", value: stats ? Number(stats.completedCount) : 0 },
  ];

  const statCards = [
    {
      title: "Total Orders",
      value: statsLoading ? "—" : String(stats?.totalOrders ?? 0),
      icon: Package,
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Pending Orders",
      value: statsLoading ? "—" : String(stats?.pendingCount ?? 0),
      icon: Clock,
      color: "bg-amber-100 text-amber-600",
    },
    {
      title: "Completed Orders",
      value: statsLoading ? "—" : String(stats?.completedCount ?? 0),
      icon: CheckCircle2,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      title: "Total Revenue",
      value: statsLoading ? "—" : formatCurrency(stats?.totalRevenue ?? 0),
      icon: DollarSign,
      color: "bg-violet-100 text-violet-600",
    },
  ];

  return (
    <div className="p-8" data-ocid="dashboard.page">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Overview of your order management system
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {statsLoading
          ? SKELETON_IDS.map((id) => (
              <Card key={id} className="shadow-card">
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-3" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))
          : statCards.map((card, i) => (
              <StatCard key={card.title} {...card} index={i} />
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Card className="shadow-card border-border/60 h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <CardTitle className="text-base font-display">
                  Monthly Orders
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <Skeleton
                  className="h-56 w-full"
                  data-ocid="dashboard.loading_state"
                />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={monthlyData}
                    margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="oklch(0.88 0.02 255)"
                    />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid oklch(0.88 0.02 255)",
                        fontSize: 12,
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="orders"
                      fill="oklch(0.52 0.22 265)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <Card className="shadow-card border-border/60 h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <CardTitle className="text-base font-display">
                  Revenue Trend
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <Skeleton className="h-56 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart
                    data={monthlyData}
                    margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="oklch(0.88 0.02 255)"
                    />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid oklch(0.88 0.02 255)",
                        fontSize: 12,
                      }}
                      formatter={(v: number) => formatCurrency(v)}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="oklch(0.68 0.18 162)"
                      strokeWidth={2.5}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="lg:col-span-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <Card className="shadow-card border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display">
                Order Status Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-40 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart
                    data={statusData}
                    layout="vertical"
                    margin={{ top: 4, right: 24, left: 40, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="oklch(0.88 0.02 255)"
                      horizontal={false}
                    />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 13 }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid oklch(0.88 0.02 255)",
                        fontSize: 12,
                      }}
                    />
                    <Bar
                      dataKey="value"
                      radius={[0, 4, 4, 0]}
                      fill="oklch(0.52 0.22 265)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
