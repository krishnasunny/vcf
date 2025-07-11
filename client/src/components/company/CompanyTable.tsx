import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, Globe } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Company {
  id: string;
  legalName: string;
  aka?: string;
  website?: string;
  industryType: string;
  vintageYear: number;
  currentValuation?: number;
  updatedAt: string;
}

interface CompanyTableProps {
  companies: Company[];
  isLoading: boolean;
  onViewCompany?: (companyId: string) => void;
  onEditCompany?: (companyId: string) => void;
}

export const CompanyTable = ({ companies, isLoading, onViewCompany, onEditCompany }: CompanyTableProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="text-center py-8">
        <Building className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-600">No companies found. Create your first company to get started.</p>
      </div>
    );
  }

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

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead>Vintage Year</TableHead>
            <TableHead>Valuation</TableHead>
            <TableHead>Last Update</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow key={company.id}>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-800">{company.legalName}</div>
                    <div className="text-sm text-slate-500 flex items-center">
                      {company.website && (
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center hover:text-blue-600"
                        >
                          <Globe className="h-3 w-3 mr-1" />
                          {company.aka || company.website.replace(/https?:\/\//, "")}
                        </a>
                      )}
                      {!company.website && company.aka && (
                        <span>{company.aka}</span>
                      )}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className={getIndustryColor(company.industryType)}>
                  {company.industryType}
                </Badge>
              </TableCell>
              <TableCell>{company.vintageYear}</TableCell>
              <TableCell>
                {company.currentValuation 
                  ? `$${(company.currentValuation / 1000000).toFixed(1)}M`
                  : "N/A"
                }
              </TableCell>
              <TableCell>
                {new Date(company.updatedAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onViewCompany?.(company.id)}
                  >
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onEditCompany?.(company.id)}
                  >
                    Edit
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
