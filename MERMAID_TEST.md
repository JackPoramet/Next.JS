# Mermaid Diagram Test

This page tests the Mermaid diagram rendering functionality.

## Basic Flowchart

```mermaid
graph TD
    A[Start] --> B{Is it?}
    B -->|Yes| C[OK]
    C --> D[Rethink]
    D --> B
    B ---->|No| E[End]
```

## Sequence Diagram

```mermaid
sequenceDiagram
    participant A as Alice
    participant B as Bob
    participant C as Charlie
    
    A->>B: Hello Bob!
    B->>C: Hello Charlie!
    C-->>B: Hi Bob
    B-->>A: Hi Alice
```

## IoT System Architecture

```mermaid
graph TB
    subgraph "IoT Devices"
        D1[Device 1]
        D2[Device 2] 
        D3[Device 3]
    end
    
    subgraph "Communication Layer"
        MQTT[MQTT Broker]
    end
    
    subgraph "Backend Services"
        API[Next.js API]
        DB[(PostgreSQL)]
        SSE[SSE Service]
    end
    
    subgraph "Frontend"
        WEB[Web Dashboard]
        RT[Real-time Components]
    end
    
    D1 --> MQTT
    D2 --> MQTT
    D3 --> MQTT
    
    MQTT --> API
    API --> DB
    API --> SSE
    
    SSE --> RT
    WEB --> API
    RT --> WEB
```

## State Diagram

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Processing: Start
    Processing --> Success: Complete
    Processing --> Error: Fail
    Success --> [*]
    Error --> Retry: Retry
    Retry --> Processing
    Error --> [*]: Give Up
```

## GitGraph

```mermaid
gitgraph
    commit id: "Initial"
    branch develop
    checkout develop
    commit id: "Feature A"
    commit id: "Feature B"
    checkout main
    merge develop
    commit id: "Release"
```
