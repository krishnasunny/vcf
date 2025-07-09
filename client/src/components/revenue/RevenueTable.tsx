import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

interface Revenue {
  id: string;
  year: number;
  arr?: number;
  revenueQ1?: number;
  revenueQ2?: number;
  revenueQ3?: number;
  revenueQ4?: number;
  projectedRevenue?: number;
  actualRevenue?: number;
}

interface RevenueTableProps {
  revenues: Revenue[];
}

export const RevenueTable = ({ revenues }: RevenueTableProps) => {
  const formatCurrency = (amount?: number) => {
    if (!amount) return "N/A";
    return `$${(amount / 1000).toFixed(0)}K`;
  };

  if (revenues.length === 0) {
    return (
      <div className="text-center py-8">
        <TrendingUp className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-600">No revenue reports found. Add your first revenue report to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Year</TableHead>
            <TableHead>ARR</TableHead>
            <TableHead>Q1</TableHead>
            <TableHead>Q2</TableHead>
            <TableHead>Q3</TableHead>
            <TableHead>Q4</TableHead>
            <TableHead>Projected</TableHead>
            <TableHead>Actual</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {revenues.map((revenue) => (
            <TableRow key={revenue.id}>
              <TableCell className="font-medium">{revenue.year}</TableCell>
              <TableCell>{formatCurrency(revenue.arr)}</TableCell>
              <TableCell>{formatCurrency(revenue.revenueQ1)}</TableCell>
              <TableCell>{formatCurrency(revenue.revenueQ2)}</TableCell>
              <TableCell>{formatCurrency(revenue.revenueQ3)}</TableCell>
              <TableCell>{formatCurrency(revenue.revenueQ4)}</TableCell>
              <TableCell>{formatCurrency(revenue.projectedRevenue)}</TableCell>
              <TableCell>{formatCurrency(revenue.actualRevenue)}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
