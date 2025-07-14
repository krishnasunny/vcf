import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { storage } from "../storage";
import { insertBrainTrustMentorSchema } from "@shared/schema";
import { z } from "zod";

export const getAllBrainTrustMentors = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const mentors = await storage.getAllBrainTrustMentors();
    res.json(mentors);
  } catch (error) {
    console.error("Error fetching brain trust mentors:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getBrainTrustMentorById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const mentor = await storage.getBrainTrustMentorById(id);
    
    if (!mentor) {
      return res.status(404).json({ message: "Brain trust mentor not found" });
    }
    
    res.json(mentor);
  } catch (error) {
    console.error("Error fetching brain trust mentor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createBrainTrustMentor = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = insertBrainTrustMentorSchema.parse(req.body);
    const mentor = await storage.createBrainTrustMentor(validatedData);
    res.status(201).json(mentor);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    console.error("Error creating brain trust mentor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateBrainTrustMentor = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = insertBrainTrustMentorSchema.partial().parse(req.body);
    
    const mentor = await storage.updateBrainTrustMentor(id, validatedData);
    res.json(mentor);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    console.error("Error updating brain trust mentor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteBrainTrustMentor = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await storage.deleteBrainTrustMentor(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting brain trust mentor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};