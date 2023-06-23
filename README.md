# Docker Guideline

This guideline provides instructions and best practices for using Docker in your project.

## Prerequisites

- Docker: [Installation Guide](https://docs.docker.com/get-docker/)
- Docker Compose: [Installation Guide](https://docs.docker.com/compose/install/)

## Getting Started

Follow these steps to set up and run the project using Docker.

1. Fork [this repository](https://github.com/nzmksk/bs-hr-genie-server).
2. Clone your forked repository:
   ```bash
   git clone <forked-repository-url>
   cd <your-repository-directory>
   ```
3. Build the Docker image and run the containers:
   ```bash
   docker-compose up --build -d
   ```
4. To check if the server and database is running:
   ```bash
   docker logs hr-server
   docker logs hr-db
   ```
The server will run on port `2000` while the database will run on port `35432`.

## Other Useful Commands
1. To stop the server and database:
   ```bash
   docker-compose down -v
   sudo rm -r data
   ```
2. To run the server script while the server is running:
   ```bash
   docker exec -it hr-server sh
   ```
3. To run PostgreSQL script while the database is running:
   ```bash
   docker exec -it hr-db psql -U postgres -d hr-genie
   ```

# API Guideline
## Base URL
The base URL for all API endpoints is `http://localhost:2000`

## Authentication
Authentication is required for accessing protected endpoints. The authentication is based on JWT (JSON Web Token). Include the JWT token in the `Authorization` header of each request with the `Bearer` scheme. Example:
```
Authorization: Bearer <your-jwt-token>
```
## Endpoint
### 1. /register
Endpoint: `POST /register`\
This endpoint is used for account registration.

**Request**\
The request should include the following parameters in the request body:
| Parameter | Data Type | Option |
| ----------- | ----------- | ----------- |
| department_id | string | Required |
| employee_role | enum string [`employee`, `manager`, `admin`] | Required |
| first_name | string | Required |
| last_name | string | Required |
| gender | enum string [`male`, `female`] | Required |
| email | string | Required |
| nric | string | Required |
| phone | string | Optional |
| is_probation | boolean | Optional |
| is_married | boolean | Optional |
| joined_date | date | Optional |

**Response**
- Success: 201 Created\
  The user registration was successful. Example response:
  ```
  {
     "message": "Account successfully registered."
  }
  ```
- Error: 400 Bad Request\
  The request was invalid or missing required parameters. Example response:
  ```
  {
     "message": "Invalid department ID."
  }
  ```
- Error: 409 Conflict\
  The request could not be processed because of conflict in the request. Example response:
  ```
  {
     "message": "Email is already registered."
  }
  ```
- Error: 500 Internal Server Error\
  The server encountered an unexpected condition that prevented it from fulfilling the request. Example response:
  ```
  {
     "message": "Internal server error."
  }
  ```
### 2. /login
Endpoint: `POST /login`\
This endpoint is used for user authentication and obtaining an access token.

**Request**\
The request should include the following parameters in the request body:
| Parameter | Data Type | Option |
| ----------- | ----------- | ----------- |
| email | string | Required |
| password | string | Required |

**Response**
- Success: 200 OK\
  The login was successful. The response body will contain a success message and an access token. Example response:
  ```
  {
     "message": "Login successful.",
     "token": "<your-access-token>"
  }
  ```
- Error: 400 Bad Request\
  The request was invalid or missing required parameters. Example response:
  ```
  {
     "message": "Email does not exist. Please contact admin."
  }
  ```
- Error: 401 Unauthorized\
  The provided credentials are invalid. Example response:
  ```
  {
     "message": "Password is invalid."
  }
  ```
- Error: 500 Internal Server Error\
  The server encountered an unexpected condition that prevented it from fulfilling the request. Example response:
  ```
  {
     "message": "Internal server error."
  }
  ```
### 3. /departments
Endpoint: `GET /departments`\
This endpoint is used to retrieve a list of departments.

**Request**\
No request parameters are required.\
**Response**
- Success: 200 OK\
  The request was successful. The response body will contain an array of department objects. Example response:
  ```
  {
     "data": [
         {
             "department_id": "HR",
             "department_name": "Human Resources"
         },
         {
             "department_id": "BE",
             "department_name": "Backend Development"
         }
     ]
  }
  ```
- Error: 500 Internal Server Error\
  The server encountered an unexpected condition that prevented it from fulfilling the request. Example response:
  ```
  {
     "message": "Internal server error."
  }
  ```

# Development Workflow
## Contributing to Project
If you wish to make changes to the codebase and contribute to the project, follow these steps:
1. Create your own branch:
   ```bash
   git branch <your-branch-name>
   ```
2. Switch to your branch:
   ```bash
   git checkout <your-branch-name>
   ```
3. Add the original repository as your upstream remote:
   ```bash
   git remote add upstream git@github.com:nzmksk/bs-hr-genie-server.git
   ```
4. To commit your changes:
   ```bash
   git add .
   git commit -m "Your commit message"
   ```
5. Pull the latest changes from the upstream repository:
   ```bash
   git pull upstream master
   ```
6. Resolve any conflicts that may arise during the merge process.
7. Push your branch to GitHub:
   ```bash
   git push origin <your-branch-name>
   ```
8. Create a pull request:
   - Go to the original repository on GitHub.
   - Switch to your branch.
   - Click on the "New Pull Request" button.
   - Provide a meaningful title and description for your pull request.
   - Review the changes and submit the pull request.
9. Wait for code review and approval from the project maintainers. Make any necessary updates or address feedback as requested.
10. Once your pull request is approved, it will be merged into the main branch of the original repository.