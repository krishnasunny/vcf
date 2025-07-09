import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const addFundraisingSchema = z.object({
  roundYear: z.number().min(1900).max(new Date().getFullYear() + 10),
  amountUSD: z.number().min(0, "Amount must be positive"),
  roundType: z.enum(["SAFE", "CONVERTIBLE", "EQUITY"]),
  coInvestors: z.string().optional(),
  notes2025: z.string().optional(),
});

type AddFundraisingForm = z.infer<typeof addFundraisingSchema>;

interface AddFundraisingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId?: string;
}

export const AddFundraisingModal = ({ open, onOpenChange, companyId }: AddFundraisingModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AddFundraisingForm>({
    resolver: zodResolver(addFundraisingSchema),
    defaultValues: {
      roundYear: new Date().getFullYear(),
      amountUSD: 0,
      roundType: "SAFE",
      coInvestors: "",
      notes2025: "",
    },
  });

  const addFundraisingMutation = useMutation({
    mutationFn: async (data: AddFundraisingForm) => {
      const response = await apiRequest("POST", `/api/companies/${companyId}/fundraising`, {
        ...data,
        companyId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies", companyId, "fundraising"] });
      toast({
        title: "Success",
        description: "Fundraising round added successfully",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add fundraising round",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AddFundraisingForm) => {
    addFundraisingMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Fundraising Round</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="roundYear">Round Year</Label>
              <Input
                id="roundYear"
                type="number"
                {...form.register("roundYear", { valueAsNumber: true })}
                placeholder="2024"
              />
              {form.formState.errors.roundYear && (
                <p className="text-sm text-red-600">{form.formState.errors.roundYear.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amountUSD">Amount (USD)</Label>
              <Input
                id="amountUSD"
                type="number"
                {...form.register("amountUSD", { valueAsNumber: true })}
                placeholder="500000"
              />
              {form.formState.errors.amountUSD && (
                <p className="text-sm text-red-600">{form.formState.errors.amountUSD.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="roundType">Round Type</Label>
            <Select
              value={form.watch("roundType")}
              onValueChange={(value) => form.setValue("roundType", value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select round type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SAFE">SAFE</SelectItem>
                <SelectItem value="CONVERTIBLE">Convertible Note</SelectItem>
                <SelectItem value="EQUITY">Equity Round</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.roundType && (
              <p className="text-sm text-red-600">{form.formState.errors.roundType.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="coInvestors">Co-investors</Label>
            <Input
              id="coInvestors"
              {...form.register("coInvestors")}
              placeholder="e.g., Angel Group, Venture Capital"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes2025">Notes</Label>
            <Textarea
              id="notes2025"
              {...form.register("notes2025")}
              placeholder="Additional notes about this round..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={addFundraisingMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={addFundraisingMutation.isPending}>
              {addFundraisingMutation.isPending ? "Adding..." : "Add Fundraising Round"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
