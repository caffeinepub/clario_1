import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  DollarSign,
  MapPin,
  Package,
  Phone,
  Trash2,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Order } from "../backend.d";
import { useDeleteOrder, useUpdateOrderStatus } from "../hooks/useQueries";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(value);
}

function formatDate(nanoTs: bigint) {
  return new Date(Number(nanoTs / 1_000_000n)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface OrderCardProps {
  order: Order;
  index: number;
  showComplete?: boolean;
}

export default function OrderCard({
  order,
  index,
  showComplete = false,
}: OrderCardProps) {
  const updateStatus = useUpdateOrderStatus();
  const deleteOrder = useDeleteOrder();
  const [imgError, setImgError] = useState(false);

  const handleComplete = async () => {
    try {
      await updateStatus.mutateAsync(order.id);
      toast.success("Order marked as completed!");
    } catch {
      toast.error("Failed to update order status.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteOrder.mutateAsync(order.id);
      toast.success("Order deleted.");
    } catch {
      toast.error("Failed to delete order.");
    }
  };

  const photoUrl = order.photo.getDirectURL();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      data-ocid={`order.item.${index + 1}`}
    >
      <Card className="shadow-card border-border/60 hover:shadow-md transition-shadow overflow-hidden">
        {/* Photo */}
        {!imgError && photoUrl ? (
          <div className="h-40 bg-muted overflow-hidden">
            <img
              src={photoUrl}
              alt={`Order by ${order.customerName}`}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          </div>
        ) : (
          <div className="h-40 bg-muted flex items-center justify-center">
            <Package className="w-10 h-10 text-muted-foreground/40" />
          </div>
        )}

        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-display font-semibold text-foreground">
                {order.customerName}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDate(order.createdAt)}
              </p>
            </div>
            <Badge
              variant={order.status === "pending" ? "secondary" : "default"}
              className={
                order.status === "pending"
                  ? "bg-amber-100 text-amber-700 border-amber-200"
                  : "bg-emerald-100 text-emerald-700 border-emerald-200"
              }
            >
              {order.status === "pending" ? "Pending" : "Completed"}
            </Badge>
          </div>

          {/* Details */}
          <div className="space-y-1.5 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{order.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{order.address}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Qty: {String(order.quantity)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <DollarSign className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{formatCurrency(order.revenue)}</span>
            </div>
          </div>

          {order.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {order.description}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {showComplete && (
              <Button
                size="sm"
                className="flex-1"
                onClick={handleComplete}
                disabled={updateStatus.isPending}
                data-ocid={`order.complete.button.${index + 1}`}
              >
                {updateStatus.isPending ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mark Complete
                  </span>
                )}
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive border-destructive/30 hover:bg-destructive/5"
                  data-ocid={`order.delete_button.${index + 1}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent data-ocid="order.dialog">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Order?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the order for{" "}
                    {order.customerName}. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-ocid="order.cancel_button">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    data-ocid="order.confirm_button"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
