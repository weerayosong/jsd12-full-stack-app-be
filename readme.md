# JSD12 Week12 | API Server - Full Stack App (Backend)

Frontend Repo: https://github.com/weerayosong/jsd12-full-stack-app-fe (Branch: main)

**Current Status:** The latest development progress is all done on **Branch: phase-07_deployment**.

## Project Overview

This project is a backend RESTful API designed to manage user data for a full-stack application. It demonstrates a progressive architectural evolution from a basic native Node.js server to a scalable, database-driven application utilizing modern design patterns.

## Development Progression & Branch History

The project follows a phased approach, reflecting continuous refactoring and architectural improvements:

- **Phase 1: Native Implementation (v1)**
    - Established the foundational server utilizing Node.js's native `http` module.
    - Implemented manual routing and served static mock data to simulate an initial database environment.
- **Phase 2: Express.js Integration (v2)**
    - Refactored the core server to leverage the `express` framework.
    - Integrated essential middleware, including Cross-Origin Resource Sharing (CORS) and JSON body parsers, to streamline request handling and enhance security.
- **Phase 3: Database Integration & Data Modeling**
    - Transitioned from static mock data to persistent database solutions.
    - **MongoDB & Mongoose ODM:** Implemented a NoSQL connection and designed strictly typed data schemas and models using Mongoose Object Data Modeling.
    - **Supabase (PostgreSQL):** Integrated a relational database layer to demonstrate dual-database competency and handle complex relational structures.
- **Phase 4: Separation of Concerns (SoC)**
    - Restructured the codebase to follow the Separation of Concerns principle.
    - Decoupled routing definitions (`routes`) from business logic (`controllers`), resulting in a highly modular and maintainable directory structure.
- **Phase 5: Centralized Error Handling (Current Phase)**
    - Engineered a global, centralized error-handling middleware.
    - Ensures consistent error formatting and robust exception catching across all API endpoints, preventing server crashes and providing standard HTTP response codes.

- **Phase 6: Authentication & Authorization**
    - Implementation of secure user authentication protocols.
    - Integration of `bcrypt` for robust password hashing prior to database storage.
    - Development of secure session management and endpoint protection mechanisms.

- **Phase 7: Security Middlewares & Deployment**
    - Set CORS to allow Frontend UI app to API Server with cookies and token.
    - Helmet & Rate Limiter for study to implement the security for server.
    - Setup & prepare then deploy API Server on Render.

## Tools & Technologies

- **Node.js:** The core JavaScript runtime environment. Development relies on the native `--watch` flag, eliminating the need for external tools like Nodemon to keep dependencies minimal.
- **Express.js:** The primary web framework utilized for routing and middleware management.
- **MongoDB & Mongoose:** NoSQL database and Object Data Modeling library for flexible schema enforcement.
- **Supabase (PostgreSQL):** Open-source backend-as-a-service utilized for relational data storage.
- **REST Client:** HTTP request testing is managed internally via `.rest` files to independently validate API functionality without relying on heavy GUI clients.

## Dependency Management Philosophy

This project strictly adheres to a minimalist approach regarding third-party packages. Restricting unnecessary npm installations minimizes the project's vulnerability footprint, ensures lightweight deployment builds, and encourages a deep understanding of core backend technologies.
