# Architecture

The project follows a modular architecture with the following key components:

*   **API Endpoints:** The `src/api/` directory contains API endpoints for managing events, groups, marketplace listings, news, and resources. These endpoints use Supabase for data storage and retrieval.
    *   **Purpose:** The API endpoints provide a consistent and secure interface for accessing and manipulating data related to the different entities. They contribute to the overall goal by enabling users and applications to interact with the platform's features.
    *   **Interactions:** The API endpoints handle requests from the UI components and interact with the data adapters and Supabase to retrieve, create, update, and delete data. For example, the `eventsApi.ts` file handles requests related to events, such as creating a new event, retrieving a list of events, or updating an existing event. These requests often involve interactions with the `groupsApi.ts` to manage group associations, and the `membersApi.ts` to manage user RSVPs.

*   **UI Components:** The `src/components/` directory contains reusable UI components.
    *   **Purpose:** The UI components provide a user-friendly interface for interacting with the platform's features. They contribute to the overall goal by making it easy for users to discover and participate in local community activities.
    *   **Interactions:** The UI components display data retrieved from the API endpoints and allow users to interact with the platform. For example, the `NewsList` component displays a list of news articles retrieved from the `newsApi.ts` endpoint. The `EventCard` component displays information about an event retrieved from the `eventsApi.ts` endpoint.

*   **Pages:** The `src/pages/` directory contains the pages of the website.
    *   **Purpose:** The pages provide the overall structure and layout of the website. They contribute to the overall goal by organizing the UI components and providing a clear navigation path for users.
    *   **Interactions:** The pages orchestrate the UI components and API endpoints to provide a complete user experience. For example, the `EventsPage` displays a list of events, allows users to filter events, and provides links to individual event pages.

*   **Data Adapters:** The `src/adapters/` directory contains functions for adapting data between the application-specific format and the Supabase format.
    *   **Purpose:** The data adapters ensure that data is consistent and compatible between the application and the backend. They contribute to the overall goal by simplifying the process of data management and reducing the risk of errors.
    *   **Interactions:** The data adapters are used by the API endpoints to convert data between the application-specific format and the Supabase format. For example, the `eventAdapter.ts` file adapts data between the format used by the `eventsApi.ts` and the format used by Supabase.

*   **Supabase:** Supabase is used as the backend-as-a-service for data storage, authentication, and real-time updates.
    *   **Purpose:** Supabase provides a scalable and reliable backend for the platform. It contributes to the overall goal by providing the necessary infrastructure for data storage, user management, and real-time updates.
    *   **Interactions:** Supabase interacts with the API endpoints to store and retrieve data. It also provides real-time updates to the UI components through its subscription feature.

The data flow is as follows:

1.  The user interacts with the UI components in the `src/pages/` directory.
2.  The UI components call the API endpoints in the `src/api/` directory.
3.  The API endpoints use the adapter functions in the `src/adapters/` directory to convert the data between the application-specific format and the Supabase format.
4.  The API endpoints interact with Supabase to store and retrieve data.
5.  Supabase sends real-time updates to the UI components.

The entities (events, groups, marketplace listings, news, resources, users, and companies) are managed and presented through this architecture. Each entity has its own API endpoints, UI components, and data adapters. The pages orchestrate these components to provide a complete user experience for each entity. For example, the `EventsPage` displays a list of events, allows users to filter events, and provides links to individual event pages. The `GroupsPage` displays a list of groups, allows users to search for groups, and provides links to individual group pages.