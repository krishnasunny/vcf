import { Response } from "express";
import { storage } from "../storage";
import { insertPortfolioCompanySchema, insertFounderSchema } from "@shared/schema";
import { z } from "zod";
import { AuthenticatedRequest } from "../middleware/auth";

const createCompanySchema = insertPortfolioCompanySchema.extend({
  founder: insertFounderSchema,
});

export const getAllCompanies = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companies = await storage.getAllPortfolioCompanies();
    res.json(companies);
  } catch (error) {
    console.error("Get companies error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getCompanyById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const company = await storage.getPortfolioCompanyById(id);
    
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json(company);
  } catch (error) {
    console.error("Get company error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createCompany = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { founder, ...companyData } = createCompanySchema.parse(req.body);
    
    // Create company
    const company = await storage.createPortfolioCompany(companyData);
    
    // Create founder and associate with company
    const createdFounder = await storage.createFounder({
      ...founder,
      companyId: company.id,
    });
    
    res.status(201).json({ company, founder: createdFounder });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input", errors: error.errors });
    }
    console.error("Create company error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateCompany = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = insertPortfolioCompanySchema.partial().parse(req.body);
    
    const company = await storage.updatePortfolioCompany(id, updateData);
    res.json(company);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input", errors: error.errors });
    }
    console.error("Update company error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteCompany = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await storage.deletePortfolioCompany(id);
    res.status(204).send();
  } catch (error) {
    console.error("Delete company error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMyCompany = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.founderId) {
      return res.status(400).json({ message: "No associated founder" });
    }

    const founder = await storage.getFounderById(req.user.founderId);
    if (!founder || !founder.companyId) {
      return res.status(404).json({ message: "No associated company" });
    }

    const company = await storage.getPortfolioCompanyById(founder.companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json({ company, founder });
  } catch (error) {
    console.error("Get my company error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
