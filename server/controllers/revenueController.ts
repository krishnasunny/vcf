import { Response } from "express";
import { storage } from "../storage";
import { insertCompanyRevenueSchema } from "@shared/schema";
import { z } from "zod";
import { AuthenticatedRequest } from "../middleware/auth";

export const getRevenueByCompany = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { companyId } = req.params;
    const revenue = await storage.getRevenueByCompanyId(companyId);
    res.json(revenue);
  } catch (error) {
    console.error("Get revenue error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createRevenue = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const revenueData = insertCompanyRevenueSchema.parse(req.body);
    const revenue = await storage.createCompanyRevenue(revenueData);
    res.status(201).json(revenue);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input", errors: error.errors });
    }
    console.error("Create revenue error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateRevenue = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = insertCompanyRevenueSchema.partial().parse(req.body);
    
    const revenue = await storage.updateCompanyRevenue(id, updateData);
    res.json(revenue);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input", errors: error.errors });
    }
    console.error("Update revenue error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteRevenue = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await storage.deleteCompanyRevenue(id);
    res.status(204).send();
  } catch (error) {
    console.error("Delete revenue error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
