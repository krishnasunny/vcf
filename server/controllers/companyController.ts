import { Response } from "express";
import { storage } from "../storage";
import { 
  insertPortfolioCompanySchema, 
  insertFounderSchema, 
  insertFundraisingSchema, 
  insertCompanyRevenueSchema,
  insertAdminSnapshotSchema 
} from "@shared/schema";
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
    const updateData = req.body;

    // Update portfolio company
    if (updateData.legalName || updateData.aka || updateData.countryReg) {
      const companyData = insertPortfolioCompanySchema.partial().parse(updateData);
      await storage.updatePortfolioCompany(id, companyData);
    }

    // Update founder if provided
    if (updateData.founder) {
      const founders = await storage.getFoundersByCompanyId(id);
      if (founders.length > 0) {
        const founderId = founders[0].id;
        const founderData = insertFounderSchema.partial().parse(updateData.founder);
        await storage.updateFounder(founderId, founderData);
      } else {
        // Create new founder if none exists
        const founderData = insertFounderSchema.parse({
          ...updateData.founder,
          companyId: id,
        });
        await storage.createFounder(founderData);
      }
    }

    // Update fundraising rounds
    if (updateData.fundraising && Array.isArray(updateData.fundraising)) {
      // For simplicity, we'll delete existing rounds and create new ones
      // In a real app, you'd want to be more sophisticated about this
      for (const fundraisingRound of updateData.fundraising) {
        const fundraisingData = insertFundraisingSchema.parse({
          ...fundraisingRound,
          companyId: id,
        });
        await storage.createFundraising(fundraisingData);
      }
    }

    // Update revenue data
    if (updateData.revenue && Array.isArray(updateData.revenue)) {
      for (const revenueData of updateData.revenue) {
        const revenueInfo = insertCompanyRevenueSchema.parse({
          ...revenueData,
          companyId: id,
        });
        await storage.createCompanyRevenue(revenueInfo);
      }
    }

    // Update admin snapshot
    if (updateData.adminSnapshot) {
      const existingSnapshot = await storage.getAdminSnapshotByCompanyId(id);
      if (existingSnapshot) {
        const adminData = insertAdminSnapshotSchema.partial().parse(updateData.adminSnapshot);
        await storage.updateAdminSnapshot(existingSnapshot.id, adminData);
      } else {
        const adminData = insertAdminSnapshotSchema.parse({
          ...updateData.adminSnapshot,
          companyId: id,
        });
        await storage.createAdminSnapshot(adminData);
      }
    }

    // Get updated company with all relations
    const updatedCompany = await storage.getPortfolioCompanyById(id);
    res.json(updatedCompany);
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
