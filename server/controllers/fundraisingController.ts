import { Response } from "express";
import { storage } from "../storage";
import { insertFundraisingSchema } from "@shared/schema";
import { z } from "zod";
import { AuthenticatedRequest } from "../middleware/auth";

export const getFundraisingByCompany = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { companyId } = req.params;
    const fundraising = await storage.getFundraisingByCompanyId(companyId);
    res.json(fundraising);
  } catch (error) {
    console.error("Get fundraising error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createFundraising = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const fundraisingData = insertFundraisingSchema.parse(req.body);
    const fundraising = await storage.createFundraising(fundraisingData);
    res.status(201).json(fundraising);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input", errors: error.errors });
    }
    console.error("Create fundraising error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateFundraising = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = insertFundraisingSchema.partial().parse(req.body);
    
    const fundraising = await storage.updateFundraising(id, updateData);
    res.json(fundraising);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input", errors: error.errors });
    }
    console.error("Update fundraising error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteFundraising = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await storage.deleteFundraising(id);
    res.status(204).send();
  } catch (error) {
    console.error("Delete fundraising error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
