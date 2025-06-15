## Advanced Techniques Shown:

### 1. **Flowchart (E-commerce Order Processing)**

- Multiple decision branches with complex logic
- Parallel processing paths
- Custom styling with classes and colors
- Subgraph organization
- Error handling flows

### 2. **Sequence Diagram (Microservices Authentication)**

- Multiple services interaction
- Parallel execution blocks (`par`/`and`)
- Alternative flows (`alt`/`else`)
- Colored background sections (`rect`)
- Async operation handling

### 3. **Class Diagram (Order Management System)**

- Abstract classes and inheritance
- Multiple relationship types (composition, aggregation)
- Enumerations with values
- Method visibility modifiers
- Complex many-to-many relationships

### 4. **ERD (Social Media Platform)**

- Self-referencing relationships
- Junction tables for many-to-many
- Multiple foreign keys
- Various data types
- Complex cardinalities

### 5. **State Diagram (Order State Machine)**

- Complex state transitions
- Multiple exit conditions
- Notes and timeouts
- Parallel state handling
- Error recovery paths

### 6. **Git Flow Diagram**

- Branch management
- Merge strategies
- Hotfix workflows
- Release management

## Pro Tips for Complex Diagrams:

1. **Break down complexity** - Use subgraphs and sections
2. **Consistent naming** - Use clear, descriptive identifiers
3. **Color coding** - Group related elements with colors
4. **Documentation** - Add notes for complex logic
5. **Validation** - Test diagrams in multiple renderers

# Complex Mermaid Examples

## 1. Advanced Flowchart - E-commerce Order Processing

```mermaid
flowchart TD
    A[Customer Places Order] --> B{Payment Method}
    B -->|Credit Card| C[Validate Card]
    B -->|PayPal| D[PayPal Gateway]
    B -->|Bank Transfer| E[Bank Verification]

    C --> F{Card Valid?}
    F -->|No| G[Payment Failed]
    F -->|Yes| H[Charge Card]

    D --> I{PayPal Auth?}
    I -->|No| G
    I -->|Yes| J[PayPal Charge]

    E --> K{Bank Confirms?}
    K -->|No| G
    K -->|Yes| L[Mark Pending]

    H --> M[Payment Success]
    J --> M
    L --> N[Manual Review]
    N --> O{Approved?}
    O -->|No| P[Cancel Order]
    O -->|Yes| M

    M --> Q[Check Inventory]
    Q --> R{Items Available?}
    R -->|No| S[Backorder]
    R -->|Yes| T[Reserve Items]

    S --> U[Notify Customer]
    U --> V[Wait for Restock]
    V --> Q

    T --> W[Generate Pick List]
    W --> X[Warehouse Fulfillment]
    X --> Y[Package Items]
    Y --> Z[Generate Shipping Label]
    Z --> AA[Ship Order]
    AA --> BB[Send Tracking Info]
    BB --> CC[Order Complete]

    G --> DD[Notify Customer]
    P --> DD

    style A fill:#e3f2fd
    style CC fill:#c8e6c9
    style G fill:#ffcdd2
    style P fill:#ffcdd2
    style DD fill:#ffcdd2

    classDef paymentFlow fill:#fff3e0,stroke:#ff9800
    classDef inventoryFlow fill:#f3e5f5,stroke:#9c27b0
    classDef fulfillmentFlow fill:#e8f5e8,stroke:#4caf50

    class C,D,E,H,J,L paymentFlow
    class Q,R,S,T inventoryFlow
    class W,X,Y,Z,AA,BB fulfillmentFlow
```

## 2. Complex Sequence Diagram - Microservices Authentication

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant AG as API Gateway
    participant AU as Auth Service
    participant US as User Service
    participant PR as Profile Service
    participant DB as Database
    participant R as Redis Cache
    participant N as Notification Service

    Note over U,N: User Login Flow with Microservices

    U->>+F: Login Request
    F->>+AG: POST /auth/login
    AG->>+AU: Forward Auth Request

    AU->>+DB: Query User Credentials
    DB-->>-AU: User Data

    alt Invalid Credentials
        AU-->>AG: 401 Unauthorized
        AG-->>F: 401 Unauthorized
        F-->>U: Login Failed
    else Valid Credentials
        AU->>+R: Store Session
        R-->>-AU: Session Stored

        AU->>AU: Generate JWT Token
        AU-->>-AG: 200 OK + JWT

        AG->>+US: GET /user/profile (with JWT)
        US->>US: Validate JWT

        par Fetch User Details
            US->>+PR: GET /profile/details
            PR->>+DB: Query Profile Data
            DB-->>-PR: Profile Data
            PR-->>-US: Profile Response
        and Log Login Event
            US->>+N: Send Login Notification
            N->>N: Process Notification
            N-->>-US: Notification Queued
        end

        US-->>-AG: User Profile Data
        AG-->>-F: Complete User Data
        F-->>-U: Login Success + Dashboard

        Note over N: Async notification processing
        N->>U: Push Notification (Login Alert)
    end

    rect rgb(255, 245, 238)
        Note over AU,R: Authentication Layer
    end

    rect rgb(232, 245, 233)
        Note over US,PR: Business Logic Layer
    end
```

## 3. Advanced Class Diagram - Order Management System

```mermaid
classDiagram
    class User {
        <<abstract>>
        -id: UUID
        -email: String
        -password: String
        -createdAt: DateTime
        +authenticate(): Boolean
        +updateProfile(): void
    }

    class Customer {
        -loyaltyPoints: Integer
        -preferredPayment: PaymentMethod
        -shippingAddresses: List~Address~
        +placeOrder(items: List~Product~): Order
        +viewOrderHistory(): List~Order~
        +addToWishlist(product: Product): void
    }

    class Admin {
        -permissions: List~Permission~
        -department: String
        +manageInventory(): void
        +processRefunds(): void
        +generateReports(): Report
    }

    class Order {
        -id: UUID
        -status: OrderStatus
        -totalAmount: Decimal
        -orderDate: DateTime
        -shippingAddress: Address
        -items: List~OrderItem~
        +calculateTotal(): Decimal
        +updateStatus(status: OrderStatus): void
        +cancel(): Boolean
    }

    class OrderItem {
        -quantity: Integer
        -unitPrice: Decimal
        -discount: Decimal
        +getSubtotal(): Decimal
    }

    class Product {
        -id: UUID
        -name: String
        -description: String
        -price: Decimal
        -category: Category
        -inventory: Inventory
        +updatePrice(newPrice: Decimal): void
        +checkAvailability(): Boolean
    }

    class Category {
        -id: UUID
        -name: String
        -parentCategory: Category
        -subcategories: List~Category~
        +getFullPath(): String
    }

    class Inventory {
        -stockLevel: Integer
        -reservedQuantity: Integer
        -reorderPoint: Integer
        +reserve(quantity: Integer): Boolean
        +release(quantity: Integer): void
        +needsReorder(): Boolean
    }

    class Payment {
        -id: UUID
        -amount: Decimal
        -method: PaymentMethod
        -status: PaymentStatus
        -processedAt: DateTime
        +process(): Boolean
        +refund(amount: Decimal): Boolean
    }

    class Address {
        -street: String
        -city: String
        -state: String
        -zipCode: String
        -country: String
        +validate(): Boolean
        +format(): String
    }

    User <|-- Customer
    User <|-- Admin

    Customer "1" -- "many" Order : places
    Order "1" -- "many" OrderItem : contains
    OrderItem "many" -- "1" Product : references
    Product "many" -- "1" Category : belongs_to
    Product "1" -- "1" Inventory : has
    Order "1" -- "many" Payment : has_payments
    Customer "1" -- "many" Address : has_addresses
    Order "many" -- "1" Address : ships_to

    <<enumeration>> OrderStatus
    OrderStatus : PENDING
    OrderStatus : CONFIRMED
    OrderStatus : PROCESSING
    OrderStatus : SHIPPED
    OrderStatus : DELIVERED
    OrderStatus : CANCELLED

    <<enumeration>> PaymentMethod
    PaymentMethod : CREDIT_CARD
    PaymentMethod : PAYPAL
    PaymentMethod : BANK_TRANSFER
    PaymentMethod : APPLE_PAY

    <<enumeration>> PaymentStatus
    PaymentStatus : PENDING
    PaymentStatus : COMPLETED
    PaymentStatus : FAILED
    PaymentStatus : REFUNDED
```

## 4. Complex Entity Relationship Diagram - Social Media Platform

```mermaid
erDiagram
    USER {
        uuid id PK
        string username UK
        string email UK
        string password_hash
        string first_name
        string last_name
        text bio
        string profile_image_url
        datetime created_at
        datetime updated_at
        boolean is_verified
        boolean is_active
    }

    POST {
        uuid id PK
        uuid user_id FK
        text content
        string image_url
        integer like_count
        integer comment_count
        integer share_count
        datetime created_at
        datetime updated_at
        boolean is_deleted
        string post_type
    }

    COMMENT {
        uuid id PK
        uuid post_id FK
        uuid user_id FK
        uuid parent_comment_id FK
        text content
        integer like_count
        datetime created_at
        datetime updated_at
        boolean is_deleted
    }

    LIKE {
        uuid id PK
        uuid user_id FK
        uuid post_id FK
        uuid comment_id FK
        string like_type
        datetime created_at
    }

    FOLLOW {
        uuid id PK
        uuid follower_id FK
        uuid following_id FK
        datetime created_at
        boolean is_active
    }

    MESSAGE {
        uuid id PK
        uuid conversation_id FK
        uuid sender_id FK
        text content
        datetime sent_at
        datetime read_at
        boolean is_deleted
        string message_type
    }

    CONVERSATION {
        uuid id PK
        string conversation_type
        string title
        datetime created_at
        datetime updated_at
        boolean is_active
    }

    CONVERSATION_PARTICIPANT {
        uuid id PK
        uuid conversation_id FK
        uuid user_id FK
        datetime joined_at
        datetime last_read_at
        boolean is_admin
        boolean is_active
    }

    HASHTAG {
        uuid id PK
        string tag UK
        integer usage_count
        datetime first_used
        datetime last_used
    }

    POST_HASHTAG {
        uuid post_id FK
        uuid hashtag_id FK
        datetime created_at
    }

    NOTIFICATION {
        uuid id PK
        uuid user_id FK
        uuid actor_id FK
        uuid post_id FK
        uuid comment_id FK
        string notification_type
        text content
        boolean is_read
        datetime created_at
    }

    USER_SETTING {
        uuid id PK
        uuid user_id FK
        string setting_key
        string setting_value
        datetime updated_at
    }

    REPORT {
        uuid id PK
        uuid reporter_id FK
        uuid reported_user_id FK
        uuid reported_post_id FK
        uuid reported_comment_id FK
        string report_type
        text description
        string status
        datetime created_at
        datetime resolved_at
    }

    USER ||--o{ POST : creates
    USER ||--o{ COMMENT : writes
    USER ||--o{ LIKE : gives
    USER ||--o{ FOLLOW : "follows/followed_by"
    USER ||--o{ MESSAGE : sends
    USER ||--o{ CONVERSATION_PARTICIPANT : participates
    USER ||--o{ NOTIFICATION : receives
    USER ||--|| USER_SETTING : has
    USER ||--o{ REPORT : "reports/reported"

    POST ||--o{ COMMENT : has
    POST ||--o{ LIKE : receives
    POST ||--o{ POST_HASHTAG : tagged_with
    POST ||--o{ NOTIFICATION : triggers
    POST ||--o{ REPORT : subject_of

    COMMENT ||--o{ COMMENT : "replies_to"
    COMMENT ||--o{ LIKE : receives
    COMMENT ||--o{ NOTIFICATION : triggers
    COMMENT ||--o{ REPORT : subject_of

    CONVERSATION ||--o{ MESSAGE : contains
    CONVERSATION ||--o{ CONVERSATION_PARTICIPANT : has

    HASHTAG ||--o{ POST_HASHTAG : used_in
```

## 5. Advanced State Diagram - Order State Machine

```mermaid
stateDiagram-v2
    [*] --> CART_CREATED : Add Item to Cart

    CART_CREATED --> CART_UPDATED : Add/Remove Items
    CART_UPDATED --> CART_UPDATED : Modify Quantities
    CART_CREATED --> CHECKOUT_INITIATED : Proceed to Checkout
    CART_UPDATED --> CHECKOUT_INITIATED : Proceed to Checkout

    CHECKOUT_INITIATED --> PAYMENT_PENDING : Submit Order
    PAYMENT_PENDING --> PAYMENT_PROCESSING : Process Payment

    PAYMENT_PROCESSING --> PAYMENT_FAILED : Payment Declined
    PAYMENT_PROCESSING --> PAYMENT_SUCCESSFUL : Payment Approved

    PAYMENT_FAILED --> PAYMENT_RETRY : Customer Retries
    PAYMENT_RETRY --> PAYMENT_PROCESSING : New Payment Method
    PAYMENT_FAILED --> ORDER_CANCELLED : Max Retries Exceeded

    PAYMENT_SUCCESSFUL --> INVENTORY_CHECK : Verify Stock
    INVENTORY_CHECK --> BACKORDERED : Items Unavailable
    INVENTORY_CHECK --> ORDER_CONFIRMED : Items Available

    BACKORDERED --> INVENTORY_CHECK : Stock Replenished
    BACKORDERED --> ORDER_CANCELLED : Customer Cancels

    ORDER_CONFIRMED --> PICKING : Generate Pick List
    PICKING --> PICKED : Items Collected
    PICKED --> PACKING : Move to Packing
    PACKING --> PACKED : Items Packaged
    PACKED --> SHIPPED : Carrier Pickup

    SHIPPED --> IN_TRANSIT : Tracking Active
    IN_TRANSIT --> DELIVERED : Customer Receives
    IN_TRANSIT --> DELIVERY_FAILED : Failed Delivery Attempt

    DELIVERY_FAILED --> IN_TRANSIT : Retry Delivery
    DELIVERY_FAILED --> RETURNED_TO_SENDER : Max Attempts

    DELIVERED --> ORDER_COMPLETE : Customer Confirms
    DELIVERED --> RETURN_REQUESTED : Customer Returns

    RETURN_REQUESTED --> RETURN_APPROVED : Review Approved
    RETURN_REQUESTED --> RETURN_DENIED : Review Denied

    RETURN_APPROVED --> ITEM_RETURNED : Item Received
    ITEM_RETURNED --> REFUND_PROCESSED : Refund Issued
    REFUND_PROCESSED --> ORDER_COMPLETE : Process Complete

    RETURN_DENIED --> ORDER_COMPLETE : Final State
    RETURNED_TO_SENDER --> REFUND_PROCESSED : Auto Refund

    ORDER_CANCELLED --> [*]
    ORDER_COMPLETE --> [*]

    note right of PAYMENT_PROCESSING
        Timeout: 5 minutes
        Auto-cancel if no response
    end note

    note right of BACKORDERED
        Customer notified
        ETA provided if available
    end note

    note right of IN_TRANSIT
        Tracking updates
        sent to customer
    end note
```

## 6. Complex Git Flow Diagram

```mermaid
flowchart TD
    subgraph Main
        M1[Initial Commit]
        M2[Release v1.0]
        M3[Hotfix v1.0.1]
    end

    subgraph Develop
        D1[Dev Setup]
        D2[Merge Auth Feature]
        D3[Merge Payment]
        D4[Merge Inventory]
        D5[Sync Hotfix]
    end

    subgraph Features
        F1[Feature: User Auth]
        F2[Feature: Payment]
        F3[Feature: Inventory]
    end

    subgraph Hotfix
        H1[Security Fix]
    end

    M1 --> D1
    D1 --> F1
    F1 --> D2
    D2 --> F2
    D2 --> F3
    F2 --> D3
    F3 --> D4
    D3 --> M2
    D4 --> M2
    M2 --> H1
    H1 --> M3
    H1 --> D5

    style Main fill:#f9f,stroke:#333,stroke-width:2px
    style Develop fill:#bbf,stroke:#333,stroke-width:2px
    style Features fill:#bfb,stroke:#333,stroke-width:2px
    style Hotfix fill:#fbb,stroke:#333,stroke-width:2px
```

## Key Features Demonstrated:

### Flowchart Features:

- Subgraphs and clustering
- Multiple decision points
- Parallel processing paths
- Custom styling and classes
- Complex conditional logic

### Sequence Diagram Features:

- Multiple participants
- Parallel execution (par/and)
- Alternative flows (alt/else)
- Notes and annotations
- Colored backgrounds (rect)
- Async operations

### Class Diagram Features:

- Abstract classes
- Inheritance relationships
- Composition and aggregation
- Enumerations
- Method visibility modifiers
- Complex relationships

### ERD Features:

- Multiple relationship types
- Self-referencing relationships
- Junction tables
- Various cardinalities
- Comprehensive attribute types
- Foreign key relationships

### State Diagram Features:

- Complex state transitions
- Parallel states
- Notes and annotations
- Multiple end states
- Conditional transitions
- Timeout handling
