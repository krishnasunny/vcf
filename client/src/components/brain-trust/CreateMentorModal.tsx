import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBrainTrustMentorSchema } from "@shared/schema";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type CreateMentorForm = z.infer<typeof insertBrainTrustMentorSchema>;

interface CreateMentorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateMentorModal = ({ open, onOpenChange }: CreateMentorModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<CreateMentorForm>({
    resolver: zodResolver(insertBrainTrustMentorSchema),
    defaultValues: {
      name: "",
      headshot: "",
      phone: "",
      linkedInUrl: "",
      description: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CreateMentorForm) => {
      const response = await apiRequest("/api/brain-trust-mentors", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/brain-trust-mentors'] });
      toast({
        title: "Success",
        description: "Brain Trust mentor created successfully",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create Brain Trust mentor",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: CreateMentorForm) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add Brain Trust Mentor</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="Enter mentor name"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="headshot">Headshot URL</Label>
            <Input
              id="headshot"
              placeholder="Enter headshot image URL"
              {...form.register("headshot")}
            />
            {form.formState.errors.headshot && (
              <p className="text-sm text-red-600">{form.formState.errors.headshot.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="Enter phone number"
              {...form.register("phone")}
            />
            {form.formState.errors.phone && (
              <p className="text-sm text-red-600">{form.formState.errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedInUrl">LinkedIn URL</Label>
            <Input
              id="linkedInUrl"
              placeholder="Enter LinkedIn profile URL"
              {...form.register("linkedInUrl")}
            />
            {form.formState.errors.linkedInUrl && (
              <p className="text-sm text-red-600">{form.formState.errors.linkedInUrl.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter mentor description and expertise"
              rows={4}
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating..." : "Create Mentor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};