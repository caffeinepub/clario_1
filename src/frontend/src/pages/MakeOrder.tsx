import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import { ImageIcon, Loader2, X } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { useCreateOrder } from "../hooks/useQueries";

export default function MakeOrder() {
  const navigate = useNavigate();
  const createOrder = useCreateOrder();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    address: "",
    quantity: "",
    description: "",
    revenue: "",
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleInput =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
  };

  const removePhoto = () => {
    setPhotoFile(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoFile) {
      toast.error("Please upload a photo");
      return;
    }
    const qty = Number.parseInt(form.quantity);
    const rev = Number.parseFloat(form.revenue);
    if (Number.isNaN(qty) || qty < 1) {
      toast.error("Please enter a valid quantity");
      return;
    }
    if (Number.isNaN(rev) || rev < 0) {
      toast.error("Please enter a valid revenue amount");
      return;
    }

    try {
      setUploadProgress(0);
      const bytes = new Uint8Array(await photoFile.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((p) =>
        setUploadProgress(p),
      );

      await createOrder.mutateAsync({
        customerName: form.customerName,
        phone: form.phone,
        address: form.address,
        quantity: BigInt(qty),
        description: form.description,
        photo: blob,
        revenue: rev,
      });

      toast.success("Order created successfully!");
      navigate({ to: "/pending-orders" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to create order. Please try again.");
      setUploadProgress(0);
    }
  };

  const isPending = createOrder.isPending;

  return (
    <div className="p-8 max-w-2xl mx-auto" data-ocid="make_order.page">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">
            Make Order
          </h1>
          <p className="text-muted-foreground mt-1">
            Fill in the details to create a new order
          </p>
        </div>

        <Card className="shadow-card border-border/60">
          <CardHeader>
            <CardTitle className="font-display">Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
              data-ocid="make_order.modal"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    placeholder="John Doe"
                    value={form.customerName}
                    onChange={handleInput("customerName")}
                    required
                    autoComplete="name"
                    data-ocid="make_order.customerName.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={form.phone}
                    onChange={handleInput("phone")}
                    required
                    autoComplete="tel"
                    data-ocid="make_order.phone.input"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="123 Main St, City, State"
                  value={form.address}
                  onChange={handleInput("address")}
                  required
                  autoComplete="street-address"
                  data-ocid="make_order.address.input"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    placeholder="1"
                    value={form.quantity}
                    onChange={handleInput("quantity")}
                    required
                    data-ocid="make_order.quantity.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="revenue">Revenue ($)</Label>
                  <Input
                    id="revenue"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={form.revenue}
                    onChange={handleInput("revenue")}
                    required
                    data-ocid="make_order.revenue.input"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Order description..."
                  value={form.description}
                  onChange={handleInput("description")}
                  rows={3}
                  data-ocid="make_order.description.textarea"
                />
              </div>

              <div className="space-y-2">
                <Label>Photo</Label>
                {photoPreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-border bg-muted">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-1.5 hover:bg-background transition-colors"
                      data-ocid="make_order.photo.delete_button"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 hover:border-primary/50 hover:bg-muted/50 transition-all"
                    data-ocid="make_order.photo.dropzone"
                  >
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">
                        Click to upload photo
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        PNG, JPG up to 10MB
                      </p>
                    </div>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  data-ocid="make_order.photo.upload_button"
                />
              </div>

              {isPending && uploadProgress > 0 && (
                <div
                  className="space-y-1.5"
                  data-ocid="make_order.loading_state"
                >
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Uploading photo...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isPending}
                data-ocid="make_order.submit_button"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Order...
                  </>
                ) : (
                  <>Create Order</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
