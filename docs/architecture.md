# Hyperlocal Community Platform Architecture

## 1. Overview

This document describes the high-level architecture for the hyperlocal community platform.

## 2. Components

### 2.1 Frontend

*   Technology: React, TypeScript, Vite
*   Responsibilities:
    *   User interface for all features (User Management, Events, Groups, Marketplace, News, Resources, Opportunities, Company Profiles).
    *   Handles user interactions and data display.
    *   Communicates with the backend APIs.
    *   Implements role-based access control.
*   Key Components:
    *   UI Components: Reusable components for forms, lists, cards, etc. (e.g., [`src/components/CompaniesList/CompanyCard.tsx`](src/components/CompaniesList/CompanyCard.tsx), [`src/components/GroupsList/GroupCard.tsx`](src/components/GroupsList/GroupCard.tsx)).
    *   Page Components: Layout and structure for individual pages (e.g., [`src/pages/CompanyDetailPage/index.tsx`](src/pages/CompanyDetailPage/index.tsx), [`src/pages/MarketplacePage/index.tsx`](src/pages/MarketplacePage/index.tsx)).
    *   Data Fetching: Hooks for fetching data from the backend (e.g., [`src/hooks/useCompanyQueries.ts`](src/hooks/useCompanyQueries.ts), [`src/hooks/useEventQueries.ts`](src/hooks/useEventQueries.ts)).

### 2.2 Backend

*   Technology: Node.js, Express.js, TypeScript
*   Responsibilities:
    *   API endpoints for all features.
    *   Business logic and data processing.
    *   Authentication and authorization.
    *   Database interaction.
*   Key Components:
    *   API Routers: Handles routing for different features (e.g., `/api/users`, `/api/events`, `/api/groups`).
    *   Controllers: Implements the business logic for each API endpoint.
    *   Services: Handles data access and manipulation.

### 2.3 Database

*   Technology: Supabase
*   Responsibilities:
    *   Data persistence for users, events, groups, marketplace listings, news articles, resources, opportunities, and company profiles.
    *   Role-based access control.
*   Key Components:
    *   Tables: Separate tables for each entity (e.g., `users`, `events`, `groups`, `marketplace_listings`, `news_articles`, `resources`, `opportunities`, `companies`).
    *   Functions: Serverless functions for specific tasks (e.g., user registration, password reset).
    *   Policies: Row Level Security policies for access control.

### 2.4 Authentication

*   Technology: Supabase Auth
*   Responsibilities:
    *   User registration, login, logout.
    *   Password reset.
    *   Role-based access control.

### 2.5 Storage

*   Technology: Supabase Storage
*   Responsibilities:
    *   Storage for user profile images, event images, marketplace listing images, and resource files.

## 3. Component Interactions

1.  The user interacts with the frontend through a web browser.
2.  The frontend sends API requests to the backend.
3.  The backend processes the requests, interacts with the database, and returns a response to the frontend.
4.  The frontend displays the data to the user.
5.  Supabase Auth handles user authentication and authorization.
6.  Supabase Storage stores files.

## 4. Technology Choices Rationale

*   **React:** A popular JavaScript library for building user interfaces. It is component-based, which makes it easy to build reusable UI elements.
*   **TypeScript:** A superset of JavaScript that adds static typing. This helps to prevent errors and makes the code more maintainable.
*   **Vite:** A fast build tool for modern web applications.
*   **Node.js:** A JavaScript runtime environment that allows you to run JavaScript on the server.
*   **Express.js:** A popular Node.js framework for building web applications.
*   **Supabase:** A backend-as-a-service platform that provides a database, authentication, and storage. It is easy to use and provides all the features needed for this project.

## 5. Alignment with PRDMasterPlan.md and high\_level\_tests.ts

The architecture is designed to support all the AI verifiable tasks in [`docs/PRDMasterPlan.md`](docs/PRDMasterPlan.md) and pass all the high-level acceptance tests in [`tests/high_level_tests.ts`](tests/high_level_tests.ts). Each module (User Management, Events, Groups, Marketplace, News, Resources, Opportunities, Company Profiles) has its own set of API endpoints, database tables, and UI components. This modular design makes it easy to implement the features and tests defined in the PRDMasterPlan.md and high\_level\_tests.ts. For example, the User Account Management tests (UAM-001 through UAM-007) in tests/high\_level\_tests.ts are supported by the User Management module's API endpoints, database tables, and UI components.

## 6. .memory and .docsregistry Consultation

The architecture will consult the `.memory` file for any relevant signals or data that may influence the design or implementation. It will also consult the `.docsregistry` file to ensure that all architectural decisions are properly documented and linked.