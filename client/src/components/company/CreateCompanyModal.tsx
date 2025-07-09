import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const createCompanySchema = z.object({
  legalName: z.string().min(1, "Legal name is required"),
  aka: z.string().optional(),
  countryReg: z.string().min(1, "Country registration is required"),
  countyOps: z.string().min(1, "County operations is required"),
  website: z.string().url().optional().or(z.literal("")),
  industryType: z.enum(["SAAS", "HARDWARE", "BIOTECH", "FINTECH", "OTHER"]),
  industryDetail: z.string().optional(),
  vintageYear: z.number().min(1900).max(new Date().getFullYear()),
  founder: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    phone: z.string().optional(),
    linkedInUrl: z.string().url().optional().or(z.literal("")),
    isWomanFounder: z.boolean().default(false),
  }),
});

type CreateCompanyForm = z.infer<typeof createCompanySchema>;

interface CreateCompanyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateCompanyModal = ({ open, onOpenChange }: CreateCompanyModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateCompanyForm>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {
      legalName: "",
      aka: "",
      countryReg: "",
      countyOps: "",
      website: "",
      industryType: "SAAS",
      industryDetail: "",
      vintageYear: new Date().getFullYear(),
      founder: {
        firstName: "",
        lastName: "",
        phone: "",
        linkedInUrl: "",
        isWomanFounder: false,
      },
    },
  });

  const createCompanyMutation = useMutation({
    mutationFn: async (data: CreateCompanyForm) => {
      const response = await apiRequest("POST", "/api/companies", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({
        title: "Success",
        description: "Company created successfully",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create company",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: CreateCompanyForm) => {
    setIsLoading(true);
    await createCompanyMutation.mutateAsync(data);
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Portfolio Company</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="legalName">Legal Name</Label>
              <Input
                id="legalName"
                {...form.register("legalName")}
                placeholder="Company Legal Name"
              />
              {form.formState.errors.legalName && (
                <p className="text-sm text-red-600">{form.formState.errors.legalName.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="aka">Also Known As</Label>
              <Input
                id="aka"
                {...form.register("aka")}
                placeholder="DBA or common name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="countryReg">Country Registration</Label>
              <Input
                id="countryReg"
                {...form.register("countryReg")}
                placeholder="e.g., United States"
              />
              {form.formState.errors.countryReg && (
                <p className="text-sm text-red-600">{form.formState.errors.countryReg.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="countyOps">County Operations</Label>
              <Input
                id="countyOps"
                {...form.register("countyOps")}
                placeholder="e.g., California"
              />
              {form.formState.errors.countyOps && (
                <p className="text-sm text-red-600">{form.formState.errors.countyOps.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                {...form.register("website")}
                placeholder="https://company.com"
              />
              {form.formState.errors.website && (
                <p className="text-sm text-red-600">{form.formState.errors.website.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vintageYear">Vintage Year</Label>
              <Input
                id="vintageYear"
                type="number"
                {...form.register("vintageYear", { valueAsNumber: true })}
                placeholder="2024"
              />
              {form.formState.errors.vintageYear && (
                <p className="text-sm text-red-600">{form.formState.errors.vintageYear.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industryType">Industry Type</Label>
              <Select onValueChange={(value) => form.setValue("industryType", value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SAAS">SAAS</SelectItem>
                  <SelectItem value="HARDWARE">HARDWARE</SelectItem>
                  <SelectItem value="BIOTECH">BIOTECH</SelectItem>
                  <SelectItem value="FINTECH">FINTECH</SelectItem>
                  <SelectItem value="OTHER">OTHER</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.industryType && (
                <p className="text-sm text-red-600">{form.formState.errors.industryType.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="industryDetail">Industry Detail</Label>
              <Input
                id="industryDetail"
                {...form.register("industryDetail")}
                placeholder="Describe industry focus"
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">Founder Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="founder.firstName">First Name</Label>
                <Input
                  id="founder.firstName"
                  {...form.register("founder.firstName")}
                  placeholder="John"
                />
                {form.formState.errors.founder?.firstName && (
                  <p className="text-sm text-red-600">{form.formState.errors.founder.firstName.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="founder.lastName">Last Name</Label>
                <Input
                  id="founder.lastName"
                  {...form.register("founder.lastName")}
                  placeholder="Smith"
                />
                {form.formState.errors.founder?.lastName && (
                  <p className="text-sm text-red-600">{form.formState.errors.founder.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="founder.phone">Phone</Label>
                <Input
                  id="founder.phone"
                  {...form.register("founder.phone")}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="founder.linkedInUrl">LinkedIn URL</Label>
                <Input
                  id="founder.linkedInUrl"
                  type="url"
                  {...form.register("founder.linkedInUrl")}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-4">
              <Checkbox
                id="founder.isWomanFounder"
                checked={form.watch("founder.isWomanFounder")}
                onCheckedChange={(checked) => form.setValue("founder.isWomanFounder", !!checked)}
              />
              <Label htmlFor="founder.isWomanFounder">Woman founder</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Company"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
