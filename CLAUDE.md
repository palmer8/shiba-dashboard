# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SHIBA Dashboard is a Next.js 15 administration dashboard built with TypeScript, Prisma ORM, and shadcn/ui components. It provides comprehensive management features for a gaming server environment including user management, content moderation, payment tracking, and real-time monitoring.

## Development Commands

### Core Commands
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Database Commands
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:pull` - Pull schema from database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

## Architecture

### Database Layer
- **Prisma ORM** with PostgreSQL database
- Schema defined in `prisma/schema.prisma`
- Database connections configured in `src/db/` (supports PostgreSQL, MySQL)
- Migration files in `prisma/migrations/`

### Authentication
- NextAuth.js v5 with custom credentials provider
- Configuration in `src/lib/auth-config.ts`
- Role-based access control with UserRole enum (STAFF, INGAME_ADMIN, MASTER, SUPERMASTER)
- Session strategy: JWT with 2-day expiration

### Application Structure
- **App Router** with route groups:
  - `(layout)/` - Main dashboard pages with sidebar navigation
  - `(none)/` - Standalone pages (login, signup, board editing)
- **Server Actions** in `src/actions/` for database operations
- **Services** in `src/service/` for business logic
- **Types** in `src/types/` with comprehensive TypeScript definitions

### UI Framework
- **shadcn/ui** components in `src/components/ui/`
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Recharts** for data visualization
- **Tanstack Table** for data tables

### Key Features
- **Real-time Monitoring** - Live player and group data
- **User Management** - Player profiles, bans, credits, items
- **Content Moderation** - Board management, incident reports
- **Mail System** - Personal and group messaging
- **Payment Tracking** - Transaction monitoring
- **Attendance System** - Check-in/check-out functionality

### Component Organization
Components are organized by feature:
- `admin/` - Administrative interfaces
- `game/` - Gaming-specific features (bans, logs, data tables)
- `mail/` - Messaging system components
- `realtime/` - Live monitoring interfaces
- `dialog/` - Modal dialogs for CRUD operations
- `global/` - Shared navigation and layout components

### Data Fetching
- **SWR** for client-side data fetching
- Server Actions for mutations
- Real-time updates for monitoring features

### File Upload
- Image compression with `browser-image-compression`
- CSV import/export functionality with `csv-parse` and `json2csv`

## Development Notes

### Path Aliases
- `@/*` maps to `src/*` (configured in tsconfig.json)

### Testing
- **Vitest** configured for unit testing

### Key Dependencies
- Next.js 15 with React 19 RC
- Prisma ORM for database operations
- NextAuth.js for authentication
- shadcn/ui component library
- Tailwind CSS for styling