# VC Portfolio Management Platform

## Overview

This is a full-stack venture capital portfolio management platform built with Express.js (MVC architecture) and React. The platform enables VC firms to manage their portfolio companies through a comprehensive admin panel while providing portfolio companies with dedicated dashboards to track their performance, funding, and growth metrics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, built using Vite
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React Query (@tanstack/react-query) for server state management
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation
- **Authentication**: Context-based auth with JWT tokens

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Architecture Pattern**: MVC (Model-View-Controller)
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **Middleware**: Custom auth middleware with role-based access control (RBAC)

### Database Schema
The application uses a normalized PostgreSQL schema with the following key entities:
- **Users**: Authentication and role management
- **Founders**: Individual founder information
- **Portfolio Companies**: Company details and operational metrics
- **Fundraising**: Investment rounds and funding history
- **Company Revenue**: Revenue tracking and financial metrics
- **Admin Snapshots**: Administrative tracking data

## Key Components

### Authentication System
- **JWT-based authentication** with role-based access control
- **Two primary roles**: ADMIN and PORTFOLIO_COMPANY
- **Role-specific access**: Admins have full CRUD access, portfolio companies can only manage their own data
- **Protected routes** with middleware validation

### Admin Dashboard
- **Company Management**: Create, read, update, and delete portfolio companies
- **User Management**: Create accounts for portfolio companies (no self-registration)
- **Data Analytics**: View aggregate portfolio metrics and performance
- **Full Access Control**: Complete CRUD operations on all entities

### Portfolio Company Dashboard
- **Company Profile Management**: Update company information and founder details
- **Revenue Reporting**: Track and submit revenue data across quarters
- **Fundraising Management**: Record and manage funding rounds
- **Performance Metrics**: View company-specific KPIs and growth metrics

### UI Components
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Component Library**: Extensive use of shadcn/ui components
- **Form Handling**: Comprehensive form validation with React Hook Form and Zod
- **Data Visualization**: Tables, cards, and metrics displays for data presentation

## Data Flow

1. **Authentication Flow**:
   - User logs in with email/password
   - JWT token generated and stored locally
   - Role-based routing (Admin → /admin, Portfolio Company → /dashboard)

2. **Admin Operations**:
   - Create portfolio companies with founder information
   - Manage all company data, revenue, and fundraising records
   - Access comprehensive analytics and reporting

3. **Portfolio Company Operations**:
   - Access only their own company data
   - Update company profiles and founder information
   - Submit revenue reports and fundraising updates
   - View performance metrics and growth trends

4. **Data Persistence**:
   - All data operations go through Express.js controllers
   - Database operations handled by Drizzle ORM
   - Real-time updates through React Query invalidation

## External Dependencies

### Core Dependencies
- **Database**: Neon serverless PostgreSQL
- **ORM**: Drizzle with PostgreSQL dialect
- **Authentication**: JWT tokens with bcrypt password hashing
- **UI Library**: Radix UI components via shadcn/ui
- **Form Validation**: Zod schema validation
- **HTTP Client**: Fetch API with React Query

### Development Dependencies
- **Build Tool**: Vite for frontend, esbuild for backend
- **Development Server**: Vite dev server with HMR
- **Type Checking**: TypeScript with strict mode
- **Linting**: ESLint configuration

## Deployment Strategy

### Development Environment
- **Frontend**: Vite development server with hot module replacement
- **Backend**: tsx for TypeScript execution in development
- **Database**: Neon serverless PostgreSQL connection
- **Environment**: Development mode with debugging enabled

### Production Build
- **Frontend**: Vite build process generating optimized static assets
- **Backend**: esbuild compilation to ESM format
- **Database**: Production Neon database with connection pooling
- **Deployment**: Single-server deployment with static file serving

### Database Management
- **Migrations**: Drizzle Kit for database schema management
- **Schema Updates**: `db:push` command for applying schema changes
- **Connection**: Neon serverless with WebSocket support for real-time capabilities

The platform is designed to be scalable and maintainable, with clear separation of concerns between admin and portfolio company functionalities, comprehensive authentication and authorization, and a modern tech stack that supports both development efficiency and production performance.