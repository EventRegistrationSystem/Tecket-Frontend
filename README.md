# Event Ticket Retail Platform

This project is a Vue.js 3 application for an event ticket retail platform, built using Vite. It allows users to browse events, purchase tickets, and manage their registrations. Organizers can manage events, view attendee lists, and oversee registrations.

## Prerequisites

Before you begin, ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (which includes npm)
*   [Docker](https://www.docker.com/get-started) (for Docker-based setup)

## Getting Started

### 1. Clone the Repository

```sh
git clone <https://github.com/EventRegistrationSystem/Tecket-Frontend>
cd Tecket-Frontend
```

### 2. Environment Configuration

This project uses environment variables for configuration. Create a `.env` file in the root of the project. You may need to populate this file with necessary variables such as API endpoints.

Example `.env` structure:
```
VITE_API_BASE_URL=http://localhost:8080/api
# Add other environment variables as needed
```

### 3. Local Development Setup

#### Install Dependencies
```sh
npm install
```

#### Compile and Hot-Reload for Development
This command starts the Vite development server.
```sh
npm run dev
```
The application will typically be available at `http://localhost:5173` (or another port if 5173 is in use - check the terminal output).

#### Compile and Minify for Production
This command builds the application for production in the `dist` directory.
```sh
npm run build
```

#### Preview Production Build Locally
This command serves the production build from the `dist` directory.
```sh
npm run preview
```

### 4. Docker Setup (Alternative)

You can also build and run the application using Docker.

#### Build the Docker Image
From the project root directory (where the `Dockerfile` is located):
```sh
docker build -t tecket-frontend .
```

#### Run the Docker Container
This command runs the application in a Docker container and maps port 8080 on your host to port 80 in the container (where Nginx is serving the app).
```sh
docker run -p 8080:80 tecket-frontend
```
The application will then be accessible at `http://localhost:8080`.

## Recommended IDE Setup

*   [VSCode](https://code.visualstudio.com/)
*   [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (ensure Vetur is disabled if previously installed)

## Customize Configuration

For more advanced configuration options with Vite, see the [Vite Configuration Reference](https://vite.dev/config/).
