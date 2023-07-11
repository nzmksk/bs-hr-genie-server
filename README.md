# Contents

[Docker Guideline](#docker-guideline)

1. [Prerequisites](#prerequisites)
2. [Getting Started](#getting-started)
3. [Other Useful Commands](#other-useful-commands)

[API Guideline](#api-guideline)

1. [Base URL](#base-url)
2. [Authentication](#authentication)
3. [Endpoints](#endpoints)
   - [POST /login](#post-login)
   - [POST /refresh_token](#post-refresh_token-protected)
   - [POST /register](#post-register-protected)
   - [GET /departments](#get-departments)

[Development Workflow](#development-workflow)

1. [Contributing to Project](#contributing-to-project)

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
   make server-up
   ```
   The server will run on port `2000` while the database and Redis will run on port `35432` and `6379` respectively.

## Other Useful Commands

- To stop the server:
  ```bash
  make server-down
  ```
- To run node.js terminal:
  ```bash
  make node-terminal
  ```
- To run PSQL CLI:
  ```bash
  make psql-cli
  ```
- To run Redis CLI:
  ```bash
  make redis-cli
  ```
- To read the logs of server, database, or Redis:
  ```bash
  make log-server
  make log-db
  make log-redis
  ```

# API Guideline

## Base URL

The base URL for all API endpoints is `http://localhost:2000`

## Authentication

Authentication is required for accessing `[protected]` endpoints. The authentication is based on [JWT (JSON Web Token)](https://github.com/auth0/node-jsonwebtoken#readme). To authenticate requests, include the access token in the `Authorization` header of each request with the `Bearer` scheme. The token should be provided after the `Bearer` keyword.\
\
Example GET request to protected endpoints in Dart:

```Dart
   final baseUrl = "http://localhost:2000";
   final endpoint = "/protected_endpoint";
   final headers = {
      "Content-Type": "application/json",
      "Authorization": "Bearer <your-access-token>",
   };

   final http.Response response = await http.get(
      Uri.parse("$baseUrl$endpoint"),
      headers: headers,
   );
```

Access and refresh tokens can be obtained from the [`/login`](#post-login) or [`/refresh_token`](#post-refresh_token-protected) endpoints. Please note that expired or invalid tokens will result in a `400 Bad Request` or `401 Unauthorized` response.\
\
**Error Examples:**

- Error: 400 Bad Request\
  Access token expired. Example response:
  ```JSON
  {
     "error": "Access token expired. Please refresh your token."
  }
  ```
  Upon receiving this error, you should **refresh your token by presenting your refresh token** to [`/refresh_token`](#post-refresh_token-protected) endpoint using `POST` request.
- Error: 401 Unauthorized\
  Access token was not included in request header. Example response:
  ```JSON
  {
     "error": "Authorization header missing."
  }
  ```
- Error: 401 Unauthorized\
  Access token was invalid or blacklisted. Access token can be blacklisted after a client is logging out or logging in from another device. Example response:
  ```JSON
  {
     "error": "Authentication failed."
  }
  ```

## Endpoints

[Next: /refresh_token](#post-refresh_token-protected)

### POST /login

This endpoint is used for user authentication and obtaining access and refresh tokens. **Access token will be send in JSON format** while the **refresh token is sent as a cookie**.

**Request**\
The request should include the following parameters in the request body:
| Parameter | Data Type | Restrictions | Option |
| ----------- | ----------- | ----------- | ----------- |
| email | string | Max 50 characters | Required |
| password | string | Must be 12 digits | Required |

Example request:

```Dart
   final baseUrl = "http://localhost:2000";
   final endpoint = "/login";
   final headers = {"Content-Type": "application/json"};
   final body = {
      "email": "example@domain.com",
      "password": "123456789012",
   };

   final http.Response response = await http.post(
      Uri.parse("$baseUrl$endpoint"),
      headers: headers,
      body: jsonEncode(body)
   );
```

**Response**

- Success: 200 OK\
  The login was successful. The response body will contain the user's data, a success message, and an access token. Example response:
  ```JSON
  {
     "data": {
        "departmentId": "HR",
        "employeeId": "HR001",
        "employeeRole": "employee",
        "firstName": "John",
        "lastName": "Doe",
        "gender": "male",
        "email": "example@domain.com",
        "position": "Junior Software Engineer",
        "hashedPassword": "<hashed_password>",
        "phone": "0123456789",
        "nric": "123456789012",
        "isMarried": false,
        "joinedDate": "1970-01-01T00:00:00.000Z",
        "profileImage": null,
        "createdAt": "1970-01-01T00:00:00.000Z",
        "lastLogin": null,
        "cleanedEmail": "example@domain.com"
    },
     "message": "Authentication successful.",
     "token": "<your-access-token>"
  }
  ```
- Error: 401 Unauthorized\
  The provided credentials were invalid. Example response:
  ```JSON
  {
     "error": "Invalid password."
  }
  ```
- Error: 404 Not Found\
  The request was invalid or missing required parameters. Example response:
  ```JSON
  {
     "error": "Email does not exist. Please contact admin."
  }
  ```
- Error: 500 Internal Server Error\
  The server encountered an unexpected condition that prevented it from fulfilling the request. Example response:
  ```JSON
  {
     "error": "Internal server error."
  }
  ```

[Prev: /login](#post-login)\
[Next: /register](#post-register-protected)

### POST /refresh_token `[protected]`

This endpoint is used to renew client's access token using valid refresh token. Access token has validity of 15 minutes while refresh token has validity of 6 hours.

**Response**

- Success: 200 OK\
  Token renewal was successful. The response body will contain a success message and an access token. Example response:
  ```JSON
  {
     "message": "Authentication successful.",
     "token": "<your-access-token>"
  }
  ```
- Error: 401 Unauthorized\
  Refresh token had expired. Example response:
  ```JSON
  {
     "error": "Authentication failed."
  }
  ```
- Error: 404 Not Found\
  The server cannot find the requested resource. Example response:
  ```JSON
  {
     "error": "User not found."
  }
  ```

[Prev: /refresh_token](#post-refresh_token-protected)\
[Next: /logout](#post-logout-protected)

### POST /register `[protected]`

This endpoint is used for account registration.

**Request**\
The request should include the following parameters in the request body:
| Parameter | Data Type | Restrictions | Option |
| ----------- | ----------- | ----------- | ----------- |
| department_id | string | Must be 2-3 characters | Required |
| employee_role | string | [enum: `employee`, `manager`, `admin`] | Required |
| first_name | string | Max 50 characters | Required |
| last_name | string | Max 50 characters | Required |
| gender | string | [enum: `male`, `female`] | Required |
| email | string | Max 50 characters | Required |
| nric | string | Must be 12 digits | Required |
| is_married | boolean | | Required |
| joined_date | date | [format: yyyy-mm-dd] | Required |
| phone | string | Max 20 digits | Optional |

Example request in Dart:

```Dart
   final baseUrl = "http://localhost:2000";
   final endpoint = "/register";
   final headers = {
      "Content-Type": "application/json",
      "Authorization": "Bearer <your-jwt-token>",
   };
   final body = {
      "department_id": "HR",
      "employee_role": "employee",
      "first_name": "John",
      "last_name": "Doe",
      "gender": "male",
      "email": "example@domain.com",
      "nric": "123456789012",
      "is_married": true,
      "joined_date": "2023-03-06",
      "phone": null,
   };

   final http.Response response = await http.post(
      Uri.parse(baseUrl + endpoint),
      headers: headers,
      body: jsonEncode(body)
   );
```

**Response**

- Success: 201 Created\
  Account registration was successful. Example response:
  ```JSON
  {
     "message": "Account successfully registered."
  }
  ```
- Error: 409 Conflict\
  The request could not be processed because of conflict in the request. Example response:
  ```JSON
  {
     "error": "Email is already registered."
  }
  ```
- Error: 500 Internal Server Error\
  The server encountered an unexpected condition that prevented it from fulfilling the request. Example response:
  ```JSON
  {
     "error": "Internal server error."
  }
  ```

[Prev: /register](#post-register-protected)

### POST /logout `[protected]`

This endpoint is used to revoke client's access and refresh tokens, effectively preventing the client from making any further requests to protected endpoints.\
Example request in Dart:

```Dart
   final baseUrl = "http://localhost:2000";
   final endpoint = "/logout";
   final headers = {
      "Content-Type": "application/json",
      "Authorization": "<your-jwt-token>",
   };

   final http.Response response = await http.post(
      Uri.parse(baseUrl + endpoint),
      headers: headers
   );
```

**Response**

- Success: 200 OK\
  Token revocation was successful. Example response:
  ```JSON
  {
     "message": "Token revocation successful."
  }
  ```
- Error: 500 Internal Server Error\
  The server encountered an unexpected condition that prevented it from fulfilling the request. Example response:
  ```JSON
  {
     "error": "Internal server error."
  }
  ```

### GET /departments

This endpoint is used to retrieve a list of departments.

**Request**\
No request parameters are required.\
**Response**

- Success: 200 OK\
  The request was successful. The response body will contain an array of department objects. Example response:
  ```JSON
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
  ```JSON
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
