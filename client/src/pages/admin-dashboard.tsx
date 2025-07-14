import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { ChartLine, Building, DollarSign, TrendingUp, Percent, Plus } from "lucide-react";
import { CreateCompanyModal } from "@/components/company/CreateCompanyModal";
import { ViewCompanyModal } from "@/components/company/ViewCompanyModal";
import { ComprehensiveEditCompanyModal } from "@/components/company/ComprehensiveEditCompanyModal";
import { CompanyTable } from "@/components/company/CompanyTable";
import { MentorTable } from "@/components/brain-trust/MentorTable";
import { CreateMentorModal } from "@/components/brain-trust/CreateMentorModal";
import { EditMentorModal } from "@/components/brain-trust/EditMentorModal";
import { ViewMentorModal } from "@/components/brain-trust/ViewMentorModal";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Brain Trust mentor state
  const [showCreateMentorModal, setShowCreateMentorModal] = useState(false);
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);
  const [showViewMentorModal, setShowViewMentorModal] = useState(false);
  const [showEditMentorModal, setShowEditMentorModal] = useState(false);

  const { data: companies, isLoading } = useQuery({
    queryKey: ["/api/companies"],
    staleTime: 300000,
  });

  const { data: mentors = [], isLoading: mentorsLoading } = useQuery({
    queryKey: ['/api/brain-trust-mentors'],
    staleTime: 300000,
  });

  const stats = {
    totalCompanies: companies?.length || 0,
    totalInvestment: "$12.5M",
    activeFundraising: 8,
    portfolioIRR: "24.3%",
  };

  const handleViewCompany = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setShowViewModal(true);
  };

  const handleEditCompany = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setShowEditModal(true);
  };

  // Brain Trust mentor handlers
  const handleViewMentor = (mentorId: string) => {
    setSelectedMentorId(mentorId);
    setShowViewMentorModal(true);
  };

  const handleEditMentor = (mentorId: string) => {
    setSelectedMentorId(mentorId);
    setShowEditMentorModal(true);
  };

  const handleDeleteMentor = (mentorId: string) => {
    // Add delete logic here if needed
    console.log("Delete mentor:", mentorId);
  };

  const handleCreateMentor = () => {
    setShowCreateMentorModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-16 h-10 bg-black rounded-lg flex items-center justify-center mr-3 p-1">
                {/* <ChartLine className="text-white h-5 w-5" /> */}
                <img src="https://expertdojo.com/wp-content/uploads/2022/05/ED_Logo-White.png"/>
              </div>
              <h1 className="text-xl font-bold text-slate-800">Expert Dojo</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-600">Welcome back,</span>
                <span className="text-sm font-medium text-slate-800">{user?.email}</span>
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
        {/* Dashboard Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Portfolio Overview</h2>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total Companies</p>
                    <p className="text-2xl font-bold text-slate-800">{stats.totalCompanies}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building className="text-blue-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total Investment</p>
                    <p className="text-2xl font-bold text-slate-800">{stats.totalInvestment}</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="text-emerald-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Active Fundraising</p>
                    <p className="text-2xl font-bold text-slate-800">{stats.activeFundraising}</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-amber-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Portfolio IRR</p>
                    <p className="text-2xl font-bold text-slate-800">{stats.portfolioIRR}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Percent className="text-purple-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Card>
          <Tabs defaultValue="companies" className="w-full">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="companies">Companies</TabsTrigger>
                <TabsTrigger value="brain-trust">Brain Trust</TabsTrigger>
                <TabsTrigger value="fundraising">Fundraising</TabsTrigger>
                <TabsTrigger value="revenue">Revenue Tracking</TabsTrigger>
                <TabsTrigger value="users">User Management</TabsTrigger>
              </TabsList>
            </CardHeader>
            
            <CardContent>
              <TabsContent value="companies" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-slate-800">Portfolio Companies</h3>
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Company
                  </Button>
                </div>
                
                <CompanyTable 
                  companies={companies || []} 
                  isLoading={isLoading} 
                  onViewCompany={handleViewCompany}
                  onEditCompany={handleEditCompany}
                />
              </TabsContent>

              <TabsContent value="brain-trust" className="space-y-4">
                <MentorTable
                  mentors={mentors}
                  isLoading={mentorsLoading}
                  onViewMentor={handleViewMentor}
                  onEditMentor={handleEditMentor}
                  onDeleteMentor={handleDeleteMentor}
                  onCreateMentor={handleCreateMentor}
                  showActions={true}
                />
              </TabsContent>
              
              <TabsContent value="fundraising" className="space-y-4">
                <div className="text-center py-8">
                  <p className="text-slate-600">Fundraising management coming soon...</p>
                </div>
              </TabsContent>
              
              <TabsContent value="revenue" className="space-y-4">
                <div className="text-center py-8">
                  <p className="text-slate-600">Revenue tracking coming soon...</p>
                </div>
              </TabsContent>
              
              <TabsContent value="users" className="space-y-4">
                <div className="text-center py-8">
                  <p className="text-slate-600">User management coming soon...</p>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>

      <CreateCompanyModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />
      
      <ViewCompanyModal
        open={showViewModal}
        onOpenChange={setShowViewModal}
        companyId={selectedCompanyId}
      />
      
      <ComprehensiveEditCompanyModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        companyId={selectedCompanyId}
      />

      <CreateMentorModal
        open={showCreateMentorModal}
        onOpenChange={setShowCreateMentorModal}
      />

      <EditMentorModal
        open={showEditMentorModal}
        onOpenChange={setShowEditMentorModal}
        mentorId={selectedMentorId}
      />

      <ViewMentorModal
        open={showViewMentorModal}
        onOpenChange={setShowViewMentorModal}
        mentorId={selectedMentorId}
      />
    </div>
  );
}
