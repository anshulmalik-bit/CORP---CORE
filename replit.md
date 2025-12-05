# Corporate Ritual Simulator

## Overview

A satirical interview simulation application that presents corporate recruitment as a dystopian bureaucratic ritual. The application features a multi-stage interview process with different career archetypes (MBA, BTech, Analyst), transcript recording, and session persistence. Built as a full-stack web application with a brutalist, glitch-aesthetic design inspired by corporate dystopia.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Routing**
- React 18+ with TypeScript for type-safe component development
- Wouter for client-side routing (lightweight alternative to React Router)
- Vite as the build tool and development server, configured for fast HMR and optimized production builds

**State Management**
- React Context API (`SessionProvider`) for global interview session state including:
  - Selected archetype (MBA/BTech/Analyst)
  - Candidate name
  - Interview score
  - Conversation transcript
- TanStack Query (React Query) for server state management and API data fetching/caching

**UI Component System**
- shadcn/ui component library (New York style variant) for consistent, accessible UI components
- Radix UI primitives as the foundation for interactive components
- Tailwind CSS v4 for utility-first styling with custom design tokens
- Custom theming with brutalist design principles:
  - Monospace fonts (Space Mono) for body text
  - Display fonts (Archivo Black, Syne) for headings
  - High contrast black/white color scheme with accent colors (magenta, acid green)
  - Zero border radius (sharp edges throughout)
  - Dot-grid background pattern
  - Custom animations and glitch effects

**Page Structure**
- Home: Landing page with hero image and call-to-action
- PreScreen: Terminal-style loading sequence with archetype selection
- ResumeUpload: File upload simulation with progress tracking
- Interview: Multi-act conversation interface with HR bot
- Verdict: Results page displaying score and archetype assessment
- History: Archive of previous interview sessions

### Backend Architecture

**Server Framework**
- Express.js with TypeScript for the HTTP server
- ES modules configuration (`"type": "module"`) for modern JavaScript syntax
- Custom logging middleware for request/response tracking

**API Design**
- RESTful endpoints under `/api` prefix:
  - `POST /api/sessions` - Create new interview session
  - `GET /api/sessions` - Retrieve recent sessions with optional limit
  - `GET /api/sessions/:id` - Fetch specific session by ID
- JSON request/response format with Zod validation
- Error handling with appropriate HTTP status codes

**Static File Serving**
- Production builds serve pre-compiled client assets from `dist/public`
- Development mode uses Vite middleware for HMR
- Fallback to `index.html` for client-side routing support

**Build Process**
- Custom build script using esbuild for server bundling
- Selective dependency bundling (allowlist approach) to reduce cold start time
- Separate client and server build outputs

### Data Storage

**Database**
- PostgreSQL as the primary relational database
- Drizzle ORM for type-safe database operations and schema management
- Connection pooling via `pg` library

**Schema Design**
- `users` table: Minimal user structure with UUID primary keys (currently unused but present for future auth)
- `interview_sessions` table:
  - Serial integer primary key
  - Archetype field (text)
  - Score field (integer)
  - Transcript field (JSONB array of role/text objects)
  - Created timestamp with automatic default

**Data Access Layer**
- `IStorage` interface defining data operations contract
- `DatabaseStorage` implementation for PostgreSQL-backed persistence
- Drizzle-Zod integration for runtime validation of insert operations

### External Dependencies

**Core UI Libraries**
- Radix UI: Complete suite of unstyled, accessible component primitives
- Lucide React: Icon library for consistent iconography
- Framer Motion: Animation library for page transitions and micro-interactions
- Embla Carousel: Lightweight carousel functionality

**Form & Validation**
- React Hook Form with @hookform/resolvers for form state management
- Zod for runtime type validation and schema definition
- Drizzle-Zod for automatic schema-to-validator conversion

**Development Tools**
- Replit-specific plugins:
  - `@replit/vite-plugin-runtime-error-modal` - Runtime error overlay
  - `@replit/vite-plugin-cartographer` - Development tooling
  - `@replit/vite-plugin-dev-banner` - Development mode indicator
- Custom `vite-plugin-meta-images` for OpenGraph image URL management in Replit deployments

**Database & ORM**
- Drizzle ORM (v0.39.3) with PostgreSQL dialect
- Drizzle Kit for schema migrations and database operations
- `pg` (node-postgres) for database connection pooling

**Styling & CSS**
- Tailwind CSS v4 with PostCSS integration
- `tw-animate-css` for extended animation utilities
- `class-variance-authority` for type-safe variant styling
- `tailwindcss-animate` for pre-built animation utilities

**Utilities**
- `date-fns` for date formatting and manipulation
- `nanoid` for generating unique identifiers
- `clsx` and `tailwind-merge` for conditional class name composition