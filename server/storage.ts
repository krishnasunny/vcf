import { 
  users, 
  founders, 
  portfolioCompanies, 
  fundraising, 
  companyRevenue, 
  adminSnapshots,
  brainTrustMentors,
  type User, 
  type InsertUser,
  type Founder,
  type InsertFounder,
  type PortfolioCompany,
  type InsertPortfolioCompany,
  type Fundraising,
  type InsertFundraising,
  type CompanyRevenue,
  type InsertCompanyRevenue,
  type AdminSnapshot,
  type InsertAdminSnapshot,
  type BrainTrustMentor,
  type InsertBrainTrustMentor
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserById(id: string): Promise<User | undefined>;
  
  // Founder operations
  createFounder(founder: InsertFounder): Promise<Founder>;
  getFounderById(id: string): Promise<Founder | undefined>;
  getFoundersByCompanyId(companyId: string): Promise<Founder[]>;
  updateFounder(id: string, founder: Partial<InsertFounder>): Promise<Founder>;
  
  // Portfolio Company operations
  getAllPortfolioCompanies(): Promise<PortfolioCompany[]>;
  getPortfolioCompanyById(id: string): Promise<PortfolioCompany | undefined>;
  createPortfolioCompany(company: InsertPortfolioCompany): Promise<PortfolioCompany>;
  updatePortfolioCompany(id: string, company: Partial<InsertPortfolioCompany>): Promise<PortfolioCompany>;
  deletePortfolioCompany(id: string): Promise<void>;
  
  // Fundraising operations
  getFundraisingByCompanyId(companyId: string): Promise<Fundraising[]>;
  createFundraising(fundraising: InsertFundraising): Promise<Fundraising>;
  updateFundraising(id: string, fundraising: Partial<InsertFundraising>): Promise<Fundraising>;
  deleteFundraising(id: string): Promise<void>;
  
  // Revenue operations
  getRevenueByCompanyId(companyId: string): Promise<CompanyRevenue[]>;
  createCompanyRevenue(revenue: InsertCompanyRevenue): Promise<CompanyRevenue>;
  updateCompanyRevenue(id: string, revenue: Partial<InsertCompanyRevenue>): Promise<CompanyRevenue>;
  deleteCompanyRevenue(id: string): Promise<void>;
  
  // Admin snapshot operations
  getAdminSnapshotByCompanyId(companyId: string): Promise<AdminSnapshot | undefined>;
  createAdminSnapshot(snapshot: InsertAdminSnapshot): Promise<AdminSnapshot>;
  updateAdminSnapshot(id: string, snapshot: Partial<InsertAdminSnapshot>): Promise<AdminSnapshot>;
  
  // Brain Trust mentor operations
  getAllBrainTrustMentors(): Promise<BrainTrustMentor[]>;
  getBrainTrustMentorById(id: string): Promise<BrainTrustMentor | undefined>;
  createBrainTrustMentor(mentor: InsertBrainTrustMentor): Promise<BrainTrustMentor>;
  updateBrainTrustMentor(id: string, mentor: Partial<InsertBrainTrustMentor>): Promise<BrainTrustMentor>;
  deleteBrainTrustMentor(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async createFounder(insertFounder: InsertFounder): Promise<Founder> {
    const [founder] = await db.insert(founders).values(insertFounder).returning();
    return founder;
  }

  async getFounderById(id: string): Promise<Founder | undefined> {
    const [founder] = await db.select().from(founders).where(eq(founders.id, id));
    return founder || undefined;
  }

  async getFoundersByCompanyId(companyId: string): Promise<Founder[]> {
    const foundersList = await db
      .select()
      .from(founders)
      .where(eq(founders.companyId, companyId));
    
    return foundersList;
  }

  async updateFounder(id: string, founder: Partial<InsertFounder>): Promise<Founder> {
    const [updatedFounder] = await db
      .update(founders)
      .set({ ...founder, updatedAt: new Date() })
      .where(eq(founders.id, id))
      .returning();
    return updatedFounder;
  }

  async getAllPortfolioCompanies(): Promise<PortfolioCompany[]> {
    return await db.select().from(portfolioCompanies);
  }

  async getPortfolioCompanyById(id: string): Promise<PortfolioCompany | undefined> {
    const [company] = await db.select().from(portfolioCompanies).where(eq(portfolioCompanies.id, id));
    
    if (!company) return undefined;
    
    // Get related data
    const founder = await this.getFoundersByCompanyId(id);
    const fundraising = await this.getFundraisingByCompanyId(id);
    const revenue = await this.getRevenueByCompanyId(id);
    const adminSnapshot = await this.getAdminSnapshotByCompanyId(id);
    
    return {
      ...company,
      founder: founder[0] || undefined,
      fundraising,
      revenue,
      adminSnapshot,
    };
  }

  async createPortfolioCompany(company: InsertPortfolioCompany): Promise<PortfolioCompany> {
    const [createdCompany] = await db.insert(portfolioCompanies).values(company).returning();
    return createdCompany;
  }

  async updatePortfolioCompany(id: string, company: Partial<InsertPortfolioCompany>): Promise<PortfolioCompany> {
    const [updatedCompany] = await db
      .update(portfolioCompanies)
      .set({ ...company, updatedAt: new Date() })
      .where(eq(portfolioCompanies.id, id))
      .returning();
    return updatedCompany;
  }

  async deletePortfolioCompany(id: string): Promise<void> {
    await db.delete(portfolioCompanies).where(eq(portfolioCompanies.id, id));
  }

  async getFundraisingByCompanyId(companyId: string): Promise<Fundraising[]> {
    return await db.select().from(fundraising).where(eq(fundraising.companyId, companyId));
  }

  async createFundraising(fundraisingData: InsertFundraising): Promise<Fundraising> {
    const [createdFundraising] = await db.insert(fundraising).values(fundraisingData).returning();
    return createdFundraising;
  }

  async updateFundraising(id: string, fundraisingData: Partial<InsertFundraising>): Promise<Fundraising> {
    const [updatedFundraising] = await db
      .update(fundraising)
      .set({ ...fundraisingData, updatedAt: new Date() })
      .where(eq(fundraising.id, id))
      .returning();
    return updatedFundraising;
  }

  async deleteFundraising(id: string): Promise<void> {
    await db.delete(fundraising).where(eq(fundraising.id, id));
  }

  async getRevenueByCompanyId(companyId: string): Promise<CompanyRevenue[]> {
    return await db.select().from(companyRevenue).where(eq(companyRevenue.companyId, companyId));
  }

  async createCompanyRevenue(revenue: InsertCompanyRevenue): Promise<CompanyRevenue> {
    const [createdRevenue] = await db.insert(companyRevenue).values(revenue).returning();
    return createdRevenue;
  }

  async updateCompanyRevenue(id: string, revenue: Partial<InsertCompanyRevenue>): Promise<CompanyRevenue> {
    const [updatedRevenue] = await db
      .update(companyRevenue)
      .set({ ...revenue, updatedAt: new Date() })
      .where(eq(companyRevenue.id, id))
      .returning();
    return updatedRevenue;
  }

  async deleteCompanyRevenue(id: string): Promise<void> {
    await db.delete(companyRevenue).where(eq(companyRevenue.id, id));
  }

  async getAdminSnapshotByCompanyId(companyId: string): Promise<AdminSnapshot | undefined> {
    const [snapshot] = await db.select().from(adminSnapshots).where(eq(adminSnapshots.companyId, companyId));
    return snapshot || undefined;
  }

  async createAdminSnapshot(snapshot: InsertAdminSnapshot): Promise<AdminSnapshot> {
    const [createdSnapshot] = await db.insert(adminSnapshots).values(snapshot).returning();
    return createdSnapshot;
  }

  async updateAdminSnapshot(id: string, snapshot: Partial<InsertAdminSnapshot>): Promise<AdminSnapshot> {
    const [updatedSnapshot] = await db
      .update(adminSnapshots)
      .set({ ...snapshot, updatedAt: new Date() })
      .where(eq(adminSnapshots.id, id))
      .returning();
    return updatedSnapshot;
  }

  // Brain Trust mentor operations
  async getAllBrainTrustMentors(): Promise<BrainTrustMentor[]> {
    return await db.select().from(brainTrustMentors);
  }

  async getBrainTrustMentorById(id: string): Promise<BrainTrustMentor | undefined> {
    const [mentor] = await db.select().from(brainTrustMentors).where(eq(brainTrustMentors.id, id));
    return mentor || undefined;
  }

  async createBrainTrustMentor(mentor: InsertBrainTrustMentor): Promise<BrainTrustMentor> {
    const [createdMentor] = await db.insert(brainTrustMentors).values(mentor).returning();
    return createdMentor;
  }

  async updateBrainTrustMentor(id: string, mentor: Partial<InsertBrainTrustMentor>): Promise<BrainTrustMentor> {
    const [updatedMentor] = await db
      .update(brainTrustMentors)
      .set({ ...mentor, updatedAt: new Date() })
      .where(eq(brainTrustMentors.id, id))
      .returning();
    return updatedMentor;
  }

  async deleteBrainTrustMentor(id: string): Promise<void> {
    await db.delete(brainTrustMentors).where(eq(brainTrustMentors.id, id));
  }
}

export const storage = new DatabaseStorage();
