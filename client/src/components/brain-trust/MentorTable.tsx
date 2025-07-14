import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Trash2, Plus, ExternalLink, Phone } from "lucide-react";
import { format } from "date-fns";

interface BrainTrustMentor {
  id: string;
  name: string;
  headshot?: string;
  phone?: string;
  linkedInUrl?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface MentorTableProps {
  mentors: BrainTrustMentor[];
  isLoading: boolean;
  onViewMentor?: (mentorId: string) => void;
  onEditMentor?: (mentorId: string) => void;
  onDeleteMentor?: (mentorId: string) => void;
  onCreateMentor?: () => void;
  showActions?: boolean;
}

export const MentorTable = ({ 
  mentors, 
  isLoading, 
  onViewMentor, 
  onEditMentor, 
  onDeleteMentor, 
  onCreateMentor,
  showActions = false 
}: MentorTableProps) => {
  const [selectedMentor, setSelectedMentor] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          {showActions && <Skeleton className="h-10 w-32" />}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="ml-4 space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Brain Trust Mentors</h2>
        {showActions && onCreateMentor && (
          <Button onClick={onCreateMentor} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Mentor
          </Button>
        )}
      </div>

      {mentors.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="text-gray-500 text-lg">No mentors available</div>
              <div className="text-sm text-gray-400">
                {showActions 
                  ? "Add your first mentor to get started" 
                  : "Brain Trust mentors will appear here once they're added"}
              </div>
              {showActions && onCreateMentor && (
                <Button onClick={onCreateMentor} className="mt-4">
                  Add First Mentor
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mentors.map((mentor) => (
            <Card key={mentor.id} className="transition-all hover:shadow-lg">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <Avatar className="h-12 w-12">
                  {mentor.headshot ? (
                    <AvatarImage src={mentor.headshot} alt={mentor.name} />
                  ) : (
                    <AvatarFallback>{getInitials(mentor.name)}</AvatarFallback>
                  )}
                </Avatar>
                <div className="ml-4 flex-1">
                  <h3 className="font-semibold text-lg">{mentor.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    {mentor.phone && (
                      <a
                        href={`tel:${mentor.phone}`}
                        className="flex items-center gap-1 hover:text-blue-600"
                      >
                        <Phone className="h-3 w-3" />
                        {mentor.phone}
                      </a>
                    )}
                    {mentor.linkedInUrl && (
                      <a
                        href={mentor.linkedInUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-blue-600"
                      >
                        <ExternalLink className="h-3 w-3" />
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {mentor.description && (
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                    {mentor.description}
                  </p>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">
                    Updated {format(new Date(mentor.updatedAt), "MMM dd, yyyy")}
                  </span>
                  {showActions && (
                    <div className="flex items-center gap-2">
                      {onViewMentor && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewMentor(mentor.id)}
                        >
                          View
                        </Button>
                      )}
                      {onEditMentor && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditMentor(mentor.id)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                      )}
                      {onDeleteMentor && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDeleteMentor(mentor.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};