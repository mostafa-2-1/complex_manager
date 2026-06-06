# Assumptions & Design Decisions

## Authentication & Security

### JWT Stateless Authentication

JWT was chosen for authentication due to its scalability and seamless integration with Angular HTTP interceptors. Access tokens expire after **24 hours** and can be configured through environment variables.

### Password Security

Passwords are securely hashed using **bcrypt** before storage. Plain-text passwords are never stored, returned, or logged.

### Role Hierarchy

The system implements a three-level administrative hierarchy:

| Role           | Permissions                            |
| -------------- | -------------------------------------- |
| Super Admin    | Full system access                     |
| Complex Admin  | Manages assigned residential complexes |
| Building Admin | Manages assigned buildings             |

---

## Data Modeling Decisions

### Cascading Deletes

When a residential complex is deleted, all associated buildings are automatically deleted through database-level cascading. This prevents orphaned records and reflects real-world ownership relationships.

### Hard Deletes

Hard deletion was selected over soft deletion for simplicity and because the assessment requirements explicitly requested DELETE operations without recovery requirements.

### Enum Constraints

Fields such as **civility**, **role**, and **status** are enforced using database-level ENUM constraints to maintain data integrity.

### Admin Assignment

Complexes and buildings cannot be created without assigning an existing administrator:

* Residential complexes require a `complex_admin`
* Buildings require a `building_admin`

Administrators are created independently and then assigned through dropdown selections during entity creation.

### Admin Deletion Behavior

Deleting an assigned administrator does **not** delete the associated complex or building. Instead, a Super Admin may reassign another administrator.

### Audit Timestamps

All entities include:

* `created_at`
* `updated_at`

Timestamps are stored using UTC for consistency across environments.

---

## API Design Patterns

### Consistent Response Structure

All API responses follow a standardized format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

Paginated responses include pagination metadata:

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {}
  }
}
```

This consistency simplifies frontend integration and error handling.

### Service Layer Architecture

Business logic is isolated from route handlers:

```text
Request
   ↓
Schema Validation
   ↓
Service Layer
   ↓
Database
   ↓
Response
```

This separation improves maintainability, testability, and code organization.

### Manual Validation

Custom validation functions were implemented instead of external libraries such as Marshmallow. For the scope of this assessment, this demonstrates understanding of validation concepts while minimizing dependencies.

### Pagination

All listing endpoints support pagination and return:

* Total records
* Total pages
* Current page
* Has next page
* Has previous page

This prevents excessive data transfer and supports efficient frontend rendering.

### Search Functionality

#### Admin Search

Case-insensitive searching across:

* First name
* Last name
* Email
* Phone number

#### Complex Search

Case-insensitive searching across:

* Name
* Address
* City

#### Building Search

Case-insensitive searching across:

* Name
* Address
* City

Search terms are split into individual words and matched using SQL `ILIKE`.

---

## Frontend Architecture

### Angular Signals

Angular Signals are used for component-level state management instead of `BehaviorSubject` where appropriate.

Benefits include:

* Simpler reactive code
* Improved readability
* Reduced boilerplate
* Better alignment with modern Angular practices

RxJS remains in use for asynchronous operations and HTTP handling.

### URL-Driven State

The following UI state is synchronized with URL query parameters:

* Search
* Filters
* Pagination
* Page size

Benefits include:

* Deep linking
* Bookmarkable views
* Browser navigation support
* Shareable URLs

### Standalone Components

All Angular components are implemented as standalone components with explicit imports, following Angular's recommended architecture and eliminating unnecessary `NgModule` overhead.

### Role-Based UI Rendering

User interface elements are conditionally rendered according to the authenticated user's role, ensuring users only see actions they are authorized to perform.

---

## Assumptions, Trade-offs & Limitations

### Assumptions

* Each residential complex must have exactly one `complex_admin`.
* Each building must have exactly one `building_admin`.
* A Complex Admin may manage multiple residential complexes.
* A Building Admin may manage multiple buildings.
* Building Admins can only modify buildings assigned to them.

### Trade-offs

* Refresh tokens were intentionally omitted for simplicity.
* JWT access tokens are long-lived and expire after 24 hours.

### Limitations

* No file or image upload functionality was implemented, as it was not specified in the requirements.

---

# Application Structure & Running Instructions

## Project Structure

```text
project/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   ├── admin.py
│   │   │   ├── complex.py
│   │   │   └── building.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── admin_schema.py
│   │   │   ├── complex_schema.py
│   │   │   └── building_schema.py
│   │   │
│   │   ├── services/
│   │   │   ├── admin_service.py
│   │   │   ├── auth_service.py
│   │   │   ├── complex_service.py
│   │   │   └── building_service.py
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.py
│   │   │   ├── admins.py
│   │   │   ├── complexes.py
│   │   │   └── buildings.py
│   │   │
│   │   ├── utils/
│   │   │   ├── decorators.py
│   │   │   ├── auth_helpers.py
│   │   │   └── response_helpers.py
│   │   │
│   │   ├── config.py
│   │   └── extensions.py
│   │
│   ├── run.py
│   └── requirements.txt
│
├── frontend/
│   └── src/app/
│       ├── core/
│       │   ├── models/
│       │   ├── services/
│       │   ├── guards/
│       │   └── interceptors/
│       │
│       ├── features/
│       │   ├── auth/
│       │   ├── dashboard/
│       │   ├── admins/
│       │   ├── complexes/
│       │   └── buildings/
│       │
│       └── shared/
│           └── components/
```

---

## Backend Architecture

The backend follows a three-layer architecture:

| Layer    | Responsibility                                 |
| -------- | ---------------------------------------------- |
| Routes   | Handle HTTP requests and responses             |
| Schemas  | Validate input structure and formats           |
| Services | Execute business logic and database operations |

### Request Flow

```text
HTTP Request
      ↓
Route Handler
      ↓
Schema Validation
      ↓
Service Layer
      ↓
Database
      ↓
JSON Response
```

---

## Frontend Architecture

The frontend follows Angular's recommended feature-based structure:

| Layer        | Responsibility                      |
| ------------ | ----------------------------------- |
| Models       | TypeScript interfaces and DTOs      |
| Services     | API communication                   |
| Guards       | Route authorization                 |
| Interceptors | JWT handling and error interception |
| Features     | Entity-specific functionality       |
| Shared       | Reusable UI components              |

---

# Running the Application

## Prerequisites

* Python 3.10+
* Node.js 18+
* npm
* MySQL 8.0+

---

## Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate environment (Linux / Mac)
source venv/bin/activate

# Activate environment (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Create Environment File

Create a `.env` file:

```env
DATABASE_URL=mysql+pymysql://user:password@localhost/db_name

SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret

JWT_EXPIRATION_HOURS=24

FLASK_ENV=development
FLASK_DEBUG=1

BCRYPT_LOG_ROUNDS=12
```

### Database Migration

```bash
flask --app run db init

flask --app run db migrate -m "Initial migration"

flask --app run db upgrade
```

### Seed Initial Data

```bash
flask --app run seed
```

### Start Backend

```bash
python run.py
```

Backend URL:

```text
http://localhost:5000
```

---

## Frontend Setup

```bash
cd frontend

npm install
```

### Configure Environment

Update:

```text
src/environments/environment.ts
```

```ts
export const environment = {
  apiUrl: 'http://localhost:5000'
};
```

### Start Angular Application

```bash
ng serve
```

Frontend URL:

```text
http://localhost:4200
```

---

## Default Credentials

| Email                                       | Password  | Role        |
| ------------------------------------------- | --------- | ----------- |
| [admin@system.com](mailto:admin@system.com) | Admin123! | super_admin |

---

## Postman Collection

A Postman collection is included with the submission and contains:

* Authentication endpoints
* Admin management endpoints
* Residential complex endpoints
* Building management endpoints

The collection can be imported directly into Postman for API testing and validation.
