# Acharya ERP Authentication Module

## Complete Architecture & Technical Documentation

---

## 📋 Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture Overview](#2-system-architecture-overview)
3. [Technology Stack](#3-technology-stack)
4. [Database Design](#4-database-design)
5. [Authentication Endpoints](#5-authentication-endpoints)
6. [User Login Flow](#6-user-login-flow)
7. [Protected API Access Flow](#7-protected-api-access-flow)
8. [Public API Access Flow](#8-public-api-access-flow)
9. [Forgot Password Flow](#9-forgot-password-flow)
10. [Reset Password Flow](#10-reset-password-flow)
11. [Password Security Policy](#11-password-security-policy-recommanded)
12. [Rate Limiting Strategy](#12-rate-limiting-strategy)
13. [WhatsApp Fallback Communication Strategy](#13-whatsapp-fallback-communication-strategy-proposed)
14. [Error Handling & Response Codes](#14-error-handling--response-codes)
15. [Security Audit](#15-audit-event-categories)
16. [Critical Vulnerabilities Discovered in Production Systems](#16-critical-vulnerabilities-discovered-in-production-systems)

---

## 1. Executive Summary

The Acharya ERP System implements a JWT-based authentication and authorization system with rate limiting capabilities. This documentation provides detailed analysis of the authentication architecture, component interactions, and security flows.

---

## 2. System Architecture Overview

### 2.1 High-Level System Architecture

```mermaid
graph TD
    %% Client Layer
    subgraph "Client Layer"
        WEB["React Web App"]
        MOBILE["React/Flutter Mobile App"]
    end

    %% Security Filters Layer
    subgraph "Security Filters Layer"
        CORS["CORS Filter - Cross-Origin Resource Sharing - Validates request origins - Prevents malicious attacks"]
        RATE["Rate Limiter - Bucket4j Implementation - Per-endpoint limiting - Per-user limiting - DDoS prevention"]
        JWT["JWT Filter - Token Validation - Stateless authentication - Session management"]
    end

    %% Authentication Services
    subgraph "Authentication Services"
        AUTH_EP["Authentication Manager"]
        USER_SVC["User Details Service - User Information Retrieval"]
        PWD_ENC["BCrypt Password Encoder - Secure Password Hashing"]
        JWT_UTILS["JWT Utils - Token Generation & Validation"]
    end

    %% Controller Layer
    subgraph "Controller Layer"
        CONTROLLER["Controllers - REST API Endpoints - HTTP Request/Response Handling"]
    end

    %% Service Layer
    subgraph "Service Layer"
        SERVICE["Business Services - Business Logic - Transaction Management - Validation & Processing"]
    end

    %% Repository Layer
    subgraph "Repository Layer"
        REPOSITORY["Repository Layer - Data Access Objects - JPA Repositories - Database Operations"]
    end

    %% Data Layer
    subgraph "Data Layer"
        DATABASE["MySQL Database - User Data Storage"]
    end

    %% External Services
    subgraph "External Services"
        WHATSAPP["WhatsApp Business API - Password Reset - Notifications"]
    end

    %% Main Request Flow
    WEB --> CORS
    MOBILE --> CORS
    CORS --> RATE
    RATE --> JWT
    JWT --> AUTH_EP
    AUTH_EP --> CONTROLLER
    CONTROLLER --> SERVICE
    SERVICE --> REPOSITORY
    REPOSITORY --> DATABASE

    %% Service Dependencies
    AUTH_EP --> USER_SVC
    AUTH_EP --> PWD_ENC
    AUTH_EP --> JWT_UTILS

    %% Data Connections
    USER_SVC --> DATABASE

    %% External Service Connections (from Authentication Services)
    AUTH_EP --> WHATSAPP

    %% Security Layer Annotations
    classDef clientLayer fill:#e1f5fe
    classDef securityLayer fill:#fff3e0
    classDef authLayer fill:#f3e5f5
    classDef controllerLayer fill:#e8f5e8
    classDef serviceLayer fill:#f1f8e9
    classDef repositoryLayer fill:#e0f2f1
    classDef dataLayer fill:#fff8e1
    classDef externalLayer fill:#fce4ec

    class WEB,MOBILE clientLayer
    class CORS,RATE,JWT securityLayer
    class AUTH_EP,USER_SVC,PWD_ENC,JWT_UTILS authLayer
    class CONTROLLER controllerLayer
    class SERVICE serviceLayer
    class REPOSITORY repositoryLayer
    class DATABASE dataLayer
    class WHATSAPP externalLayer
```

---

# 2.2 System Architecture Explanation

## 2.2.1 Client Layer

### 2.2.1.1 React Web App

**Purpose**: Front-end web application built with React framework

**Responsibilities**:

- User interface rendering and interaction
- Client-side state management
- API communication with backend services
- Form validation and user input handling

**Technology**: React.js, HTML5, CSS3, JavaScript, MaterialUI

---

### 2.2.1.2 React/Flutter Mobile App

**Purpose**: Mobile application for iOS and Android platforms

**Responsibilities**:

- Native mobile user experience
- Device-specific features integration (camera, GPS, notifications)
- Offline functionality and data synchronization
- Cross-platform compatibility

**Technology**: React Native or Flutter framework

---

## 2.2.2 Security Filters Layer

### 2.2.2.1 CORS Filter (Cross-Origin Resource Sharing)

**Purpose**: Controls which domains can access your API

**Responsibilities**:

- Validates request origins against allowed domains
- Prevents unauthorized cross-origin requests
- Protects against CSRF attacks
- Manages preflight requests for complex HTTP methods

**Implementation**: Spring Security CORS configuration

> **Current State**: **_Allows access from any domain (wildcard \*)_**
>
> **Recommended**: **_Restrict access to acharyerp.acharyaerptech.in only._**

---

### 2.2.2.2 Rate Limiter (Bucket4j Implementation)

**Purpose**: Prevents API abuse and ensures fair usage

**Responsibilities**:

- Per-endpoint request limiting (e.g., 1000 requests/minute per endpoint)
- Per-user request limiting (e.g., 1000 requests/minute per user)
- DDoS attack prevention
- Graceful degradation under high load

**Technology**: Bucket4j library with In-memory storage

> **Current State**:
>
> - **_10,000 requests per minute = 166 requests per second._**
> - **_No user-specific limits_**
> - **_No IP-based protection_**
> - **_Allows potential abuse and DDoS attack_**
>
> **Recommended**: **_Implement user-based and IP-based rate limiting with endpoint-specific restrictions._**  
> **_[Explain Here](#12-rate-limiting-strategy)_**

---

### 2.2.2.3 JWT Filter (JSON Web Token)

**Purpose**: Stateless authentication and authorization

**Responsibilities**:

- Token validation on each request
- Extracting user information from tokens
- Session management without server-side storage
- Automatic token refresh handling

**Implementation**: Spring Security JWT filter chain

---

## 2.2.3 Authentication Services

### 2.2.3.1 AuthenticationManager

**Purpose**: Central authentication orchestrator

**Responsibilities**:

- Coordinates authentication flow
- Manages authentication strategies (login, OAuth, etc.)
- Handles authentication failures and redirects
- Integrates with external authentication providers

**Implementation**: Spring Security AuthenticationManager

---

### 2.2.3.2 User Details Service

**Purpose**: User information retrieval and management

**Responsibilities**:

- Loading user details from database
- User role and permission management
- User profile information retrieval
- Integration with Spring Security UserDetailsService

**Implementation**: Custom UserDetailsService implementation

---

### 2.2.3.3 BCrypt Password Encoder

**Purpose**: Secure password hashing and verification

**Responsibilities**:

- Password encryption using BCrypt algorithm
- Salt generation for enhanced security
- Password verification during authentication
- Protection against rainbow table attacks

**Implementation**:

- Spring Security BCryptPasswordEncoder
- Default password detection ("acharya1234")
- Forced password change for default passwords
- Password reset via Whatsapp

> **Current State**: **_BCrypt password encoder: 10 rounds (default)_**
>
> **Recommended**: **_Production: 12-14 rounds for enhanced security._**

---

### 2.2.3.4 JWT Utils

**Purpose**: Token generation and validation utilities

**Responsibilities**:

- JWT token creation with user claims
- Token signature verification
- Token expiration handling
- HS512 signature algorithm
- Refresh token management

**Implementation**: Custom JWT utility class with JJWT library

> **Current State**:
>
> - **_Token Validity is 100 hours for all users._**
> - **_Risk: Extended exposure if compromised_**
>
> **Recommended**: **_Shorter tokens with refresh mechanism._**

---

### 2.2.3.5 Json Web Token Structure

```json
{
  "header": {
    "alg": "HS512",
    "typ": "JWT"
  },
  "payload": {
    "userId": 1,
    "userName": "admin",
    "userType": "Staff",
    "iat": 1703097600,
    "exp": 1703457600
  },
  "signature": "encrypted_signature"
}
```

---

## 2.2.4 Controller Layer

**Purpose**: REST API endpoint definitions and HTTP handling

**Responsibilities**:

- HTTP request mapping and routing
- Request/response data transformation
- Input validation and sanitization
- Exception handling and error responses
- API documentation (Swagger/OpenAPI)

**Implementation**: Spring Boot @RestController annotated classes

---

## 2.2.5 Service Layer

**Purpose**: Core business logic implementation

**Responsibilities**:

- Business rule enforcement
- Transaction management (@Transactional)
- Data validation and processing
- Complex business operations coordination
- Integration with external services

**Implementation**: Spring @Service annotated classes

---

## 2.2.6 Repository Layer

**Purpose**: Data access abstraction and database operations

**Responsibilities**:

- CRUD operations (Create, Read, Update, Delete)
- Custom query implementations
- Data mapping between entities and DTOs
- Database transaction management
- Connection pooling and optimization

**Implementation**: Spring Data JPA repositories

---

## 2.2.7 Data Layer (MySQL Database)

**Purpose**: Persistent data storage

**Responsibilities**:

- User data storage (profiles, preferences, history)
- Application data persistence
- Data integrity and consistency
- Backup and recovery
- Performance optimization (indexing, query optimization)

**Technology**: MySQL RDBMS with InnoDB storage engine

---

## 2.2.8 External Services

### 2.2.8.1 WhatsApp Business API

**Purpose**: Communication and notification service

**Responsibilities**:

- Password reset notifications
- User verification messages
- Alert and reminder notifications
- Two-factor authentication (2FA) message delivery

**Integration**: HTTP API calls to WhatsApp Business API

---

# 2.3. Architecture Benefits

## 2.3.1 Security

- **Multi-layered security**: CORS, Rate Limiting, and JWT provide comprehensive protection
- **Stateless authentication**: JWT tokens eliminate server-side session storage
- **Secure password handling**: BCrypt ensures passwords are never stored in plain text

## 2.3.2 Scalability

- **Horizontal scaling**: Stateless design allows easy horizontal scaling
- **Database optimization**: Repository pattern abstracts database operations
- **Caching capabilities**: Rate limiter can be extended for caching

## 2.3.3 Maintainability

- **Separation of concerns**: Each layer has distinct responsibilities
- **Dependency injection**: Spring framework manages component dependencies
- **Modular design**: Components can be modified independently

## 2.3.4 Performance

- **Connection pooling**: Database connections are efficiently managed
- **Caching strategies**: Multiple levels of caching can be implemented
- **Asynchronous processing**: External service calls can be made asynchronously

---

# 2.4 Request Flow Summary

1. **Client** sends HTTP request
2. **CORS Filter** validates request origin
3. **Rate Limiter** checks request limits
4. **JWT Filter** validates authentication token
5. **Authentication Manager** processes authentication
6. **Controller** handles HTTP request/response
7. **Service** executes business logic
8. **Repository** performs data operations
9. **Database** stores/retrieves data
10. **External Services** handle notifications/communications

---

# 3. Technology Stack

- **Framework**: Spring Boot 2.7+
- **Security**: Spring Security + JWT
- **Database**: MySQL 8.0+
- **Rate Limiting**: Bucket4j
- **Password Encryption**: BCrypt
- **Communication**: WhatsApp Business API
- **Build Tool**: Maven
- **Java Version**: 17+

---

# 4. Database Design

## 4.1 Entity Relationship Diagram

### Current Schema

```mermaid
erDiagram
    USER_DETAILS {
        int id PK
        bit active
        int created_by
        datetime created_date
        varchar created_username
        varchar email
        int modified_by
        datetime modified_date
        varchar modified_username
        varchar password
        datetime reset_password_time
        varchar reset_password_token
        varchar usercode UK
        varchar username UK
        varchar usertype
        bit is_lms_auditor
        bit guest_type
        varchar book_chapter_approver_designation
    }

    USER_ROLE {
        int user_role_id PK
        bit active
        int created_by
        datetime created_date
        varchar created_username
        int id
        int modified_by
        datetime modified_date
        varchar modified_username
        int role_id
    }

    %% Logical Relationships (Not defined in actual database schema)
    USER_DETAILS ||--o{ USER_ROLE : "has_multiple_roles"
```

#### Important Notes

> **⚠️ Current Schema Limitations**
>
> - No formal foreign key relationships are defined in the actual table schema
> - The relationship shown above represents logical connection only
> - `USER_ROLE.id` field logically references `USER_DETAILS.id` but no database constraints enforce this relationship

---

## 4.2 Proposed Design

### Enhanced Entity Relationship Diagram

```mermaid
erDiagram
    USERS {
        bigint id PK
        varchar username UK
        varchar email UK
        varchar password
        varchar phone_number
        boolean is_active
        timestamp created_at
        varchar created_by
        timestamp modified_at
        varchar modified_by
        varchar last_login_ip
        timestamp last_login_at
        int failed_login_attempts
        timestamp locked_until
    }

    PASSWORD_RESET_TOKENS {
        bigint id PK
        bigint user_id FK
        varchar token
        timestamp expires_at
        boolean is_used
        varchar reset_ip
        timestamp created_at
        varchar created_by
    }

    AUDIT_TRAIL {
        bigint id PK
        varchar entity_name
        bigint entity_id
        varchar action
        json old_values
        json new_values
        bigint user_id FK
        timestamp timestamp
        varchar ip_address
        text user_agent
        varchar session_id
    }

    USER_ROLES {
        bigint id PK
        bigint user_id FK
        varchar role_name
        timestamp assigned_at
        varchar assigned_by
        boolean is_active
    }

    LOGIN_ATTEMPTS {
        bigint id PK
        varchar username
        varchar ip_address
        boolean success
        varchar failure_reason
        timestamp attempt_time
        text user_agent
    }

    USERS ||--o{ PASSWORD_RESET_TOKENS : "can_have"
    USERS ||--o{ AUDIT_TRAIL : "performs"
    USERS ||--o{ USER_ROLES : "has"
    USERS ||--o{ LOGIN_ATTEMPTS : "makes"
```

---

## 4.3 Database Schema Details

### 4.3.1 Users Table

**Core user information and authentication data**

```sql
CREATE TABLE USERS (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    modified_by VARCHAR(100),
    last_login_ip VARCHAR(45),
    last_login_at TIMESTAMP NULL,
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP NULL,

    -- Performance Indexes
    INDEX idx_users_username (username),
    INDEX idx_users_email (email),
    INDEX idx_users_active (is_active),
    INDEX idx_users_last_login (last_login_at)
);
```

### 4.3.2 Password Reset Tokens Table

**Secure password reset mechanism with expiration and tracking**

```sql
CREATE TABLE PASSWORD_RESET_TOKENS (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    reset_ip VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),

    -- Referential Integrity
    FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE,

    -- Performance Indexes
    INDEX idx_password_reset_token (token),
    INDEX idx_password_reset_user_id (user_id),
    INDEX idx_password_reset_expires (expires_at),
    INDEX idx_password_reset_used (is_used)
);
```

### 4.3.3 User Roles Table

**Role assignment and management with audit trail**

```sql
CREATE TABLE USER_ROLES (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    role_name VARCHAR(100) NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,

    -- Referential Integrity
    FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE,

    -- Business Logic Constraints
    UNIQUE KEY uk_user_role_active (user_id, role_name, is_active),

    -- Performance Indexes
    INDEX idx_user_roles_user_id (user_id),
    INDEX idx_user_roles_role_name (role_name),
    INDEX idx_user_roles_active (is_active),
    INDEX idx_user_roles_assigned_at (assigned_at)
);
```

### 4.3.4 Login Attempts Table

**Comprehensive authentication monitoring and security analysis**

```sql
CREATE TABLE LOGIN_ATTEMPTS (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100),
    ip_address VARCHAR(45),
    success BOOLEAN,
    failure_reason VARCHAR(255),
    attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,

    -- Security & Performance Indexes
    INDEX idx_login_attempts_username (username),
    INDEX idx_login_attempts_ip (ip_address),
    INDEX idx_login_attempts_time (attempt_time),
    INDEX idx_login_attempts_success (success),
    INDEX idx_login_attempts_username_time (username, attempt_time),
    INDEX idx_login_attempts_ip_time (ip_address, attempt_time)
);
```

### 4.3.5 Audit Trail Table

**Complete system activity logging for compliance and forensics**

```sql
CREATE TABLE AUDIT_TRAIL (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    entity_name VARCHAR(100) NOT NULL,
    entity_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_values JSON,
    new_values JSON,
    user_id BIGINT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    session_id VARCHAR(255),

    -- Referential Integrity (nullable for system actions)
    FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE SET NULL,

    -- Audit & Performance Indexes
    INDEX idx_audit_trail_entity (entity_name, entity_id),
    INDEX idx_audit_trail_user_id (user_id),
    INDEX idx_audit_trail_timestamp (timestamp),
    INDEX idx_audit_trail_action (action),
    INDEX idx_audit_trail_session (session_id),
    INDEX idx_audit_trail_entity_time (entity_name, timestamp)
);
```

### 4.3.6 Database Automation

**Triggers and events for data consistency and maintenance**

```sql
-- Automatic timestamp updates
DELIMITER //
CREATE TRIGGER tr_users_modified_at
    BEFORE UPDATE ON USERS
    FOR EACH ROW
BEGIN
    SET NEW.modified_at = CURRENT_TIMESTAMP;
END//
DELIMITER ;

-- Automatic cleanup of expired tokens
DELIMITER //
CREATE EVENT ev_cleanup_expired_tokens
ON SCHEDULE EVERY 1 HOUR
DO
BEGIN
    DELETE FROM PASSWORD_RESET_TOKENS
    WHERE expires_at < NOW() AND is_used = TRUE;
END//
DELIMITER ;
```

---

## 4.4 Key Benefits and Improvements

### 🔐 4.4.1 Security Improvements

#### Password Security

- **Token-based reset**: Secure, expiring tokens replace simple password reset mechanisms
- **IP tracking**: Monitor reset requests for abuse detection and forensic analysis
- **Single-use tokens**: Prevent replay attacks with comprehensive `is_used` flag tracking

#### Account Protection

- **Brute force protection**: Failed attempt tracking with intelligent account lockout mechanisms
- **Login monitoring**: Comprehensive tracking of all authentication attempts with detailed logging
- **IP-based analysis**: Advanced pattern recognition for identifying suspicious login behaviors

#### Authentication Enhancement

- **Last login tracking**: Users receive visibility into their most recent successful authentication
- **Session management**: Robust tracking of active user sessions with unique session identifiers
- **Device fingerprinting**: User agent analysis for enhanced security profiling and threat detection

### 🛡️ 4.4.2 Data Integrity

#### Proper Relationships

- **Foreign key constraints**: Database-enforced referential integrity across all related entities
- **Cascade protection**: Intelligent handling of record deletion to prevent orphaned data
- **Data consistency**: Guaranteed relationship validity through proper constraint implementation

#### Optimized Data Types

- **BIGINT IDs**: Scalable primary key architecture supporting large-scale enterprise datasets
- **Boolean flags**: Clear, unambiguous true/false states replacing ambiguous bit field implementations
- **Timestamp precision**: High-accuracy temporal tracking for comprehensive audit capabilities
- **JSON flexibility**: Structured audit data storage enabling schema evolution without migration overhead

### 📊 4.4.3 Audit & Compliance

#### Complete Audit Trail

- **Before/after values**: Comprehensive JSON capture of all data state changes
- **User attribution**: Every system action definitively tied to specific user accounts
- **Forensic capability**: Full IP address, timestamp, and session tracking for incident investigation
- **Entity-level tracking**: Granular monitoring of changes across all system entities and operations

#### Regulatory Compliance

- **GDPR ready**: Complete data processing audit trail supporting privacy regulation compliance
- **SOX compliance**: Financial data access tracking meeting Sarbanes-Oxley audit requirements
- **Security standards**: Architecture meeting modern enterprise security audit and compliance standards

### ⚡ 4.4.4 Operational Benefits

#### Monitoring & Analytics

- **Login patterns**: Deep analysis of user behavior patterns and system access trends
- **Security insights**: Proactive threat identification through comprehensive failed login analysis
- **Usage metrics**: Detailed system utilization tracking and user engagement measurement
- **Incident response**: Rapid security incident investigation with comprehensive detailed logging

#### Performance Optimization

- **Separate audit tables**: Core business operations remain unaffected by audit logging overhead
- **Strategic indexing**: Optimized query performance through proper foreign key and index implementation
- **Partitioning ready**: Architecture supporting time-based partitioning for large-scale audit data management
- **Archiving support**: Historical data management capabilities without referential integrity loss

### 👥 4.4.5 User Experience

#### Enhanced Security UX

- **Clear feedback**: Specific, actionable failure reason communication for authentication attempts
- **Account status**: Transparent user communication regarding lockout status and duration
- **Login history**: User-accessible review of recent account access patterns and activities

#### Simplified Management

- **Role clarity**: Direct role name storage enabling quick identification and management
- **Assignment tracking**: Complete audit trail of role assignment changes and modifications
- **Active status**: Streamlined enable/disable functionality for user roles and account management

---

## 5. Authentication Endpoints

| Endpoint                       | Method | Query String | Request Body                                 | Purpose                     | Platforms |
| ------------------------------ | ------ | ------------ | -------------------------------------------- | --------------------------- | --------- |
| `/api/authenticate`            | POST   | -            | `{"username":"admin","password":"password"}` | User login                  | All       |
| `/api/forgotPasswordWhatsapp`  | POST   | `username=`  | -                                            | Password reset request      | All       |
| `/api/resetPassword`           | PUT    | -            | `{"token":"2323","password":"new password"}` | Password reset confirmation | All       |
| `/api/UserAuthentication`      | GET    | -            | -                                            | List users                  | All       |
| `/api/UserAuthentication/{id}` | GET    | -            | -                                            | Get user details            | All       |

---

### 6. User Login Flow

**Request:**

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "username": "admin",
  "password": "password"
}
```

**Response (Success):**

```http
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{
  "success": true,
  "status": 200,
  "data": {
    "userName": "admin",
    "userType": "staff",
    "userId": 1,
    "role": "Super Admin",
    "adpStatus": null,
    "book_chapter_approver_designation": null,
    "token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ7XCJ1c2VyVHlwZVwiOlwic3RhZmZcIixcInVzZXJOYW1lXCI6XCJBbWFkbWluXCIsXCJ1c2VySWRcIjoxfSIsInVzZXJUeXBlIjoic3RhZmYiLCJ1c2VyTmFtZSI6IkFtYWRtaW4iLCJleHAiOjE3NTAzNDMwODUsInVzZXJJZCI6MSwiaWF0IjoxNzQ5OTgzMDg1fQ.FBHXw6CYqvkrz1W2pTLbHHPsQRmF1y7DoHkpGdaLvf2Cl0giGE65vdxNmWJ2TuVwnuXqs1K3S_h9c8S0TvA2kg"
  }
}
```

```mermaid
sequenceDiagram
    participant C as Client
    participant CORS as CORS Filter
    participant RL as Rate Limiter
    participant JF as JWT Filter
    participant AC as Auth Controller
    participant AM as Authentication Manager
    participant UDS as User Details Service
    participant UAR as User Auth Repository
    participant PE as Password Encoder
    participant JTU as JWT Token Util
    participant DB as Database

    C->>CORS: POST /api/authenticate {username, password}
    CORS->>CORS: Check CORS headers
    CORS->>RL: Forward request
    RL->>RL: checkRateLimit(clientIP, username)

    alt Rate limit exceeded
        RL-->>CORS: 429 TOO_MANY_REQUESTS (Rate limit exceeded)
        CORS-->>C: 429 TOO_MANY_REQUESTS (Rate limit exceeded)
    else Rate limit OK
        RL->>JF: Forward request
        JF->>JF: Check if authentication endpoint
        Note over JF: Skip JWT validation for /api/authenticate
        JF->>AC: Forward to Auth Controller
        AC->>UAR: findByUsernameCaseSensitive(username)
        UAR->>DB: SELECT user by username
        DB-->>UAR: User record
        UAR-->>AC: UserAuthentication object
        AC->>UDS: loadUserByUsername(username)
        UDS-->>AC: UserDetails with authorities
        AC->>PE: matches(password, hashedPassword)
        PE-->>AC: Password validation result

        alt Password is default "acharya1234"
            AC->>RL: recordFailedAttempt(clientIP, username)
            AC->>JF: Response: 406 NOT_ACCEPTABLE
            JF->>CORS: Response: 406 NOT_ACCEPTABLE
            CORS-->>C: 406 NOT_ACCEPTABLE (Force password change)
        else Password validation successful
            AC->>AM: authenticate(username, password)
            AM-->>AC: Authentication successful
            AC->>JTU: generateToken(userDetails, user)
            JTU-->>AC: JWT token
            AC->>RL: recordSuccessfulAttempt(clientIP, username)
            AC->>JF: Response: 200 OK {token, userInfo, role}
            JF->>CORS: Response: 200 OK {token, userInfo, role}
            CORS-->>C: 200 OK {token, userInfo, role}
        else Authentication failed
            AC->>RL: recordFailedAttempt(clientIP, username)
            AC->>JF: Response: 401 UNAUTHORIZED
            JF->>CORS: Response: 401 UNAUTHORIZED
            CORS-->>C: 401 UNAUTHORIZED {error message}
        end
    end
```

### 6.1 Flow Details

1. **Request Initiation**: Client application sends POST request to /api/authenticate with user credentials

```json
{
  "username": "admin",
  "password": "password"
}
```

2. **CORS Validation**: Checks origin and headers
3. **Rate Limiting**: Validates request frequency
4. **Authentication Processing**:

   - User lookup in database
   - Password verification using secure hashing
   - JWT token generation

5. **Response**: JWT token or error message

---

## 7 Protected API Access Flow

**Request:**

```http
POST /api/findRoles/1
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ7XCJ1c2VyVHlwZVwiOlwic3RhZmZcIixcInVzZXJOYW1lXCI6XCJBbWFkbWluXCIsXCJ1c2VySWRcIjoxfSIsInVzZXJUeXBlIjoic3RhZmYiLCJ1c2VyTmFtZSI6IkFtYWRtaW4iLCJleHAiOjE3NTAzNDMwODUsInVzZXJJZCI6MSwiaWF0IjoxNzQ5OTgzMDg1fQ.FBHXw6CYqvkrz1W2pTLbHHPsQRmF1y7DoHkpGdaLvf2Cl0giGE65vdxNmWJ2TuVwnuXqs1K3S_h9c8S0TvA2kg
```

**Response (Success):**

```http
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{
  "success": true,
  "status": 200,
  "data": [
    {
      "role_name": "Super Admin",
      "role_short_name": "SAA",
      "user_role_id": 1,
      "usertype": "staff",
      "role_id": 1
    }
  ]
}
```

```mermaid
sequenceDiagram
    participant C as Client
    participant CORS as CORS Filter
    participant RL as Rate Limiter
    participant JRF as JWT Request Filter
    participant JTU as JWT Token Util
    participant UDS as User Details Service
    participant SC as Security Context
    participant UC as User Controller
    participant US as User Service

    C->>CORS: GET /api/protected (Bearer token)
    CORS->>CORS: Check CORS headers
    CORS->>RL: Forward request
    RL->>RL: checkRateLimit(clientIP, endpoint)

    alt Rate limit exceeded
        RL-->>CORS: 429 TOO_MANY_REQUESTS (Rate limit exceeded)
        CORS-->>C: 429 TOO_MANY_REQUESTS (Rate limit exceeded)
    else Rate limit OK
        RL->>JRF: Forward request
        JRF->>JRF: Extract token from header

        alt Token present and valid format
            JRF->>JTU: getUsernameFromToken(token)
            JTU-->>JRF: Username from claims
            JRF->>UDS: loadUserByUsername(username)
            UDS-->>JRF: UserDetails object
            JRF->>JTU: validateToken(token, userDetails)
            JTU-->>JRF: Token validation result

            alt Token valid
                JRF->>SC: Set authentication context
                JRF->>RL: recordSuccessfulRequest(clientIP, endpoint)
                JRF->>UC: Forward to controller
                UC->>US: Execute business logic
                US-->>UC: Response data
                UC->>JRF: 200 OK {data}
                JRF->>CORS: 200 OK {data}
                CORS-->>C: 200 OK {data}
            else Token invalid
                JRF->>RL: recordFailedRequest(clientIP, endpoint)
                JRF->>CORS: 401 UNAUTHORIZED
                CORS-->>C: 401 UNAUTHORIZED
            end
        else No token or invalid format
            JRF->>RL: recordFailedRequest(clientIP, endpoint)
            JRF->>CORS: 401 UNAUTHORIZED
            CORS-->>C: 401 UNAUTHORIZED
        end
    end
```

### 7.1 Flow Details

1. **Request Initiation**: Client sends request to protected endpoint with JWT Bearer token
2. **CORS Validation**: Checks origin and headers
3. **Rate Limiting**: Validates request frequency per client IP and endpoint
4. **Token Processing**:

   - Extract Bearer token from Authorization header
   - Validate JWT structure and signature
   - Extract username from token claims

5. **User Authentication**:

   - Load user details from database
   - Validate token against user context
   - Set security context for authenticated user

6. **Authorization Decision**: Grant access for valid tokens or return 401 for invalid/missing tokens
7. **Business Logic**: Execute controller and service layer operations with authenticated context
8. **Response**: Return requested data or error message with appropriate HTTP status

---

## 8. Public API Access Flow

**Request:**

```http
GET /api/health
Content-Type: application/json
```

**Response (Success):**

```http
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{
  "success": true,
  "status": 200,
  "data": "Status is UP"
}
```

```mermaid
sequenceDiagram
participant C as Client
participant CORS as CORS Filter
participant RL as Rate Limiter
participant JRF as JWT Request Filter
participant PC as Public Controller
participant PS as Public Service
participant DB as Database

    C->>CORS: GET /api/health
    CORS->>CORS: Check CORS headers
    CORS->>RL: Forward request
    RL->>RL: checkRateLimit(clientIP, endpoint)

    alt Rate limit exceeded
        RL-->>CORS: 429 TOO_MANY_REQUESTS (Rate limit exceeded)
        CORS-->>C: 429 TOO_MANY_REQUESTS (Rate limit exceeded)
    else Rate limit OK
        RL->>JRF: Forward request
        JRF->>JRF: Check if endpoint requires authentication
        Note over JRF: Skip JWT validation for public endpoints
        JRF->>PC: Forward to Public Controller
        PC->>PS: Execute business logic

        alt Database operation required
            PS->>DB: Query data
            DB-->>PS: Response data
        end

        PS-->>PC: Response data
        PC->>JRF: 200 OK {data}
        JRF->>RL: recordSuccessfulRequest(clientIP, endpoint)
        JRF->>CORS: 200 OK {data}
        CORS-->>C: 200 OK {data}
    end

```

### 8.1 Flow Details

1. **Request Initiation**: Client sends request to public endpoint without JWT Bearer token
2. **CORS Validation**: Checks origin and headers
3. **Rate Limiting** - Still applies to prevent abuse of public endpoints, <b><u>but not all public endpoints have rate limiting enabled in the existing project</u></b>.
4. **JWT Filter Bypass** - The JWT Request Filter recognizes public endpoints and skips token validation
5. **Direct Controller Access** - Request flows directly to the public controller
6. **Optional Database Operations** - Shows conditional database access for endpoints that need it

#### Common Non-Protected Endpoints:

1. /api/api/health - Health check
2. /api/state - Application version
3. /api/swagger-ui.html - API documentation
4. /api/authenticate - Authentication endpoint
5. /api/resetPassword - Reset Password endpoint

---

### 9. Forgot Password Flow

**Request:**

```http
POST /api/forgotPasswordWhatsapp?username=admin
```

**Response (Success):**

```http
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{
  "success": true,
  "status": 200,
  "data": "otp sent successfully to: 1234567890"
}
```

```mermaid
sequenceDiagram
    participant Client
    participant CORSFilter
    participant RateLimiter
    participant JWTFilter
    participant AuthController
    participant AuthService
    participant UserRepository
    participant WhatsAppService
    participant Database

    Note over Client, Database: Forgot Password WhatsApp Flow

    Client->>CORSFilter: POST /api/forgotPasswordWhatsapp?username=admin
    CORSFilter->>CORSFilter: validateOrigin()

    alt CORS validation failed
        CORSFilter-->>Client: 403 Forbidden (CORS Error)
    else CORS validation passed
        CORSFilter->>RateLimiter: Forward request
        RateLimiter->>RateLimiter: checkRateLimit(clientIP, "FORGOT_PASSWORD")

        alt Rate limit exceeded
            RateLimiter-->>Client: 429 Too Many Requests
        else Within rate limit
            RateLimiter->>JWTFilter: Forward request
            JWTFilter->>JWTFilter: checkIfPublicEndpoint("/api/forgotPasswordWhatsapp")
            Note over JWTFilter: Skip JWT validation - Public API
            JWTFilter->>AuthController: Forward request

            AuthController->>AuthController: extractUsername("admin")
            AuthController->>AuthService: forgotPasswordWhatsapp(username)
            AuthService->>UserRepository: findByUsername("admin")

            alt User not found
                UserRepository-->>AuthService: null
                AuthService-->>AuthController: Success response
                AuthController-->>Client: 200 OK "Reset token sent"
            else User found
                UserRepository-->>AuthService: User object
                AuthService->>AuthService: generateResetToken()
                AuthService->>UserRepository: saveResetToken(token, userId, expiresAt)
                UserRepository->>Database: UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?
                Database-->>UserRepository: Token saved
                UserRepository-->>AuthService: Token saved confirmation

                AuthService->>WhatsAppService: sendResetToken(user.phoneNumber, token)
                WhatsAppService->>WhatsAppService: formatMessage(token)
                WhatsAppService-->>AuthService: WhatsApp message sent
                AuthService-->>AuthController: Success response
                AuthController-->>Client: 200 OK "Reset token sent via WhatsApp"
            end
        end
    end
```

#### 9.1 Flow Details

1. **Request Initiation**: Client sends POST request to /api/forgotPasswordWhatsapp?username=admin without JWT Bearer token
2. **CORS Validation**: CORS Filter validates request origin and headers against allowed domains
3. **Rate Limiting**: Validates request frequency per client IP and endpoint.
4. **JWT Filter Bypass**: The JWT Request Filter recognizes /api/forgotPasswordWhatsapp as a public endpoint and skips token validation
5. **Controller Processing**: Request flows directly to AuthController which extracts username from query parameter
6. **Service Layer Processing**: AuthController delegates to AuthService for business logic execution
7. **User Lookup**: AuthService queries UserRepository to find user by username
8. **Token Generation**: If user exists, generates 6 digits reset token between [10000-900000]
9. **Database Storage**: Stores reset token with expiration timestamp in password_reset_tokens table
10. **WhatsApp Integration**: Sends reset token to user's registered phone number via WhatsApp Business API
11. **Response**: Returns 200 OK with success message "Reset token sent via WhatsApp"

---

## 10. Reset Password Flow

**Request:**

```http
POST /api/resetPassword
Content-Type: application/json
```

```json
{
  "token": "123456",
  "password": "new password"
}
```

**Response (Success):**

```http
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{
  "success": true,
  "status": 200,
  "data": {
    "message": "password reset Successfully !!"
  }
}
```

```mermaid
sequenceDiagram
    participant Client
    participant CORSFilter
    participant RateLimiter
    participant JWTFilter
    participant AuthController
    participant AuthService
    participant UserRepository
    participant Database

    Note over Client, Database: Reset Password Flow

    Client->>CORSFilter: POST /api/resetPassword {"token":"2323","password":"new password"}
    CORSFilter->>CORSFilter: validateOrigin()

    alt CORS validation failed
        CORSFilter-->>Client: 403 Forbidden (CORS Error)
    else CORS validation passed
        CORSFilter->>RateLimiter: Forward request
        RateLimiter->>RateLimiter: checkRateLimit(clientIP, "RESET_PASSWORD")

        alt Rate limit exceeded
            RateLimiter-->>Client: 429 Too Many Requests
        else Within rate limit
            RateLimiter->>JWTFilter: Forward request
            JWTFilter->>JWTFilter: checkIfPublicEndpoint("/api/resetPassword")
            Note over JWTFilter: Skip JWT validation - Public API
            JWTFilter->>AuthController: Forward request

            AuthController->>AuthService: resetPassword(token, newPassword)
            AuthService->>UserRepository: findByResetToken(token)
            UserRepository->>Database: SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW() AND (NOW() - reset_token_created) < INTERVAL 2 MINUTE

            alt Token not found, expired, or older than 2 minutes
                Database-->>UserRepository: No records
                UserRepository-->>AuthService: null
                AuthService-->>AuthController: InvalidTokenException
                AuthController-->>Client: 400 Bad Request "Invalid or expired token"
            else Valid token within 2 minutes
                Database-->>UserRepository: User record
                UserRepository-->>AuthService: User object
                AuthService->>AuthService: hashPassword(newPassword)
                AuthService->>UserRepository: updatePasswordAndClearToken(userId, hashedPassword)
                UserRepository->>Database: UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?
                Database-->>UserRepository: Password updated
                UserRepository-->>AuthService: Update confirmation
                AuthService-->>AuthController: Success response
                AuthController-->>Client: 200 OK "Password reset successful"
            end
        end
    end
```

### 10.1 Flow Details

1. **Request Initiation**: Client sends POST request to /api/resetPassword with JSON payload containing reset token and new password

```json
{
  "token": "2323",
  "password": "new password"
}
```

2. **CORS Validation**: CORS Filter validates request origin and headers against allowed domains
3. **Rate Limiting**: Validates request frequency per client IP and endpoint.
4. **JWT Filter Bypass**: he JWT Request Filter recognizes /api/resetPassword as a public endpoint and skips token validation
5. **Controller Processing**: Request flows to AuthController which extracts token and new password from request body
6. **Service Layer Processing**: AuthController delegates to AuthService for business logic execution
7. **User Lookup**: AuthService queries UserRepository to find user by username
8. **Token Validation**: AuthService queries UserRepository to find user by reset token and check generation time must be within 2 minutes of current time, if fails returns 400 Bad Request with "Invalid or expired token"
9. **Database Update**: Updates user password with hashed value
10. **Response**: Returns 200 OK with message "Password reset successful".

---

### 11. Password Security Policy (Recommanded)

```mermaid
flowchart TD
    A[Password Input] --> B[Length Check]
    B --> C{8-50 characters?}
    C -->|No| D[Reject: Invalid Length]
    C -->|Yes| E[Complexity Check]

    E --> F{Contains Uppercase?}
    F -->|No| D
    F -->|Yes| G{Contains Lowercase?}
    G -->|No| D
    G -->|Yes| H{Contains Number?}
    H -->|No| D
    H -->|Yes| I{Contains Special Character?}
    I -->|No| D
    I -->|Yes| J[Dictionary Check]

    J --> K{Common Password?}
    K -->|Yes| D
    K -->|No| L[History Check]

    L --> M{Used in Last 5?}
    M -->|Yes| D
    M -->|No| N[BCrypt Hash]

    N --> O[Salt Generation]
    O --> P[12 Round Encryption]
    P --> Q[Store Hashed Password]
```

#### 11.1 Password Requirements

| Requirement            | Rule             | Validation            |
| ---------------------- | ---------------- | --------------------- |
| **Minimum Length**     | 8 characters     | Regex validation      |
| **Maximum Length**     | 50 characters    | Prevent DoS attacks   |
| **Uppercase**          | At least 1       | Character class check |
| **Lowercase**          | At least 1       | Character class check |
| **Numbers**            | At least 1       | Numeric validation    |
| **Special Characters** | At least 1       | Symbol validation     |
| **Dictionary Words**   | Not allowed      | Common password list  |
| **History**            | Last 5 passwords | Hash comparison       |

---

## 12. Rate Limiting Strategy

#### 12.1 Endpoint-Specific Limits

| Endpoint                   | Capacity     | Refill Rate | Refill Period | Rationale           |
| -------------------------- | ------------ | ----------- | ------------- | ------------------- |
| POST /auth/authenticate    | 5 requests   | 1 token     | 1 minute      | Prevent brute force |
| POST /auth/forgot-password | 3 requests   | 1 token     | 1 hour        | Prevent spam        |
| POST /auth/UserCreation    | 10 requests  | 1 token     | 1 hour        | Prevent abuse       |
| POST /auth/resetPassword   | 5 requests   | 1 token     | 5 minutes     | Allow retries       |
| **General API**            | 100 requests | 10 tokens   | 1 minute      | Normal usage        |

### 12.2 Rate Limiting Response Headers (Recommanded)

```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1640998800
X-RateLimit-Retry-After: 60
Content-Type: application/json
```

```json
{
  "timestamp": "2024-12-19T10:30:00Z",
  "status": 429,
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Try again in 60 seconds.",
  "path": "/api/auth/login",
  "rateLimitInfo": {
    "limit": 5,
    "remaining": 0,
    "resetTime": "2024-12-19T10:31:00Z",
    "retryAfter": 60
  }
}
```

### 13. WhatsApp Fallback Communication Strategy (Proposed)

```mermaid
flowchart TD
    A[Password Reset Request] --> B[Primary: WhatsApp]
    B --> C{WhatsApp Available?}

    C -->|Yes| D[Send via WhatsApp]
    C -->|No| E[Fallback 1: SMS]

    D --> F{Delivery Successful?}
    F -->|Yes| G[Success Response]
    F -->|No| E

    E --> H{SMS Available?}
    H -->|Yes| I[Send via SMS]
    H -->|No| J[Fallback 2: Email]

    I --> K{SMS Delivered?}
    K -->|Yes| G
    K -->|No| J

    J --> L{Email Available?}
    L -->|Yes| M[Send via Email]
    L -->|No| N[Manual Intervention]

    M --> O{Email Sent?}
    O -->|Yes| G
    O -->|No| N

    G --> P[Log Success]
    N --> Q[Log Failure & Alert Admin]
```

Sequential Fallback Chain:

WhatsApp First - Primary communication method
SMS Backup - If WhatsApp fails
Email Final - If SMS also fails
Admin Alert - If all methods fail

---

## 14. Error Handling & Response Codes

### 14.1 HTTP Status Code Usage

| Status Code                   | Usage                   | Example Scenarios                     |
| ----------------------------- | ----------------------- | ------------------------------------- |
| **200 OK**                    | Successful operations   | Login success, password reset success |
| **400 Bad Request**           | Client input errors     | Invalid JSON, validation failures     |
| **401 Unauthorized**          | Authentication failures | Invalid credentials, expired tokens   |
| **403 Forbidden**             | Authorization failures  | Insufficient permissions              |
| **404 Not Found**             | Resource not found      | Invalid endpoints                     |
| **409 Conflict**              | Resource conflicts      | Username already exists               |
| **429 Too Many Requests**     | Rate limiting           | Exceeded request limits               |
| **500 Internal Server Error** | Server errors           | Database failures, system errors      |

### 14.2 Error Code Taxonomy

```mermaid
graph TD
    A[Error Codes] --> B[Authentication Errors - AUTH_xxx]
    A --> C[Validation Errors - VAL_xxx]
    A --> D[Rate Limiting Errors - RATE_xxx]
    A --> E[System Errors - SYS_xxx]

    B --> B1[AUTH_001: Invalid Credentials]
    B --> B2[AUTH_002: Account Locked]
    B --> B3[AUTH_003: Token Expired]
    B --> B4[AUTH_004: Invalid Token]

    C --> C1[VAL_001: Missing Required Field]
    C --> C2[VAL_002: Invalid Format]
    C --> C3[VAL_003: Value Out of Range]
    C --> C4[VAL_004: Password Too Weak]

    D --> D1[RATE_001: Login Limit Exceeded]
    D --> D2[RATE_002: Reset Limit Exceeded]
    D --> D3[RATE_003: General Limit Exceeded]

    E --> E1[SYS_001: Database Error]
    E --> E2[SYS_002: External Service Error]
    E --> E3[SYS_003: Configuration Error]
```

### 14.3 Global Exception Handling

```mermaid
graph TB
    A[Exception Thrown] --> B[Global Exception Handler]
    B --> C{Exception Type}

    C -->|ValidationException| D[400 Bad Request]
    C -->|AuthenticationException| E[401 Unauthorized]
    C -->|AccessDeniedException| F[403 Forbidden]
    C -->|RateLimitException| G[429 Too Many Requests]
    C -->|DataIntegrityException| H[409 Conflict]
    C -->|RuntimeException| I[500 Internal Server Error]

    D --> J[Log Warning]
    E --> K[Log Security Event]
    F --> K
    G --> L[Log Rate Limit Violation]
    H --> J
    I --> M[Log Error]

    J --> N[Return Error Response]
    K --> N
    L --> N
    M --> N
```

## 15. Audit Event Categories

## 15.1 Authentication Events

| Event Type         | Description                    | Audit Level | Data Captured                           |
| ------------------ | ------------------------------ | ----------- | --------------------------------------- |
| **LOGIN_SUCCESS**  | Successful user login          | INFO        | User ID, IP, timestamp, user agent      |
| **LOGIN_FAILURE**  | Failed login attempt           | WARN        | Username, IP, failure reason, timestamp |
| **LOGOUT**         | User logout                    | INFO        | User ID, session duration, IP           |
| **TOKEN_REFRESH**  | JWT token refresh              | INFO        | User ID, old token ID, new token ID     |
| **ACCOUNT_LOCKED** | Account locked due to failures | ERROR       | User ID, lock reason, unlock time       |

#### 15.2 Password Management Events

| Event Type                 | Description                   | Audit Level | Data Captured                |
| -------------------------- | ----------------------------- | ----------- | ---------------------------- |
| **PASSWORD_RESET_REQUEST** | Password reset initiated      | INFO        | User ID, IP, delivery method |
| **PASSWORD_RESET_SUCCESS** | Password successfully reset   | INFO        | User ID, IP, reset method    |
| **PASSWORD_RESET_FAILURE** | Failed password reset attempt | WARN        | Token, IP, failure reason    |
| **PASSWORD_CHANGE**        | Password changed by user      | INFO        | User ID, IP, timestamp       |

#### 12.2.3 System Events

| Event Type               | Description                   | Audit Level | Data Captured                              |
| ------------------------ | ----------------------------- | ----------- | ------------------------------------------ |
| **RATE_LIMIT_EXCEEDED**  | Rate limit violation          | WARN        | IP, endpoint, violation count              |
| **SECURITY_VIOLATION**   | Security policy violation     | ERROR       | User ID, violation type, details           |
| **CONFIGURATION_CHANGE** | System configuration modified | INFO        | Admin ID, property changed, old/new values |

---

## 16. Critical Vulnerabilities Discovered in Production Systems

### 16.1 Exposed User Authentication Endpoint

A critical security vulnerability has been identified in the application's API layer where the `[/api/UserAuthentication]`(https://acerp.acharyaerptech.in/api/UserAuthentication) endpoint is publicly accessible, exposing complete user credential databases including usernames, hashed passwords, email addresses, reset password token and sensitive system information.

### Vulnerability Details

| **Attribute**      | **Value**                            |
| ------------------ | ------------------------------------ |
| **Severity Level** | `CRITICAL`                           |
| **CVSS Score**     | `9.8 (Critical)`                     |
| **Risk Level**     | `HIGH`                               |
| **Status**         | `ACTIVE - Immediate Action Required` |

### Exploit Details

**Request:**

```http
GET /api/UserAuthentication
```

**Response (Success):**

```http
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{
  "success": true,
  "status": 200,
  "data": [
    {
      "id": 1,
      "username": "admin",
      "password": "$2a$10$P1n9CIew9Vixft3vauE7G.zjlFP51hqfm1nJ9xlgkGdLn/5CiSfAu",
      "usertype": "Staff",
      "email": "noreply@acharya.ac.in",
      "usercode": "00001",
      "created_date": "2024-05-23T11:34:36.979+00:00",
      "modified_date": "2024-05-23T11:34:36.979+00:00",
      "created_by": 1,
      "modified_by": null,
      "active": true,
      "created_username": "Amadmin",
      "modified_username": null,
      "reset_password_token": "347458",
      "reset_password_time": "2024-12-13T07:57:33.028956",
      "is_lms_auditor": null,
      "guest_type": null,
      "book_chapter_approver_designation": null
    }
    // ... additional user records
  ]
}
```

## 1.1 Potential Misuse & Attack Vectors

### Primary Attack Scenarios

- **🔐 Credential Harvesting**: Attackers can download all usernames, emails, and hashed passwords
- **⚡ Brute Force Attacks**: Even with bcrypt hashing, attackers can attempt to crack passwords offline
- **👤 Account Takeover**: Successful password cracking leads to unauthorized access
- **🔑 Password Reset Exploitation**: Exposed reset tokens can be used to hijack accounts
- **📊 Data Enumeration**: Attackers can map your entire user base, roles, and organizational structure

## Immediate Mitigation Strategy

### ⚠️ Emergency Actions (Do Now)

1. **Block Public Access**: Immediately restrict the `/api/UserAuthentication` endpoint
2. **Invalidate Reset Tokens**: Force expire all password reset tokens
3. **Force Password Resets**: Require all users to change passwords immediately

---

> **⚡ CRITICAL ALERT**: This vulnerability poses an immediate and severe threat to system security. Take action immediately to prevent potential data breaches and unauthorized access.
