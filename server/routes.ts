import type { Express } from "express";
import { createServer, type Server } from "http";
import { authenticateToken, requireRole, requireAdminOrOwnCompany } from "./middleware/auth";
import { login, register } from "./controllers/authController";
import { 
  getAllCompanies, 
  getCompanyById, 
  createCompany, 
  updateCompany, 
  deleteCompany,
  getMyCompany 
} from "./controllers/companyController";
import { 
  getFundraisingByCompany, 
  createFundraising, 
  updateFundraising, 
  deleteFundraising 
} from "./controllers/fundraisingController";
import { 
  getRevenueByCompany, 
  createRevenue, 
  updateRevenue, 
  deleteRevenue 
} from "./controllers/revenueController";
import { getFounderByCompany, updateFounder } from "./controllers/founderController";
import { 
  getAllBrainTrustMentors, 
  getBrainTrustMentorById, 
  createBrainTrustMentor, 
  updateBrainTrustMentor, 
  deleteBrainTrustMentor 
} from "./controllers/brainTrustController";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", login);
  app.post("/api/auth/register", authenticateToken, requireRole("ADMIN"), register);

  // Company routes
  app.get("/api/companies", authenticateToken, requireRole("ADMIN"), getAllCompanies);
  app.get("/api/companies/:id", authenticateToken, requireAdminOrOwnCompany, getCompanyById);
  app.post("/api/companies", authenticateToken, requireRole("ADMIN"), createCompany);
  app.put("/api/companies/:id", authenticateToken, requireAdminOrOwnCompany, updateCompany);
  app.delete("/api/companies/:id", authenticateToken, requireRole("ADMIN"), deleteCompany);
  
  // Portfolio company specific routes
  app.get("/api/my-company", authenticateToken, requireRole("PORTFOLIO_COMPANY"), getMyCompany);
  
  // Founder routes
  app.get("/api/companies/:companyId/founder", authenticateToken, requireAdminOrOwnCompany, getFounderByCompany);
  app.put("/api/founders/:id", authenticateToken, requireAdminOrOwnCompany, updateFounder);

  // Fundraising routes
  app.get("/api/companies/:companyId/fundraising", authenticateToken, requireAdminOrOwnCompany, getFundraisingByCompany);
  app.post("/api/companies/:companyId/fundraising", authenticateToken, requireAdminOrOwnCompany, createFundraising);
  app.put("/api/fundraising/:id", authenticateToken, requireAdminOrOwnCompany, updateFundraising);
  app.delete("/api/fundraising/:id", authenticateToken, requireAdminOrOwnCompany, deleteFundraising);

  // Revenue routes
  app.get("/api/companies/:companyId/revenue", authenticateToken, requireAdminOrOwnCompany, getRevenueByCompany);
  app.post("/api/companies/:companyId/revenue", authenticateToken, requireAdminOrOwnCompany, createRevenue);
  app.put("/api/revenue/:id", authenticateToken, requireAdminOrOwnCompany, updateRevenue);
  app.delete("/api/revenue/:id", authenticateToken, requireAdminOrOwnCompany, deleteRevenue);

  // Brain Trust mentor routes
  app.get("/api/brain-trust-mentors", authenticateToken, getAllBrainTrustMentors);
  app.get("/api/brain-trust-mentors/:id", authenticateToken, getBrainTrustMentorById);
  app.post("/api/brain-trust-mentors", authenticateToken, requireRole("ADMIN"), createBrainTrustMentor);
  app.put("/api/brain-trust-mentors/:id", authenticateToken, requireRole("ADMIN"), updateBrainTrustMentor);
  app.delete("/api/brain-trust-mentors/:id", authenticateToken, requireRole("ADMIN"), deleteBrainTrustMentor);

  const httpServer = createServer(app);
  return httpServer;
}
