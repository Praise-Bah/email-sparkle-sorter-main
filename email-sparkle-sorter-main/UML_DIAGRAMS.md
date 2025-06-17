# Email Sparkle Sorter: UML Diagrams

## 1. Use Case Diagram
```mermaid
%% Use Case Diagram with <<include>> and <<extend>> relationships
%% Actors: User, Gmail OAuth, Google Calendar
%% Use cases: Authenticate, View Emails, Categorize Emails, Create Task, Mark as Read/Unread, Search & Filter

actor User
actor "Gmail OAuth" as OAuth
actor "Google Calendar" as Calendar

User --> (Authenticate)
(Authenticate) --> OAuth : <<include>>
User --> (View Emails)
(View Emails) --> (Categorize Emails) : <<include>>
(View Emails) --> (Search & Filter)
User --> (Categorize Emails)
(Categorize Emails) --> (Mark as Read/Unread) : <<extend>>
User --> (Create Task)
(Create Task) --> Calendar : <<include>>
(Create Task) --> (Mark as Read/Unread) : <<include>>
User --> (Mark as Read/Unread)
User --> (Search & Filter)

%% Notes:
%% - <<include>> means the base use case always invokes the included use case
%% - <<extend>> means the base use case may optionally invoke the extended use case
```

## 2. Class Diagram
```mermaid
%% Enhanced Class Diagram with proper UML arrows and comments
classDiagram
    class Email {
        +string id
        +string subject
        +string from
        +string[] to
        +string body
        +DateTime date
        +string[] labels
        +boolean isRead
        +categorize()
        +markAsRead()
        +extractTasks()
    }

    class EmailCategory {
        +string name
        +string color
        +string[] rules
        +addRule()
        +matches(Email email) boolean
    }

    class EmailService {
        +fetchEmails(DateTime from, DateTime to) Email[]
        +updateEmailStatus(string emailId, boolean isRead)
        +applyLabel(string emailId, string label)
    }

    class TaskService {
        +createTask(Email email) Task
        +addToCalendar(Task task) boolean
    }

    class AuthService {
        +login()
        +getAccessToken() string
        +isAuthenticated() boolean
    }

    class Task {
        +string id
        +string title
        +DateTime dueDate
        +string description
    }

    %% Relationships:
    EmailService "1" o-- "*" Email : manages  %% aggregation
    Email "1" *-- "*" EmailCategory : categorized as %% composition (email has categories)
    TaskService "1" o-- "*" Task : creates %% aggregation
    TaskService ..> Email : uses %% dependency
    AuthService <|-- EmailService : authenticates %% inheritance/generalization
    AuthService <|-- TaskService : authenticates %% inheritance/generalization

    %% Comments for AI:
    %% - Use aggregation (o--) for service-to-entity management
    %% - Use composition (*--) when one class cannot exist without the other
    %% - Use inheritance (<|--) for shared authentication logic
    %% - Use dependency (..>) for service usage
```

## 3. Sequence Diagram - Email Processing
```mermaid
sequenceDiagram
    participant User
    participant UI as React UI
    participant Auth as AuthService
    participant API as Gmail API
    participant Process as EmailProcessor
    
    User->>UI: Login with Google
    UI->>Auth: Start OAuth Flow
    Auth->>API: Request Authorization
    API-->>Auth: Return Auth Code
    Auth->>API: Exchange Code for Tokens
    API-->>Auth: Return Access & Refresh Tokens
    Auth-->>UI: Update Auth State
    
    UI->>API: Fetch Recent Emails (48h)
    API-->>UI: Return Email Data
    UI->>Process: Process Emails
    Process->>Process: Categorize Emails
    Process-->>UI: Return Categorized Emails
    UI->>User: Display Organized Inbox
    
    User->>UI: Mark Email as Read
    UI->>API: Update Email Status
    API-->>UI: Confirm Update
    
    User->>UI: Create Task from Email
    UI->>API: Create Calendar Event
    API-->>UI: Confirm Event Creation
    UI->>API: Mark Email as Read
```

## 4. Component Diagram
```mermaid
graph TD
    subgraph "React Application"
        A[App Component]
        B[AuthProvider]
        C[EmailList]
        D[EmailItem]
        E[CategoryBadge]
        F[TaskCreator]
        G[SearchBar]
        H[Settings]
    end
    
    subgraph "Services"
        I[GmailService]
        J[CalendarService]
        K[AuthService]
    end
    
    subgraph "External APIs"
        L[Gmail API]
        M[Google Calendar API]
        N[OAuth 2.0]
    end
    
    A --> B
    A --> C
    A --> G
    C --> D
    D --> E
    D --> F
    
    B --> K
    K --> N
    
    C --> I
    F --> J
    
    I --> L
    J --> M
```

## 5. State Diagram - Email Lifecycle
```mermaid
stateDiagram-v2
    [*] --> Unread
    Unread --> Read: User opens email
    Unread --> Archived: User archives
    Read --> Unread: Mark as unread
    Read --> Archived: User archives
    Read --> Task: Create task
    Task --> Archived: Task completed
    Archived --> [*]: 30 days passed
    
    state Task {
        [*] --> Created
        Created --> Scheduled: Add to calendar
        Scheduled --> Completed: Mark as done
        Scheduled --> Postponed: Reschedule
        Postponed --> Scheduled: New date set
    }
```

## 6. Deployment Diagram
```mermaid
graph TD
    subgraph "Client-Side"
        A[Browser] -->|HTTPS| B[Static Files]
        B --> C[React App]
        C --> D[IndexedDB]
        C --> E[LocalStorage]
    end
    
    subgraph "Google Cloud Platform"
        F[OAuth 2.0 Service]
        G[Gmail API]
        H[Calendar API]
    end
    
    subgraph "External Services"
        I[Google Auth]
    end
    
    A -->|OAuth Flow| I
    A -->|API Calls| G
    A -->|API Calls| H
    G --> F
    H --> F
    F --> I
    
    style A fill:#d4f1f9,stroke:#333,stroke-width:2px
    style B fill:#d5e8d4,stroke:#333,stroke-width:2px
    style C fill:#d5e8d4,stroke:#333,stroke-width:2px
    style D fill:#d5e8d4,stroke:#333,stroke-width:2px
    style E fill:#d5e8d4,stroke:#333,stroke-width:2px
    style F fill:#fff2cc,stroke:#333,stroke-width:2px
    style G fill:#fff2cc,stroke:#333,stroke-width:2px
    style H fill:#fff2cc,stroke:#333,stroke-width:2px
    style I fill:#f8cecc,stroke:#333,stroke-width:2px
```

## How to Use These Diagrams

1. **Use Case Diagram**: Shows the main functionalities of the system from the user's perspective.
2. **Class Diagram**: Illustrates the system's classes, attributes, operations, and relationships.
3. **Sequence Diagram**: Demonstrates the flow of operations for email processing.
4. **Component Diagram**: Shows the organization and dependencies among software components.
5. **State Diagram**: Represents the different states an email can be in throughout its lifecycle.
6. **Deployment Diagram**: Visualizes the system's physical architecture and deployment.

These diagrams use Mermaid.js syntax and can be rendered in any Markdown viewer that supports Mermaid (like GitHub, GitLab, or VS Code with Mermaid extension).
