# Diet App Backend

This is the backend for a Diet App, built with Node.js, Express, and TypeScript. It provides a RESTful API for managing meal plans and connects to a MySQL database.

## Features

- Complete diet app functionlity
- MySQL database integration
- Dockerized for easy deployment
- Environment variable support

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
- [MySQL](https://www.mysql.com/) (if not using Docker)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/HenzoAbreu/diet-app
   cd diet-app
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env` and fill in your configuration.

4. **Run the app locally:**
   ```bash
   npm run dev
   ```

### Using Docker

To run the backend and MySQL database with Docker Compose:

```bash
# Build and start all services
docker-compose up --build -d
```

This will start:

- **Database**: MySQL on port 3306
- **API**: Node.js/Express on port 3000

To access the application:

- http://localhost:3000
