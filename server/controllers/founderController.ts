import { Response } from "express";
import { storage } from "../storage";
import { insertFounderSchema } from "@shared/schema";
import { z } from "zod";
import { AuthenticatedRequest } from "../middleware/auth";

export const getFounderByCompany = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { companyId } = req.params;
    const company = await storage.getPortfolioCompanyById(companyId);
    
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Get founder associated with this company
    const founders = await storage.getFoundersByCompanyId(companyId);
    const founder = founders.length > 0 ? founders[0] : null;
    
    res.json(founder);
  } catch (error) {
    console.error("Get founder by company error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

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