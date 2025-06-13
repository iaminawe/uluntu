# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

#### Event Management System (Priority 3)
- **Event Registration System** - Complete registration/unregistration flow with real-time status updates
  - Added `registerForEvent()`, `unregisterFromEvent()`, and `getRegistrationStatus()` API methods
  - Created registration hooks with React Query integration
  - Implemented smart RegisterSidebar component with different UI states
  - Added automatic attendee count updates via database triggers

- **Event Attendee Management** - Full attendee tracking and management for organizers
  - Added `getEventAttendees()` and `updateAttendeeStatus()` API methods
  - Created AttendeesList component with expandable view
  - Implemented organizer controls for confirming/canceling registrations
  - Added registration timestamps and status tracking

- **Event Discovery & Search** - Enhanced event filtering and search capabilities
  - Connected search functionality between ActionBar and EventsList
  - Added event type filtering (in-person, online, hybrid)
  - Implemented date range filtering (upcoming, this month, next 3 months, all)
  - Fixed filter state management and prop passing

- **Event Detail Views** - Comprehensive event pages
  - Event sessions with video embedding support
  - Presenter profiles with bio and contact info
  - Downloadable resources per session
  - Complete event metadata display

#### Marketplace System (Priority 4)
- **Contact Information Management** - Secure buyer-seller communication
  - Added database fields: `contact_email`, `contact_phone`, `contact_method`, `show_contact_info`
  - Created ContactInfoSection component for seller preferences
  - Implemented privacy controls for contact information
  - Added contact method selection (email only, phone only, or both)

- **Enhanced ContactModal** - Smart contact display
  - Shows direct contact information when available
  - Falls back to contact form for privacy
  - Includes helpful tips for contacting sellers
  - Secure mailto and tel links

- **User-Member Relationship** - Automatic seller identification
  - Created `useCurrentMember` hook to get member profile from auth user
  - Added `getByUserId()` method to membersApi
  - Automatically populates seller_id from authenticated user
  - Fixed hardcoded seller IDs throughout the application

- **Form Validation** - Comprehensive input validation
  - Client-side validation for all required fields
  - Contact information validation based on selected method
  - Price validation (non-negative)
  - Authentication check before listing creation

### Fixed
- **API Type Mismatch** - Fixed useCompanyEmployees returning wrong type (Company[] → Member[])
- **Missing API Implementation** - Implemented membersApi.getByCompany()
- **React Router Compatibility** - Fixed Next.js Link imports and href→to prop conversion
- **Missing Data Imports** - Fixed sampleData imports in EventsSection component

### Changed
- **Authentication Integration** - Removed redundant auth template in favor of existing Redux auth
- **Type Definitions** - Updated MarketplaceItem and related types to include contact fields
- **Database Schema** - Extended marketplace_listings table with contact information
- **API Adapters** - Updated all marketplace adapters to handle new fields

### Documentation
- Created comprehensive `TECHNICAL_DOCUMENTATION.md` covering:
  - Architecture overview and technology stack
  - Database schema with all tables and relationships
  - State management patterns
  - Authentication and authorization flows
  - Performance optimizations

- Created detailed `API_DOCUMENTATION.md` with:
  - Complete API reference for all modules
  - TypeScript interfaces and examples
  - Error handling patterns
  - React Query integration examples

- Updated `README.md` with:
  - Enhanced feature descriptions
  - References to new documentation
  - Updated usage examples

## [1.0.0] - Initial Release

### Added
- Basic platform structure with React + Vite + TypeScript
- Supabase integration for backend services
- Redux Toolkit for state management
- React Query for server state
- Authentication system with role-based access
- Basic CRUD operations for all resources
- Responsive UI with Tailwind CSS
- Dark mode support
- Jest testing setup