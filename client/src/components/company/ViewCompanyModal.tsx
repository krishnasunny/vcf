import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building, Globe, Calendar, DollarSign, Users, TrendingUp } from "lucide-react";

interface ViewCompanyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string | null;
}

export const ViewCompanyModal = ({ open, onOpenChange, companyId }: ViewCompanyModalProps) => {
  const { data: company, isLoading } = useQuery({
    queryKey: ["/api/companies", companyId],
    enabled: !!companyId && open,
    staleTime: 300000,
  });

  const { data: founder, isLoading: isFounderLoading } = useQuery({
    queryKey: ["/api/companies", companyId, "founder"],
    enabled: !!companyId && open,
    staleTime: 300000,
  });

  const { data: revenue, isLoading: isRevenueLoading } = useQuery({
    queryKey: ["/api/companies", companyId, "revenue"],
    enabled: !!companyId && open,
    staleTime: 300000,
  });

  const { data: fundraising, isLoading: isFundraisingLoading } = useQuery({
    queryKey: ["/api/companies", companyId, "fundraising"],
    enabled: !!companyId && open,
    staleTime: 300000,
  });

  const getIndustryColor = (industry: string) => {
    switch (industry) {
      case "SAAS":
        return "bg-blue-100 text-blue-800";
      case "HARDWARE":
        return "bg-emerald-100 text-emerald-800";
      case "BIOTECH":
        return "bg-purple-100 text-purple-800";
      case "FINTECH":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Company Details</DialogTitle>
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
            <DialogTitle>Company Details</DialogTitle>
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
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-xl font-bold">{company.legalName}</div>
              {company.aka && (
                <div className="text-sm text-slate-600">Also known as: {company.aka}</div>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Company Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Industry</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className={getIndustryColor(company.industryType)}>
                  {company.industryType}
                </Badge>
                {company.industryDetail && (
                  <p className="text-sm text-slate-600 mt-2">{company.industryDetail}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Vintage Year</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span className="text-lg font-semibold">{company.vintageYear}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Current Valuation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-slate-500" />
                  <span className="text-lg font-semibold">
                    {company.currentValuation 
                      ? `$${(company.currentValuation / 1000000).toFixed(1)}M`
                      : "N/A"
                    }
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Company Details */}
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Legal Name</label>
                  <p className="text-slate-800">{company.legalName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Website</label>
                  <div className="flex items-center gap-2">
                    {company.website ? (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <Globe className="h-4 w-4" />
                        {company.website}
                      </a>
                    ) : (
                      <span className="text-slate-500">Not provided</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Country Registration</label>
                  <p className="text-slate-800">{company.countryReg || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Operations</label>
                  <p className="text-slate-800">{company.countyOps || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Cash Inflow</label>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(company.cashInflow)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Cash Outflow</label>
                  <p className="text-lg font-semibold text-red-600">
                    {formatCurrency(company.cashOutflow)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Monthly Burn</label>
                  <p className="text-lg font-semibold text-orange-600">
                    {formatCurrency(company.monthlyBurn)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Runway</label>
                  <p className="text-lg font-semibold text-blue-600">
                    {company.runwayMonths ? `${company.runwayMonths} months` : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Information */}
          <Card>
            <CardHeader>
              <CardTitle>Team & Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-500" />
                <span className="text-lg font-semibold">
                  {company.teamSize ? `${company.teamSize} employees` : "Team size not specified"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Founder Information */}
          {!isFounderLoading && founder && (
            <Card>
              <CardHeader>
                <CardTitle>Founder Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Name</label>
                    <p className="text-slate-800">{founder.firstName} {founder.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Phone</label>
                    <p className="text-slate-800">{founder.phone || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">LinkedIn</label>
                    {founder.linkedinUrl ? (
                      <a
                        href={founder.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View Profile
                      </a>
                    ) : (
                      <span className="text-slate-500">Not provided</span>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Woman Founder</label>
                    <p className="text-slate-800">{founder.isWomanFounder ? "Yes" : "No"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-600">
                    Last updated: {new Date(company.updatedAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-600">
                    Created: {new Date(company.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};