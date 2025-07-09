import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const addRevenueSchema = z.object({
  year: z.number().min(1900).max(new Date().getFullYear() + 10),
  arr: z.number().optional(),
  revenueQ1: z.number().optional(),
  revenueQ2: z.number().optional(),
  revenueQ3: z.number().optional(),
  revenueQ4: z.number().optional(),
  projectedRevenue: z.number().optional(),
  actualRevenue: z.number().optional(),
});

type AddRevenueForm = z.infer<typeof addRevenueSchema>;

interface AddRevenueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId?: string;
}

export const AddRevenueModal = ({ open, onOpenChange, companyId }: AddRevenueModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AddRevenueForm>({
    resolver: zodResolver(addRevenueSchema),
    defaultValues: {
      year: new Date().getFullYear(),
      arr: undefined,
      revenueQ1: undefined,
      revenueQ2: undefined,
      revenueQ3: undefined,
      revenueQ4: undefined,
      projectedRevenue: undefined,
      actualRevenue: undefined,
    },
  });

  const addRevenueMutation = useMutation({
    mutationFn: async (data: AddRevenueForm) => {
      const response = await apiRequest("POST", `/api/companies/${companyId}/revenue`, {
        ...data,
        companyId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies", companyId, "revenue"] });
      toast({
        title: "Success",
        description: "Revenue report added successfully",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add revenue report",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AddRevenueForm) => {
    addRevenueMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Revenue Report</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              type="number"
              {...form.register("year", { valueAsNumber: true })}
              placeholder="2024"
            />
            {form.formState.errors.year && (
              <p className="text-sm text-red-600">{form.formState.errors.year.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="arr">ARR (Annual Recurring Revenue)</Label>
            <Input
              id="arr"
              type="number"
              {...form.register("arr", { valueAsNumber: true })}
              placeholder="1000000"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="revenueQ1">Q1 Revenue</Label>
              <Input
                id="revenueQ1"
                type="number"
                {...form.register("revenueQ1", { valueAsNumber: true })}
                placeholder="250000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="revenueQ2">Q2 Revenue</Label>
              <Input
                id="revenueQ2"
                type="number"
                {...form.register("revenueQ2", { valueAsNumber: true })}
                placeholder="300000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="revenueQ3">Q3 Revenue</Label>
              <Input
                id="revenueQ3"
                type="number"
                {...form.register("revenueQ3", { valueAsNumber: true })}
                placeholder="350000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="revenueQ4">Q4 Revenue</Label>
              <Input
                id="revenueQ4"
                type="number"
                {...form.register("revenueQ4", { valueAsNumber: true })}
                placeholder="400000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectedRevenue">Projected Revenue</Label>
              <Input
                id="projectedRevenue"
                type="number"
                {...form.register("projectedRevenue", { valueAsNumber: true })}
                placeholder="1200000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="actualRevenue">Actual Revenue</Label>
              <Input
                id="actualRevenue"
                type="number"
                {...form.register("actualRevenue", { valueAsNumber: true })}
                placeholder="1300000"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={addRevenueMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={addRevenueMutation.isPending}>
              {addRevenueMutation.isPending ? "Adding..." : "Add Revenue Report"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
