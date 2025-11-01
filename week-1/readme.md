Everything in one file → routes.js handles HTTP, talks to DB, sends emails
```

**Senior engineers think in layers:**
```
┌─────────────────────────────────┐
│   PRESENTATION LAYER            │  ← HTTP routes, controllers
│   (Routes, Controllers)         │     Only handles req/res
└─────────────────────────────────┘
              ↓
┌─────────────────────────────────┐
│   BUSINESS LOGIC LAYER          │  ← Services, use cases
│   (Services)                    │     Core application logic
└─────────────────────────────────┘
              ↓
┌─────────────────────────────────┐
│   DATA ACCESS LAYER             │  ← Repositories
│   (Repositories)                │     Database operations
└─────────────────────────────────┘
              ↓
┌─────────────────────────────────┐
│   DATABASE                      │  ← PostgreSQL, MongoDB
└─────────────────────────────────┘


 
 # SOLID Principles (Quick Overview)
 S - Single Responsibility: One class/function = one job
O - Open/Closed: Open for extension, closed for modification
L - Liskov Substitution: Derived classes should be substitutable
I - Interface Segregation: Many specific interfaces > one general interface
D - Dependency Inversion: Depend on abstractions, not concretions

