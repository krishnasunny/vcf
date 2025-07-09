import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";

interface FundraisingRound {
  id: string;
  roundYear: number;
  amountUSD: number;
  roundType: string;
  coInvestors?: string;
  notes2025?: string;
}

interface FundraisingCardsProps {
  fundraising: FundraisingRound[];
}

export const FundraisingCards = ({ fundraising }: FundraisingCardsProps) => {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

  const getRoundTypeColor = (roundType: string) => {
    switch (roundType) {
      case "SAFE":
        return "bg-blue-100 text-blue-800";
      case "CONVERTIBLE":
        return "bg-amber-100 text-amber-800";
      case "EQUITY":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getRoundName = (roundType: string) => {
    switch (roundType) {
      case "SAFE":
        return "SAFE Round";
      case "CONVERTIBLE":
        return "Convertible Note";
      case "EQUITY":
        return "Equity Round";
      default:
        return "Fundraising Round";
    }
  };

  if (fundraising.length === 0) {
    return (
      <div className="text-center py-8">
        <DollarSign className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-600">No fundraising rounds found. Add your first fundraising round to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {fundraising.map((round) => (
        <Card key={round.id} className="border border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{getRoundName(round.roundType)}</CardTitle>
              <Badge variant="secondary" className={getRoundTypeColor(round.roundType)}>
                {round.roundType}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Year:</span>
              <span className="text-sm font-medium text-slate-800">{round.roundYear}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Amount:</span>
              <span className="text-sm font-medium text-slate-800">{formatCurrency(round.amountUSD)}</span>
            </div>
            {round.coInvestors && (
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Co-investors:</span>
                <span className="text-sm font-medium text-slate-800">{round.coInvestors}</span>
              </div>
            )}
            {round.notes2025 && (
              <div className="pt-2 border-t border-slate-200">
                <p className="text-sm text-slate-600">{round.notes2025}</p>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200">
              <Button variant="outline" size="sm" className="w-full">
                Edit Details
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
