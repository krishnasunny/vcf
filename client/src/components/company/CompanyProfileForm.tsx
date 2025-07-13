import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const updateProfileSchema = z.object({
  company: z.object({
    legalName: z.string().min(1, "Legal name is required"),
    aka: z.string().optional(),
    website: z.string().url().optional().or(z.literal("")),
    industryType: z.enum(["SAAS", "HARDWARE", "BIOTECH", "FINTECH", "OTHER"]),
    industryDetail: z.string().optional(),
    currentValuation: z.number().optional(),
    monthlyBurn: z.number().optional(),
    runwayMonths: z.number().optional(),
    teamSize: z.number().optional(),
  }),
  founder: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    phone: z.string().optional(),
    linkedInUrl: z.string().url().optional().or(z.literal("")),
    isWomanFounder: z.boolean().default(false),
  }),
});

type UpdateProfileForm = z.infer<typeof updateProfileSchema>;

interface CompanyProfileFormProps {
  company: any;
  founder: any;
}

export const CompanyProfileForm = ({ company, founder }: CompanyProfileFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<UpdateProfileForm>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      company: {
        legalName: company?.legalName || "",
        aka: company?.aka || "",
        website: company?.website || "",
        industryType: company?.industryType || "SAAS",
        industryDetail: company?.industryDetail || "",
        currentValuation: company?.currentValuation || undefined,
        monthlyBurn: company?.monthlyBurn || undefined,
        runwayMonths: company?.runwayMonths || undefined,
        teamSize: company?.teamSize || undefined,
      },
      founder: {
        firstName: founder?.firstName || "",
        lastName: founder?.lastName || "",
        phone: founder?.phone || "",
        linkedInUrl: founder?.linkedInUrl || "",
        isWomanFounder: founder?.isWomanFounder || false,
      },
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfileForm) => {
      const promises = [];
      
      if (company?.id) {
        promises.push(
          apiRequest("PUT", `/api/companies/${company.id}`, data.company)
        );
      }
      
      if (founder?.id) {
        promises.push(
          apiRequest("PUT", `/api/founders/${founder.id}`, data.founder)
        );
      }
      
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-company"] });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UpdateProfileForm) => {
    updateProfileMutation.mutate(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Company Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-800">Company Information</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company.legalName">Legal Name</Label>
              <Input
                id="company.legalName"
                {...form.register("company.legalName")}
                placeholder="Company Legal Name"
              />
              {form.formState.errors.company?.legalName && (
                <p className="text-sm text-red-600">{form.formState.errors.company.legalName.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company.aka">Also Known As</Label>
              <Input
                id="company.aka"
                {...form.register("company.aka")}
                placeholder="DBA or common name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company.website">Website</Label>
              <Input
                id="company.website"
                type="url"
                {...form.register("company.website")}
                placeholder="https://company.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company.industryType">Industry Type</Label>
              <Select
                value={form.watch("company.industryType")}
                onValueChange={(value) => form.setValue("company.industryType", value as any)}
              >
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
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company.industryDetail">Industry Detail</Label>
              <Textarea
                id="company.industryDetail"
                {...form.register("company.industryDetail")}
                placeholder="Describe your industry focus..."
                rows={3}
              />
            </div>
          </div>
        </div>
        
        {/* Founder Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-800">Founder Information</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="founder.firstName">First Name</Label>
                <Input
                  id="founder.firstName"
                  {...form.register("founder.firstName")}
                  placeholder="First name"
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
                  placeholder="Last name"
                />
                {form.formState.errors.founder?.lastName && (
                  <p className="text-sm text-red-600">{form.formState.errors.founder.lastName.message}</p>
                )}
              </div>
            </div>
            
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
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="founder.isWomanFounder"
                checked={form.watch("founder.isWomanFounder")}
                onCheckedChange={(checked) => form.setValue("founder.isWomanFounder", !!checked)}
              />
              <Label htmlFor="founder.isWomanFounder">Woman founder</Label>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={updateProfileMutation.isPending}
          className="px-6"
        >
          {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
        </Button>
      </div>
    </form>
  );
};
