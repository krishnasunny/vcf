import { Response } from "express";
import { storage } from "../storage";
import { insertFounderSchema } from "@shared/schema";
import { z } from "zod";
import { AuthenticatedRequest } from "../middleware/auth";

export const updateFounder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = insertFounderSchema.partial().parse(req.body);
    
    const founder = await storage.updateFounder(id, updateData);
    res.json(founder);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input", errors: error.errors });
    }
    console.error("Update founder error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};