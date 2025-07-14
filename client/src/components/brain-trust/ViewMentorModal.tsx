import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Phone, Mail } from "lucide-react";
import { format } from "date-fns";

interface ViewMentorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mentorId: string | null;
}

export const ViewMentorModal = ({ open, onOpenChange, mentorId }: ViewMentorModalProps) => {
  const { data: mentor, isLoading } = useQuery({
    queryKey: ['/api/brain-trust-mentors', mentorId],
    queryFn: async () => {
      if (!mentorId) return null;
      const response = await apiRequest(`/api/brain-trust-mentors/${mentorId}`);
      return response.json();
    },
    enabled: !!mentorId && open,
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Mentor Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!mentor) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Mentor Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Header with avatar and basic info */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              {mentor.headshot ? (
                <AvatarImage src={mentor.headshot} alt={mentor.name} />
              ) : (
                <AvatarFallback className="text-lg">
                  {getInitials(mentor.name)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">{mentor.name}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>
                  Added {format(new Date(mentor.createdAt), "MMM dd, yyyy")}
                </span>
                <span>
                  Updated {format(new Date(mentor.updatedAt), "MMM dd, yyyy")}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            <div className="space-y-2">
              {mentor.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{mentor.phone}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`tel:${mentor.phone}`)}
                  >
                    Call
                  </Button>
                </div>
              )}
              {mentor.linkedInUrl && (
                <div className="flex items-center space-x-3">
                  <ExternalLink className="h-4 w-4 text-gray-500" />
                  <span>LinkedIn Profile</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(mentor.linkedInUrl, "_blank")}
                  >
                    View Profile
                  </Button>
                </div>
              )}
              {!mentor.phone && !mentor.linkedInUrl && (
                <p className="text-gray-500 text-sm">No contact information available</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">About</h3>
            {mentor.description ? (
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{mentor.description}</p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No description available</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};