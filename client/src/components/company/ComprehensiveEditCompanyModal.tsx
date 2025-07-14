import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const editCompanySchema = z.object({
  // Portfolio Company fields
  legalName: z.string().min(1, "Legal name is required"),
  aka: z.string().optional(),
  countryReg: z.string().min(1, "Country registration is required"),
  countyOps: z.string().min(1, "County operations is required"),
  website: z.string().url().optional().or(z.literal("")),
  industryType: z.enum(["SAAS", "HARDWARE", "BIOTECH", "FINTECH", "OTHER"]),
  industryDetail: z.string().optional(),
  vintageYear: z.number().min(1900).max(2030),
  currentValuation: z.number().optional(),
  cashInflow: z.number().optional(),
  cashOutflow: z.number().optional(),
  runwayMonths: z.number().optional(),
  monthlyBurn: z.number().optional(),
  teamSize: z.number().optional(),
  
  // Founder fields
  founder: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    phone: z.string().optional(),
    linkedInUrl: z.string().url().optional().or(z.literal("")),
    isWomanFounder: z.boolean().default(false),
  }),
  
  // Fundraising rounds
  fundraising: z.array(z.object({
    roundYear: z.number().min(1900).max(2030),
    amountUSD: z.number().min(0),
    roundType: z.enum(["SAFE", "CONVERTIBLE", "EQUITY"]),
    coInvestors: z.string().optional(),
    notes2025: z.string().optional(),
  })).optional(),
  
  // Revenue data
  revenue: z.array(z.object({
    year: z.number().min(1900).max(2030),
    arr: z.number().optional(),
    revenueQ1: z.number().optional(),
    revenueQ2: z.number().optional(),
    revenueQ3: z.number().optional(),
    revenueQ4: z.number().optional(),
    projectedRevenue: z.number().optional(),
    actualRevenue: z.number().optional(),
  })).optional(),
  
  // Admin snapshot fields
  adminSnapshot: z.object({
    status: z.enum(["ACTIVE", "EXITED", "ON_HOLD"]).default("ACTIVE"),
    investmentUSD: z.number().min(0),
    investmentYear: z.number().min(1900).max(2030),
    valuationAtInvestmentUSD: z.number().min(0),
    equityPercent: z.number().min(0).max(100),
    cNoteAgreementDate: z.date().optional(),
    cNoteMaturityDate: z.date().optional(),
    pennyWarrantExpiry: z.date().optional(),
    millionWarrantExpiry: z.date().optional(),
    noteAction: z.string().optional(),
    observationScore: z.number().min(1).max(10).optional(),
    pitchedSeriesA: z.boolean().default(false),
    seriesANotes: z.string().optional(),
    significantGrowth: z.boolean().default(false),
    fastestGrowingPitch: z.boolean().default(false),
    irrCompanyBasis: z.number().optional(),
    workInProgress: z.string().optional(),
    venturePartner: z.string().optional(),
    dataroomUrl: z.string().url().optional().or(z.literal("")),
    founderExperience: z.string().optional(),
    warmIntroSource: z.string().optional(),
    exitPotential: z.string().optional(),
    riskFlags: z.string().optional(),
    boardMembers: z.string().optional(),
    safesOutstanding: z.string().optional(),
    esopPoolSize: z.string().optional(),
    lastCheckInDate: z.date().optional(),
    updateFrequency: z.enum(["MONTHLY", "QUARTERLY", "ADHOC"]).default("MONTHLY"),
    acceleratorAttended: z.string().optional(),
    adminNotes: z.string().optional(),
  }).optional(),
});

type EditCompanyForm = z.infer<typeof editCompanySchema>;

interface ComprehensiveEditCompanyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string | null;
}

export const ComprehensiveEditCompanyModal = ({ open, onOpenChange, companyId }: ComprehensiveEditCompanyModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: company, isLoading } = useQuery({
    queryKey: [`/api/companies/${companyId}`],
    enabled: !!companyId && open,
  });

  const form = useForm<EditCompanyForm>({
    resolver: zodResolver(editCompanySchema),
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
      fundraising: [],
      revenue: [],
      adminSnapshot: {
        status: "ACTIVE",
        investmentUSD: 0,
        investmentYear: new Date().getFullYear(),
        valuationAtInvestmentUSD: 0,
        equityPercent: 0,
        pitchedSeriesA: false,
        significantGrowth: false,
        fastestGrowingPitch: false,
        updateFrequency: "MONTHLY",
      },
    },
  });

  const { fields: fundraisingFields, append: appendFundraising, remove: removeFundraising } = useFieldArray({
    control: form.control,
    name: "fundraising",
  });

  const { fields: revenueFields, append: appendRevenue, remove: removeRevenue } = useFieldArray({
    control: form.control,
    name: "revenue",
  });

  useEffect(() => {
    if (company) {
      form.reset({
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
        runwayMonths: company.runwayMonths || undefined,
        monthlyBurn: company.monthlyBurn || undefined,
        teamSize: company.teamSize || undefined,
        founder: {
          firstName: company.founder?.firstName || "",
          lastName: company.founder?.lastName || "",
          phone: company.founder?.phone || "",
          linkedInUrl: company.founder?.linkedInUrl || "",
          isWomanFounder: company.founder?.isWomanFounder || false,
        },
        fundraising: company.fundraising || [],
        revenue: company.revenue || [],
        adminSnapshot: company.adminSnapshot ? {
          ...company.adminSnapshot,
          cNoteAgreementDate: company.adminSnapshot.cNoteAgreementDate ? new Date(company.adminSnapshot.cNoteAgreementDate) : undefined,
          cNoteMaturityDate: company.adminSnapshot.cNoteMaturityDate ? new Date(company.adminSnapshot.cNoteMaturityDate) : undefined,
          pennyWarrantExpiry: company.adminSnapshot.pennyWarrantExpiry ? new Date(company.adminSnapshot.pennyWarrantExpiry) : undefined,
          millionWarrantExpiry: company.adminSnapshot.millionWarrantExpiry ? new Date(company.adminSnapshot.millionWarrantExpiry) : undefined,
          lastCheckInDate: company.adminSnapshot.lastCheckInDate ? new Date(company.adminSnapshot.lastCheckInDate) : undefined,
        } : undefined,
      });
    }
  }, [company, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: EditCompanyForm) => {
      if (!companyId) throw new Error("Company ID is required");
      
      const response = await apiRequest("PATCH", `/api/companies/${companyId}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}`] });
      toast({
        title: "Success",
        description: "Company updated successfully",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update company",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: EditCompanyForm) => {
    updateMutation.mutate(data);
  };

  const DatePicker = ({ field, label }: { field: any; label: string }) => (
    <FormItem className="flex flex-col">
      <FormLabel>{label}</FormLabel>
      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant={"outline"}
              className={cn(
                "w-full pl-3 text-left font-normal",
                !field.value && "text-muted-foreground"
              )}
            >
              {field.value ? (
                format(field.value, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={field.value}
            onSelect={field.onChange}
            disabled={(date) =>
              date > new Date() || date < new Date("1900-01-01")
            }
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  );

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loading...</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Portfolio Company - {company?.legalName}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="company" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="company">Company</TabsTrigger>
                <TabsTrigger value="founder">Founder</TabsTrigger>
                <TabsTrigger value="fundraising">Fundraising</TabsTrigger>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>
              
              <TabsContent value="company" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Company Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="legalName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Legal Name *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="aka"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>AKA / Trading Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="countryReg"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country Registration *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="countyOps"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>County Operations *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://example.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="industryType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Industry Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select industry type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="SAAS">SaaS</SelectItem>
                              <SelectItem value="HARDWARE">Hardware</SelectItem>
                              <SelectItem value="BIOTECH">Biotech</SelectItem>
                              <SelectItem value="FINTECH">Fintech</SelectItem>
                              <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="industryDetail"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Industry Detail</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="vintageYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vintage Year *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="currentValuation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Valuation (USD)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="cashInflow"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cash Inflow (USD)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="cashOutflow"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cash Outflow (USD)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="runwayMonths"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Runway (Months)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.1"
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="monthlyBurn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Burn (USD)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="teamSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Team Size</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="founder" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Founder Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="founder.firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="founder.lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="founder.phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="founder.linkedInUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LinkedIn URL</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://linkedin.com/in/..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="founder.isWomanFounder"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Woman Founder
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="fundraising" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Fundraising Rounds
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendFundraising({
                          roundYear: new Date().getFullYear(),
                          amountUSD: 0,
                          roundType: "SAFE",
                          coInvestors: "",
                          notes2025: "",
                        })}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Round
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {fundraisingFields.map((field, index) => (
                      <div key={field.id} className="p-4 border rounded-lg mb-4">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-medium">Round {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFundraising(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`fundraising.${index}.roundYear`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Round Year</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`fundraising.${index}.amountUSD`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Amount (USD)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="0.01"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`fundraising.${index}.roundType`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Round Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="SAFE">SAFE</SelectItem>
                                    <SelectItem value="CONVERTIBLE">Convertible</SelectItem>
                                    <SelectItem value="EQUITY">Equity</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`fundraising.${index}.coInvestors`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Co-Investors</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`fundraising.${index}.notes2025`}
                            render={({ field }) => (
                              <FormItem className="col-span-2">
                                <FormLabel>Notes 2025</FormLabel>
                                <FormControl>
                                  <Textarea {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                    
                    {fundraisingFields.length === 0 && (
                      <p className="text-muted-foreground text-center py-8">
                        No fundraising rounds added yet. Click "Add Round" to get started.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="revenue" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Revenue Data
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendRevenue({
                          year: new Date().getFullYear(),
                          arr: 0,
                          revenueQ1: 0,
                          revenueQ2: 0,
                          revenueQ3: 0,
                          revenueQ4: 0,
                          projectedRevenue: 0,
                          actualRevenue: 0,
                        })}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Year
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {revenueFields.map((field, index) => (
                      <div key={field.id} className="p-4 border rounded-lg mb-4">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-medium">Year {form.watch(`revenue.${index}.year`)}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRevenue(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name={`revenue.${index}.year`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Year</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`revenue.${index}.arr`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ARR</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="0.01"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`revenue.${index}.revenueQ1`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Q1 Revenue</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="0.01"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`revenue.${index}.revenueQ2`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Q2 Revenue</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="0.01"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`revenue.${index}.revenueQ3`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Q3 Revenue</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="0.01"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`revenue.${index}.revenueQ4`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Q4 Revenue</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="0.01"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`revenue.${index}.projectedRevenue`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Projected Revenue</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="0.01"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`revenue.${index}.actualRevenue`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Actual Revenue</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="0.01"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                    
                    {revenueFields.length === 0 && (
                      <p className="text-muted-foreground text-center py-8">
                        No revenue data added yet. Click "Add Year" to get started.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="admin" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Admin Snapshot</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="adminSnapshot.status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="EXITED">Exited</SelectItem>
                                <SelectItem value="ON_HOLD">On Hold</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="adminSnapshot.investmentUSD"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Investment (USD)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="adminSnapshot.investmentYear"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Investment Year</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="adminSnapshot.valuationAtInvestmentUSD"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valuation at Investment (USD)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="adminSnapshot.equityPercent"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Equity Percent</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01"
                                max="100"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="adminSnapshot.updateFrequency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Update Frequency</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="MONTHLY">Monthly</SelectItem>
                                <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                                <SelectItem value="ADHOC">Ad Hoc</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="adminSnapshot.cNoteAgreementDate"
                        render={({ field }) => (
                          <DatePicker field={field} label="C-Note Agreement Date" />
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="adminSnapshot.cNoteMaturityDate"
                        render={({ field }) => (
                          <DatePicker field={field} label="C-Note Maturity Date" />
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="adminSnapshot.pennyWarrantExpiry"
                        render={({ field }) => (
                          <DatePicker field={field} label="Penny Warrant Expiry" />
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="adminSnapshot.millionWarrantExpiry"
                        render={({ field }) => (
                          <DatePicker field={field} label="Million Warrant Expiry" />
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="adminSnapshot.lastCheckInDate"
                        render={({ field }) => (
                          <DatePicker field={field} label="Last Check-in Date" />
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="adminSnapshot.observationScore"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Observation Score (1-10)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1"
                                max="10"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="adminSnapshot.pitchedSeriesA"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Pitched Series A</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="adminSnapshot.significantGrowth"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Significant Growth</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="adminSnapshot.fastestGrowingPitch"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Fastest Growing Pitch</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="adminSnapshot.noteAction"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Note Action</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="adminSnapshot.irrCompanyBasis"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>IRR Company Basis</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="adminSnapshot.venturePartner"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Venture Partner</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="adminSnapshot.dataroomUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dataroom URL</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://..." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="adminSnapshot.acceleratorAttended"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Accelerator Attended</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="adminSnapshot.seriesANotes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Series A Notes</FormLabel>
                            <FormControl>
                              <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="adminSnapshot.workInProgress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Work in Progress</FormLabel>
                            <FormControl>
                              <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="adminSnapshot.founderExperience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Founder Experience</FormLabel>
                            <FormControl>
                              <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="adminSnapshot.warmIntroSource"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Warm Intro Source</FormLabel>
                            <FormControl>
                              <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="adminSnapshot.exitPotential"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Exit Potential</FormLabel>
                            <FormControl>
                              <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="adminSnapshot.riskFlags"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Risk Flags</FormLabel>
                            <FormControl>
                              <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="adminSnapshot.boardMembers"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Board Members</FormLabel>
                            <FormControl>
                              <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="adminSnapshot.safesOutstanding"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SAFEs Outstanding</FormLabel>
                            <FormControl>
                              <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="adminSnapshot.esopPoolSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ESOP Pool Size</FormLabel>
                            <FormControl>
                              <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="adminSnapshot.adminNotes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Admin Notes</FormLabel>
                            <FormControl>
                              <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Updating..." : "Update Company"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};