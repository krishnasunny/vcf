import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const updateCompanySchema = z.object({
  legalName: z.string().min(1, "Legal name is required"),
  aka: z.string().optional(),
  countryReg: z.string().min(1, "Country registration is required"),
  countyOps: z.string().min(1, "County operations is required"),
  website: z.string().url().optional().or(z.literal("")),
  industryType: z.enum(["SAAS", "HARDWARE", "BIOTECH", "FINTECH", "OTHER"]),
  industryDetail: z.string().optional(),
  vintageYear: z.number().min(1900).max(new Date().getFullYear()),
  currentValuation: z.number().optional(),
  cashInflow: z.number().optional(),
  cashOutflow: z.number().optional(),
  monthlyBurn: z.number().optional(),
  runwayMonths: z.number().optional(),
  teamSize: z.number().optional(),
});

const updateFounderSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  isWomanFounder: z.boolean().default(false),
});

type UpdateCompanyForm = z.infer<typeof updateCompanySchema>;
type UpdateFounderForm = z.infer<typeof updateFounderSchema>;

interface EditCompanyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string | null;
}

export const EditCompanyModal = ({ open, onOpenChange, companyId }: EditCompanyModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const { data: company, isLoading: isCompanyLoading } = useQuery({
    queryKey: ["/api/companies", companyId],
    enabled: !!companyId && open,
    staleTime: 300000,
  });

  const { data: founder, isLoading: isFounderLoading } = useQuery({
    queryKey: ["/api/companies", companyId, "founder"],
    enabled: !!companyId && open,
    staleTime: 300000,
  });

  const companyForm = useForm<UpdateCompanyForm>({
    resolver: zodResolver(updateCompanySchema),
    defaultValues: {
      legalName: "",
      aka: "",
      countryReg: "",
      countyOps: "",
      website: "",
      industryType: "SAAS",
      industryDetail: "",
      vintageYear: new Date().getFullYear(),
      currentValuation: undefined,
      cashInflow: undefined,
      cashOutflow: undefined,
      monthlyBurn: undefined,
      runwayMonths: undefined,
      teamSize: undefined,
    },
  });

  const founderForm = useForm<UpdateFounderForm>({
    resolver: zodResolver(updateFounderSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      linkedinUrl: "",
      isWomanFounder: false,
    },
  });

  // Update form values when data loads
  useEffect(() => {
    if (company) {
      companyForm.reset({
        legalName: company.legalName || "",
        aka: company.aka || "",
        countryReg: company.countryReg || "",
        countyOps: company.countyOps || "",
        website: company.website || "",
        industryType: company.industryType || "SAAS",
        industryDetail: company.industryDetail || "",
        vintageYear: company.vintageYear || new Date().getFullYear(),
        currentValuation: company.currentValuation || undefined,
        cashInflow: company.cashInflow || undefined,
        cashOutflow: company.cashOutflow || undefined,
        monthlyBurn: company.monthlyBurn || undefined,
        runwayMonths: company.runwayMonths || undefined,
        teamSize: company.teamSize || undefined,
      });
    }
  }, [company, companyForm]);

  useEffect(() => {
    if (founder) {
      founderForm.reset({
        firstName: founder.firstName || "",
        lastName: founder.lastName || "",
        phone: founder.phone || "",
        linkedinUrl: founder.linkedinUrl || "",
        isWomanFounder: founder.isWomanFounder || false,
      });
    }
  }, [founder, founderForm]);

  const updateCompanyMutation = useMutation({
    mutationFn: async (data: UpdateCompanyForm) => {
      const response = await apiRequest("PUT", `/api/companies/${companyId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/companies", companyId] });
      toast({
        title: "Success",
        description: "Company updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update company",
        variant: "destructive",
      });
    },
  });

  const updateFounderMutation = useMutation({
    mutationFn: async (data: UpdateFounderForm) => {
      const response = await apiRequest("PUT", `/api/founders/${founder?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies", companyId, "founder"] });
      toast({
        title: "Success",
        description: "Founder updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update founder",
        variant: "destructive",
      });
    },
  });

  const onSubmitCompany = async (data: UpdateCompanyForm) => {
    setIsLoading(true);
    await updateCompanyMutation.mutateAsync(data);
    setIsLoading(false);
  };

  const onSubmitFounder = async (data: UpdateFounderForm) => {
    setIsLoading(true);
    await updateFounderMutation.mutateAsync(data);
    setIsLoading(false);
  };

  if (isCompanyLoading || isFounderLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!company) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
          </DialogHeader>
          <div className="p-6 text-center">
            <p className="text-slate-600">Company not found</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Company: {company.legalName}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="company" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="company">Company Information</TabsTrigger>
            <TabsTrigger value="founder">Founder Information</TabsTrigger>
          </TabsList>
          
          <TabsContent value="company" className="space-y-4">
            <form onSubmit={companyForm.handleSubmit(onSubmitCompany)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="legalName">Legal Name</Label>
                  <Input
                    id="legalName"
                    {...companyForm.register("legalName")}
                    placeholder="Company Legal Name"
                  />
                  {companyForm.formState.errors.legalName && (
                    <p className="text-sm text-red-600">{companyForm.formState.errors.legalName.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="aka">Also Known As</Label>
                  <Input
                    id="aka"
                    {...companyForm.register("aka")}
                    placeholder="DBA or common name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="countryReg">Country Registration</Label>
                  <Input
                    id="countryReg"
                    {...companyForm.register("countryReg")}
                    placeholder="e.g., United States"
                  />
                  {companyForm.formState.errors.countryReg && (
                    <p className="text-sm text-red-600">{companyForm.formState.errors.countryReg.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="countyOps">County Operations</Label>
                  <Input
                    id="countyOps"
                    {...companyForm.register("countyOps")}
                    placeholder="e.g., California"
                  />
                  {companyForm.formState.errors.countyOps && (
                    <p className="text-sm text-red-600">{companyForm.formState.errors.countyOps.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    {...companyForm.register("website")}
                    placeholder="https://company.com"
                  />
                  {companyForm.formState.errors.website && (
                    <p className="text-sm text-red-600">{companyForm.formState.errors.website.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="vintageYear">Vintage Year</Label>
                  <Input
                    id="vintageYear"
                    type="number"
                    {...companyForm.register("vintageYear", { valueAsNumber: true })}
                    placeholder="2024"
                  />
                  {companyForm.formState.errors.vintageYear && (
                    <p className="text-sm text-red-600">{companyForm.formState.errors.vintageYear.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industryType">Industry Type</Label>
                  <Select 
                    value={companyForm.watch("industryType")} 
                    onValueChange={(value) => companyForm.setValue("industryType", value as any)}
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
                  {companyForm.formState.errors.industryType && (
                    <p className="text-sm text-red-600">{companyForm.formState.errors.industryType.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="industryDetail">Industry Detail</Label>
                  <Input
                    id="industryDetail"
                    {...companyForm.register("industryDetail")}
                    placeholder="Describe industry focus"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Financial Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentValuation">Current Valuation ($)</Label>
                    <Input
                      id="currentValuation"
                      type="number"
                      {...companyForm.register("currentValuation", { valueAsNumber: true })}
                      placeholder="5000000"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="teamSize">Team Size</Label>
                    <Input
                      id="teamSize"
                      type="number"
                      {...companyForm.register("teamSize", { valueAsNumber: true })}
                      placeholder="12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="cashInflow">Cash Inflow ($)</Label>
                    <Input
                      id="cashInflow"
                      type="number"
                      {...companyForm.register("cashInflow", { valueAsNumber: true })}
                      placeholder="200000"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cashOutflow">Cash Outflow ($)</Label>
                    <Input
                      id="cashOutflow"
                      type="number"
                      {...companyForm.register("cashOutflow", { valueAsNumber: true })}
                      placeholder="150000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="monthlyBurn">Monthly Burn ($)</Label>
                    <Input
                      id="monthlyBurn"
                      type="number"
                      {...companyForm.register("monthlyBurn", { valueAsNumber: true })}
                      placeholder="120000"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="runwayMonths">Runway (months)</Label>
                    <Input
                      id="runwayMonths"
                      type="number"
                      {...companyForm.register("runwayMonths", { valueAsNumber: true })}
                      placeholder="18"
                    />
                  </div>
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
                  {isLoading ? "Updating..." : "Update Company"}
                </Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="founder" className="space-y-4">
            {founder ? (
              <form onSubmit={founderForm.handleSubmit(onSubmitFounder)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      {...founderForm.register("firstName")}
                      placeholder="John"
                    />
                    {founderForm.formState.errors.firstName && (
                      <p className="text-sm text-red-600">{founderForm.formState.errors.firstName.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      {...founderForm.register("lastName")}
                      placeholder="Smith"
                    />
                    {founderForm.formState.errors.lastName && (
                      <p className="text-sm text-red-600">{founderForm.formState.errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      {...founderForm.register("phone")}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                    <Input
                      id="linkedinUrl"
                      type="url"
                      {...founderForm.register("linkedinUrl")}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isWomanFounder"
                    checked={founderForm.watch("isWomanFounder")}
                    onCheckedChange={(checked) => founderForm.setValue("isWomanFounder", !!checked)}
                  />
                  <Label htmlFor="isWomanFounder">Woman founder</Label>
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
                    {isLoading ? "Updating..." : "Update Founder"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-600">No founder information available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};