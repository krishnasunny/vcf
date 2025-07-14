import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { ChartLine, Trophy, Flame, Calendar, Users, Plus } from "lucide-react";
import { RevenueTable } from "@/components/revenue/RevenueTable";
import { AddRevenueModal } from "@/components/revenue/AddRevenueModal";
import { FundraisingCards } from "@/components/fundraising/FundraisingCards";
import { AddFundraisingModal } from "@/components/fundraising/AddFundraisingModal";
import { CompanyProfileForm } from "@/components/company/CompanyProfileForm";
import { MentorTable } from "@/components/brain-trust/MentorTable";
import { ViewMentorModal } from "@/components/brain-trust/ViewMentorModal";

export default function PortfolioDashboard() {
  const { user, logout } = useAuth();
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [showFundraisingModal, setShowFundraisingModal] = useState(false);
  const [showViewMentorModal, setShowViewMentorModal] = useState(false);
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);

  const { data: companyData, isLoading } = useQuery({
    queryKey: ["/api/my-company"],
    staleTime: 300000,
  });

  const company = companyData?.company;
  const founder = companyData?.founder;

  const { data: revenues } = useQuery({
    queryKey: ["/api/companies", company?.id, "revenue"],
    enabled: !!company?.id,
    staleTime: 300000,
  });

  const { data: fundraising } = useQuery({
    queryKey: ["/api/companies", company?.id, "fundraising"],
    enabled: !!company?.id,
    staleTime: 300000,
  });

  const { data: mentors = [], isLoading: mentorsLoading } = useQuery({
    queryKey: ['/api/brain-trust-mentors'],
    staleTime: 300000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleViewMentor = (mentorId: string) => {
    setSelectedMentorId(mentorId);
    setShowViewMentorModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <ChartLine className="text-white h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">
                  {company?.legalName || "Company Dashboard"}
                </h1>
                <p className="text-sm text-slate-600">Portfolio Company Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-600">Welcome,</span>
                <span className="text-sm font-medium text-slate-800">
                  {founder ? `${founder.firstName} ${founder.lastName}` : user?.email}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="text-slate-600 hover:text-slate-800"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Company Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Company Overview</h2>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Current Valuation</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {company?.currentValuation ? `$${(company.currentValuation / 1000000).toFixed(1)}M` : "N/A"}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Trophy className="text-blue-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Monthly Burn</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {company?.monthlyBurn ? `$${(company.monthlyBurn / 1000).toFixed(0)}K` : "N/A"}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Flame className="text-red-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Runway</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {company?.runwayMonths ? `${company.runwayMonths} months` : "N/A"}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Calendar className="text-amber-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Team Size</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {company?.teamSize || "N/A"}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Users className="text-emerald-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Card>
          <Tabs defaultValue="profile" className="w-full">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">Company Profile</TabsTrigger>
                <TabsTrigger value="revenue">Revenue Reports</TabsTrigger>
                <TabsTrigger value="fundraising">Fundraising</TabsTrigger>
                <TabsTrigger value="brain-trust">Brain Trust</TabsTrigger>
              </TabsList>
            </CardHeader>
            
            <CardContent>
              <TabsContent value="profile" className="space-y-4">
                <CompanyProfileForm company={company} founder={founder} />
              </TabsContent>
              
              <TabsContent value="revenue" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-slate-800">Revenue Tracking</h3>
                  <Button onClick={() => setShowRevenueModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Revenue Report
                  </Button>
                </div>
                
                <RevenueTable revenues={revenues || []} />
              </TabsContent>
              
              <TabsContent value="fundraising" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-slate-800">Fundraising Rounds</h3>
                  <Button onClick={() => setShowFundraisingModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Fundraising Round
                  </Button>
                </div>
                
                <FundraisingCards fundraising={fundraising || []} />
              </TabsContent>
              
              <TabsContent value="brain-trust" className="space-y-4">
                <div className="space-y-4">
                  <div className="text-center py-4 border-b">
                    <h3 className="text-lg font-semibold text-slate-800">Brain Trust Mentors</h3>
                    <p className="text-sm text-slate-600">Connect with experienced mentors from our network</p>
                  </div>
                  <MentorTable
                    mentors={mentors}
                    isLoading={mentorsLoading}
                    onViewMentor={handleViewMentor}
                    showActions={false}
                  />
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>

      <AddRevenueModal
        open={showRevenueModal}
        onOpenChange={setShowRevenueModal}
        companyId={company?.id}
      />

      <AddFundraisingModal
        open={showFundraisingModal}
        onOpenChange={setShowFundraisingModal}
        companyId={company?.id}
      />

      <ViewMentorModal
        open={showViewMentorModal}
        onOpenChange={setShowViewMentorModal}
        mentorId={selectedMentorId}
      />
    </div>
  );
}
