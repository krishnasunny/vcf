import { pgTable, text, serial, integer, boolean, timestamp, real, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const roleEnum = pgEnum("role", ["ADMIN", "PORTFOLIO_COMPANY"]);
export const industryTypeEnum = pgEnum("industry_type", ["SAAS", "HARDWARE", "BIOTECH", "FINTECH", "OTHER"]);
export const roundTypeEnum = pgEnum("round_type", ["SAFE", "CONVERTIBLE", "EQUITY"]);
export const companyStatusEnum = pgEnum("company_status", ["ACTIVE", "EXITED", "ON_HOLD"]);
export const updateFrequencyEnum = pgEnum("update_frequency", ["MONTHLY", "QUARTERLY", "ADHOC"]);

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("PORTFOLIO_COMPANY"),
  founderId: text("founder_id").references(() => founders.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const founders = pgTable("founders", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  linkedInUrl: text("linkedin_url"),
  isWomanFounder: boolean("is_woman_founder").default(false).notNull(),
  companyId: text("company_id").references(() => portfolioCompanies.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const portfolioCompanies = pgTable("portfolio_companies", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  legalName: text("legal_name").notNull(),
  aka: text("aka"),
  countryReg: text("country_reg").notNull(),
  countyOps: text("county_ops").notNull(),
  website: text("website"),
  industryType: industryTypeEnum("industry_type").notNull(),
  industryDetail: text("industry_detail"),
  vintageYear: integer("vintage_year").notNull(),
  currentValuation: real("current_valuation"),
  cashInflow: real("cash_inflow"),
  cashOutflow: real("cash_outflow"),
  runwayMonths: real("runway_months"),
  monthlyBurn: real("monthly_burn"),
  teamSize: integer("team_size"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const fundraising = pgTable("fundraising", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  roundYear: integer("round_year").notNull(),
  amountUSD: real("amount_usd").notNull(),
  roundType: roundTypeEnum("round_type").notNull(),
  coInvestors: text("co_investors"),
  notes2025: text("notes_2025"),
  companyId: text("company_id").notNull().references(() => portfolioCompanies.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const companyRevenue = pgTable("company_revenue", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  year: integer("year").notNull(),
  arr: real("arr"),
  revenueQ1: real("revenue_q1"),
  revenueQ2: real("revenue_q2"),
  revenueQ3: real("revenue_q3"),
  revenueQ4: real("revenue_q4"),
  projectedRevenue: real("projected_revenue"),
  actualRevenue: real("actual_revenue"),
  companyId: text("company_id").notNull().references(() => portfolioCompanies.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const adminSnapshots = pgTable("admin_snapshots", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  status: companyStatusEnum("status").default("ACTIVE").notNull(),
  investmentUSD: real("investment_usd").notNull(),
  investmentYear: integer("investment_year").notNull(),
  valuationAtInvestmentUSD: real("valuation_at_investment_usd").notNull(),
  equityPercent: real("equity_percent").notNull(),
  cNoteAgreementDate: timestamp("c_note_agreement_date"),
  cNoteMaturityDate: timestamp("c_note_maturity_date"),
  pennyWarrantExpiry: timestamp("penny_warrant_expiry"),
  millionWarrantExpiry: timestamp("million_warrant_expiry"),
  noteAction: text("note_action"),
  observationScore: integer("observation_score"),
  pitchedSeriesA: boolean("pitched_series_a"),
  seriesANotes: text("series_a_notes"),
  significantGrowth: boolean("significant_growth"),
  fastestGrowingPitch: boolean("fastest_growing_pitch"),
  irrCompanyBasis: real("irr_company_basis"),
  workInProgress: text("work_in_progress"),
  venturePartner: text("venture_partner"),
  dataroomUrl: text("dataroom_url"),
  founderExperience: text("founder_experience"),
  warmIntroSource: text("warm_intro_source"),
  exitPotential: text("exit_potential"),
  riskFlags: text("risk_flags"),
  boardMembers: text("board_members"),
  safesOutstanding: text("safes_outstanding"),
  esopPoolSize: text("esop_pool_size"),
  lastCheckInDate: timestamp("last_check_in_date"),
  updateFrequency: updateFrequencyEnum("update_frequency").default("MONTHLY").notNull(),
  acceleratorAttended: text("accelerator_attended"),
  adminNotes: text("admin_notes"),
  companyId: text("company_id").notNull().references(() => portfolioCompanies.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  founder: one(founders, {
    fields: [users.founderId],
    references: [founders.id],
  }),
}));

export const foundersRelations = relations(founders, ({ one }) => ({
  company: one(portfolioCompanies, {
    fields: [founders.companyId],
    references: [portfolioCompanies.id],
  }),
}));

export const portfolioCompaniesRelations = relations(portfolioCompanies, ({ many, one }) => ({
  fundraising: many(fundraising),
  revenues: many(companyRevenue),
  adminSnapshot: one(adminSnapshots),
}));

export const fundraisingRelations = relations(fundraising, ({ one }) => ({
  company: one(portfolioCompanies, {
    fields: [fundraising.companyId],
    references: [portfolioCompanies.id],
  }),
}));

export const companyRevenueRelations = relations(companyRevenue, ({ one }) => ({
  company: one(portfolioCompanies, {
    fields: [companyRevenue.companyId],
    references: [portfolioCompanies.id],
  }),
}));

export const adminSnapshotsRelations = relations(adminSnapshots, ({ one }) => ({
  company: one(portfolioCompanies, {
    fields: [adminSnapshots.companyId],
    references: [portfolioCompanies.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFounderSchema = createInsertSchema(founders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPortfolioCompanySchema = createInsertSchema(portfolioCompanies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFundraisingSchema = createInsertSchema(fundraising).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCompanyRevenueSchema = createInsertSchema(companyRevenue).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdminSnapshotSchema = createInsertSchema(adminSnapshots).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Founder = typeof founders.$inferSelect;
export type InsertFounder = z.infer<typeof insertFounderSchema>;
export type PortfolioCompany = typeof portfolioCompanies.$inferSelect;
export type InsertPortfolioCompany = z.infer<typeof insertPortfolioCompanySchema>;
export type Fundraising = typeof fundraising.$inferSelect;
export type InsertFundraising = z.infer<typeof insertFundraisingSchema>;
export type CompanyRevenue = typeof companyRevenue.$inferSelect;
export type InsertCompanyRevenue = z.infer<typeof insertCompanyRevenueSchema>;
export type AdminSnapshot = typeof adminSnapshots.$inferSelect;
export type InsertAdminSnapshot = z.infer<typeof insertAdminSnapshotSchema>;
