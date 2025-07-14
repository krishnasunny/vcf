import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { MentorTable } from "@/components/brain-trust/MentorTable";
import { CreateMentorModal } from "@/components/brain-trust/CreateMentorModal";
import { EditMentorModal } from "@/components/brain-trust/EditMentorModal";
import { ViewMentorModal } from "@/components/brain-trust/ViewMentorModal";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function AdminBrainTrust() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);

  const { data: mentors = [], isLoading } = useQuery({
    queryKey: ['/api/brain-trust-mentors'],
    queryFn: async () => {
      const response = await apiRequest('/api/brain-trust-mentors');
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (mentorId: string) => {
      await apiRequest(`/api/brain-trust-mentors/${mentorId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/brain-trust-mentors'] });
      toast({
        title: "Success",
        description: "Brain Trust mentor deleted successfully",
      });
      setShowDeleteDialog(false);
      setSelectedMentorId(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete Brain Trust mentor",
        variant: "destructive",
      });
    },
  });

  const handleViewMentor = (mentorId: string) => {
    setSelectedMentorId(mentorId);
    setShowViewModal(true);
  };

  const handleEditMentor = (mentorId: string) => {
    setSelectedMentorId(mentorId);
    setShowEditModal(true);
  };

  const handleDeleteMentor = (mentorId: string) => {
    setSelectedMentorId(mentorId);
    setShowDeleteDialog(true);
  };

  const handleCreateMentor = () => {
    setShowCreateModal(true);
  };

  const confirmDelete = () => {
    if (selectedMentorId) {
      deleteMutation.mutate(selectedMentorId);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Brain Trust Management</h1>
            <p className="text-gray-600 mt-2">
              Manage mentor profiles that will be visible to all portfolio companies
            </p>
          </div>
        </div>

        <MentorTable
          mentors={mentors}
          isLoading={isLoading}
          onViewMentor={handleViewMentor}
          onEditMentor={handleEditMentor}
          onDeleteMentor={handleDeleteMentor}
          onCreateMentor={handleCreateMentor}
          showActions={true}
        />

        <CreateMentorModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
        />

        <EditMentorModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          mentorId={selectedMentorId}
        />

        <ViewMentorModal
          open={showViewModal}
          onOpenChange={setShowViewModal}
          mentorId={selectedMentorId}
        />

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the Brain Trust mentor
                and remove them from all portfolio company dashboards.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}