import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { OrderStatus } from "../backend";
import OrderCard from "../components/OrderCard";
import { useOrdersByStatus } from "../hooks/useQueries";

const SKELETON_IDS = ["sk-a", "sk-b", "sk-c"];

export default function PendingOrders() {
  const { data: orders = [], isLoading } = useOrdersByStatus(
    OrderStatus.pending,
  );

  return (
    <div className="p-8" data-ocid="pending_orders.page">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Pending Orders
            </h1>
            <p className="text-muted-foreground text-sm">
              {isLoading
                ? "Loading..."
                : `${orders.length} order${orders.length !== 1 ? "s" : ""} awaiting completion`}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
            data-ocid="pending_orders.loading_state"
          >
            {SKELETON_IDS.map((id) => (
              <Card key={id} className="shadow-card">
                <Skeleton className="h-40 w-full rounded-none" />
                <CardContent className="p-5 space-y-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-8 w-full mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-24 text-center"
            data-ocid="pending_orders.empty_state"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <h3 className="font-display font-semibold text-foreground text-lg">
              No pending orders
            </h3>
            <p className="text-muted-foreground text-sm mt-1">
              All caught up! New orders will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            <AnimatePresence>
              {orders.map((order, i) => (
                <OrderCard
                  key={String(order.id)}
                  order={order}
                  index={i}
                  showComplete
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}
