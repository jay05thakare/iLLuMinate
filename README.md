# iLLuMinate - Cement Industry Sustainability Management Platform

## Product Requirements Document (PRD)

### Executive Summary
iLLuMinate is a comprehensive SAAS platform designed specifically for the cement industry to track, manage, and optimize their sustainability data through AI-powered insights. The platform enables multi-organizational support with role-based access control, facility management, emission tracking, AI-driven recommendations, and benchmarking capabilities.

---

## 🏗️ System Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   AI Services   │
│   (React.js)    │◄──►│   (Node.js)     │◄──►│   (Python)      │
│                 │    │                 │    │                 │
│ - Dashboard     │    │ - REST APIs     │    │ - ML Models     │
│ - Facility Mgmt │    │ - Auth Service  │    │ - Recommendations│
│ - Data Entry    │    │ - Data Models   │    │ - Predictions   │
│ - Analytics     │    │ - Business Logic│    │ - NLP (CementGPT)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Database      │
                    │   (PostgreSQL)  │
                    │                 │
                    │ - Organizations │
                    │ - Users         │
                    │ - Facilities    │
                    │ - Emission Data │
                    │ - EF Libraries  │
                    └─────────────────┘
```

### Core Components
- **Frontend**: React.js with modern UI/UX
- **Backend**: Node.js with Express.js framework
- **AI Services**: Python microservices for ML workflows
- **Database**: PostgreSQL for data persistence
- **Development**: Makefile support for lint, test, and development workflows

---

## 📋 Functional Requirements

### 1. Multi-Tenant Organization Management
- **Organization Onboarding**: Support for multiple organizations
- **User Management**: Multiple users per organization with role-based access
- **Role Types**: Admin and User roles with different permissions
- **Facility Management**: Multiple facilities per organization

### 2. Facility Management
Each facility includes:
- **Basic Information**: Name, description, location
- **Four Main Tabs**:
  1. **Profile**: Facility information and analytics graphs
  2. **Data**: Scope 1 & 2 emission tracking with monthly data entry
  3. **Targets & Goals**: Assigned sustainability targets
  4. **Alternate Fuels**: AI-powered fuel recommendations

### 3. Emission Data Tracking
- **Scope 1 Emissions**: Direct emissions from owned sources (fuel combustion, process emissions)
- **Scope 2 Emissions**: Indirect emissions from purchased energy (electricity, steam, heat)
- **Resource Configuration**: Facility-wise configured emission resources with emission factors and heat content
- **Manual Data Entry**: Users input monthly resource consumption data for configured resources
- **Automatic Calculations**: 
  - **Emissions**: Consumption × Emission Factor = Total Emissions (kgCO2e)
  - **Energy**: Consumption × Heat Content = Total Energy (MJ/GJ)
- **Production Data**: Monthly cement production tracking for intensity calculations
- **Emission Resources**: Master list of emission resources (fuels, electricity, etc.) with scope classification
- **Emission Factor Libraries**: Multiple EF libraries (DEFRA, EPA, IPCC) with version control
- **Emission Factors**: Specific emission factors and heat content values from various libraries for each resource

### 4. AI-Powered Features

#### 4.1 Alternate Fuel Recommendations
- **User Input Preferences**:
  - Lower Cost: AI finds fuels with approximate lower costs in facility location area
  - Lower Emissions: AI selects fuels with lower kgCO2e using emission factors from EF libraries
  - Higher Energy: AI identifies fuels with higher energy content using heat content from EF libraries
- **EF Library Integration**: System analyzes available emission factors from EF libraries to compare fuels
- **Location-based Analysis**: Cost recommendations consider regional fuel availability and pricing
- **Output Metrics**: 
  - Cost per cement production ($/ton cement)
  - Emissions intensity (kgCO2e/ton cement) 
  - Energy efficiency (MJ/ton cement)
- **Natural Language Output**: Simple recommendations explaining which fuel is best for each optimization criteria

#### 4.2 Targets & Goals AI
- **Goal Definition**: User-defined targets (e.g., Net Zero by 2035)
- **AI Predictions**: Timeline analysis for goal achievement
- **Improvement Suggestions**: Ways to achieve goals based on current data
- **Peer Benchmarking**: Target suggestions based on industry standards
- **Progress Tracking**: AI-driven completion predictions

#### 4.3 Benchmarking
- **Industry Data**: Normalized industry benchmarking data from publicly available sources (CDP, sustainability reports)
- **On-the-fly Comparison**: Real-time calculation of facility performance vs industry averages
- **KPI Analysis**: Scope 1, Scope 2 emissions, energy, water, waste consumption intensities (per ton cement)
- **Percentile Ranking**: Dynamic calculation of facility's position in industry distribution
- **Segmented Benchmarking**: Comparison within similar facility types, regions, or capacity ranges
- **Improvement Recommendations**: AI-generated suggestions based on performance gaps

#### 4.4 Cement GPT
- **Specialized Chatbot**: Cement manufacturing domain expertise
- **Contextual Awareness**: Access to facility-specific data
- **Natural Language Interface**: User-friendly query and response system

### 5. Dashboard & Analytics
- **Facility Count Card**: Total facilities overview
- **Goals Count Card**: Active targets summary
- **Emission Graphs**: Monthly/yearly Scope 1 & 2 trends
- **Energy Analytics**: Combined Scope 1 + 2 energy consumption
- **Total Metrics**: Overall kgCO2e and energy consumption cards
- **Production Tracking**: Total cement production metrics

---

## 🔧 Non-Functional Requirements

### 1. Code Quality
- **Modular Architecture**: Clean, maintainable codebase
- **Best Practices**: Industry-standard coding practices
- **Documentation**: Comprehensive code documentation
- **Testing**: Unit and integration test coverage

### 2. Performance
- **Response Time**: < 2 seconds for standard operations
- **Scalability**: Support for multiple organizations and facilities
- **Concurrent Users**: Support for multiple simultaneous users

### 3. Security
- **Authentication**: Secure user authentication and authorization
- **Data Privacy**: Organization data isolation
- **API Security**: Secure REST API endpoints
- **Role-based Access**: Proper permission management

### 4. Reliability
- **Uptime**: 99.9% availability target
- **Data Backup**: Regular automated backups
- **Error Handling**: Graceful error handling and recovery

---

## 🎯 Feature Prioritization Matrix

### Easy + Important (High Priority)
- **Cement GPT**: AI chatbot for immediate value
- **Dashboard**: Core analytics and overview

### Hard + Important (High Priority)
- **Facilities Management**: Core platform functionality
- **Targets & Goals**: AI-driven goal setting and tracking

### Easy + Not Important (Low Priority)
- **Benchmarking**: Nice-to-have comparison features

---

## 👥 User Management

### User Roles and Permissions

#### Organization Admin
- **Full Access**: All organization data and settings
- **User Management**: Add, remove, and manage users
- **Facility Management**: Create and manage facilities
- **Target Setting**: Define and assign sustainability targets

#### Organization User
- **Data Entry**: Input emission and production data
- **View Access**: Access to assigned facility data
- **AI Features**: Use Cement GPT and recommendation features
- **Limited Admin**: Cannot manage users or organization settings

### User Workflows

#### Emission Data Tracking Workflow
1. **Resource Configuration**: Admin configures emission resources for each facility from the EF library
2. **Monthly Data Entry**: Users input consumption data for configured resources
3. **Automatic Calculations**: System calculates emissions and energy using formulas:
   - `Total Emissions (kgCO2e) = Consumption × Emission Factor`
   - `Total Energy (MJ/GJ) = Consumption × Heat Content`
4. **Data Validation**: System validates entries and flags anomalies
5. **Analytics Generation**: Dashboard updates with new emission and energy data

#### General User Workflows
1. **Registration**: Organization admin creates account
2. **Onboarding**: Setup organization profile and facilities
3. **Resource Setup**: Configure facility-specific emission resources
4. **User Invitation**: Admin invites team members
5. **Data Entry**: Users input monthly consumption data for configured resources
6. **Analysis**: AI provides insights and recommendations based on calculated emissions

---

## 🗄️ Database Schema

### Core Tables

#### Organizations
```sql
organizations {
  organization_id: UUID (PK)
  name: VARCHAR(255)
  description: TEXT
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
  subscription_plan: VARCHAR(50)
  status: ENUM('active', 'inactive', 'trial')
}
```

#### Users
```sql
users {
  id: UUID (PK)
  organization_id: UUID (FK -> organizations.organization_id)
  email: VARCHAR(255) UNIQUE
  password_hash: VARCHAR(255)
  first_name: VARCHAR(100)
  last_name: VARCHAR(100)
  role: ENUM('admin', 'user')
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
  last_login: TIMESTAMP
  status: ENUM('active', 'inactive', 'pending')
}
```

#### Facilities
```sql
facilities {
  id: UUID (PK)
  organization_id: UUID (FK -> organizations.organization_id)
  name: VARCHAR(255)
  description: TEXT
  location: JSONB
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
  status: ENUM('active', 'inactive')
}
```

#### Facility Resources (Configuration)
```sql
facility_resources {
  id: UUID (PK)
  organization_id: UUID (FK -> organizations.organization_id)
  facility_id: UUID (FK -> facilities.id)
  resource_id: UUID (FK -> emission_resources.id)
  emission_factor_id: UUID (FK -> emission_factors.id)  -- Which specific EF to use for this resource
  is_active: BOOLEAN
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}
```

#### Emission Data
```sql
emission_data {
  id: UUID (PK)
  organization_id: UUID (FK -> organizations.organization_id)
  facility_id: UUID (FK -> facilities.id)
  facility_resource_id: UUID (FK -> facility_resources.id)
  month: INTEGER
  year: INTEGER
  scope: ENUM('scope1', 'scope2')
  consumption: DECIMAL(15,2)
  consumption_unit: VARCHAR(50)
  emission_factor: DECIMAL(10,6)
  heat_content: DECIMAL(10,2)
  total_emissions: DECIMAL(15,2)  -- Calculated: consumption × emission_factor
  total_energy: DECIMAL(15,2)     -- Calculated: consumption × heat_content
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}
```

#### Production Data
```sql
production_data {
  id: UUID (PK)
  organization_id: UUID (FK -> organizations.organization_id)
  facility_id: UUID (FK -> facilities.id)
  month: INTEGER
  year: INTEGER
  cement_production: DECIMAL(15,2)
  unit: VARCHAR(50)
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}
```

#### Emission Resources
```sql
emission_resources {
  id: UUID (PK)
  resource_name: VARCHAR(255)
  resource_type: VARCHAR(100)                -- fuel, electricity, steam, etc.
  category: VARCHAR(100)                     -- coal, natural_gas, biomass, etc.
  scope: ENUM('scope1', 'scope2')
  is_alternative_fuel: BOOLEAN               -- Flag for alternative fuel options
  description: TEXT
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}
```

#### Emission Factor Libraries
```sql
emission_factor_libraries {
  id: UUID (PK)
  library_name: VARCHAR(255)                -- DEFRA, EPA, IPCC, etc.
  version: VARCHAR(100)                     -- AR4, AR5, AR6, 2023, etc.
  year: INTEGER                             -- Publication year
  region: VARCHAR(100)                      -- Global, US, EU, India, etc.
  description: TEXT
  source_url: VARCHAR(500)
  is_active: BOOLEAN
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}
```

#### Emission Factors
```sql
emission_factors {
  id: UUID (PK)
  resource_id: UUID (FK -> emission_resources.id)
  library_id: UUID (FK -> emission_factor_libraries.id)
  emission_factor: DECIMAL(10,6)             -- kgCO2e per unit
  emission_factor_unit: VARCHAR(50)          -- per kg, per m3, per kWh, etc.
  heat_content: DECIMAL(10,2)                -- MJ per unit (for energy calculations)
  heat_content_unit: VARCHAR(50)             -- MJ/kg, MJ/m3, etc.
  approximate_cost: DECIMAL(10,2)            -- Cost per unit (for cost analysis)
  cost_unit: VARCHAR(50)                     -- $/kg, $/m3, $/kWh, etc.
  availability_score: INTEGER                -- 1-10 score for regional availability
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}
```

#### Sustainability Targets
```sql
sustainability_targets {
  id: UUID (PK)
  organization_id: UUID (FK -> organizations.organization_id)
  facility_id: UUID (FK -> facilities.id) NULL
  name: VARCHAR(255)
  description: TEXT
  target_type: VARCHAR(100)
  baseline_value: DECIMAL(15,2)
  target_value: DECIMAL(15,2)
  baseline_year: INTEGER
  target_year: INTEGER
  unit: VARCHAR(50)
  status: ENUM('active', 'achieved', 'cancelled')
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}
```

#### AI Recommendations
```sql
ai_recommendations {
  id: UUID (PK)
  organization_id: UUID (FK -> organizations.organization_id)
  facility_id: UUID (FK -> facilities.id)
  recommendation_type: VARCHAR(100)
  input_parameters: JSONB
  recommendations: JSONB
  confidence_score: DECIMAL(3,2)
  created_at: TIMESTAMP
  expires_at: TIMESTAMP
}
```

#### Chat History (Cement GPT)
```sql
chat_history {
  id: UUID (PK)
  organization_id: UUID (FK -> organizations.organization_id)
  user_id: UUID (FK -> users.id)
  facility_id: UUID (FK -> facilities.id) NULL
  session_id: UUID
  message: TEXT
  response: TEXT
  message_type: ENUM('user', 'assistant')
  created_at: TIMESTAMP
}
```

#### Industry Benchmarking Data (Data Warehouse)
```sql
industry_benchmarking {
  id: UUID (PK)
  organization_name: VARCHAR(255)           -- Public company/organization name (LafargeHolcim, HeidelbergCement, etc.)
  reporting_year: INTEGER                   -- Year of data
  
  -- Annual Production Data
  annual_cement_production: DECIMAL(15,2)   -- Total cement production (million tons)
  
  -- Emission Metrics (absolute values)
  scope_1: FLOAT32 NULL                     -- Scope 1 emissions (million tCO2e)
  scope_2: FLOAT32 NULL                     -- Scope 2 emissions (million tCO2e)
  scope_3: FLOAT32 NULL                     -- Scope 3 emissions (million tCO2e)
  
  -- Water Metrics (absolute values)
  water_withdrawal: FLOAT32 NULL            -- Total water withdrawal (million liters)
  water_consumption: FLOAT32 NULL           -- Total water consumption (million liters)
  
  -- Waste Metrics (absolute values)
  waste_generated: FLOAT32 NULL             -- Total waste generated (thousand tons)
  
  -- Energy Metrics (absolute values)
  renewable_energy_consumption: FLOAT32 NULL  -- Renewable energy consumption (GWh)
  total_energy_consumption: FLOAT32 NULL      -- Total energy consumption (GWh)
  
  -- Financial Data
  revenue: FLOAT64 NULL                     -- Annual revenue (million USD)
  
  -- Company Classification
  company_size: ENUM('small', 'medium', 'large', 'multinational')
  region: VARCHAR(100)                      -- Primary operating region
  country: VARCHAR(100)                    -- Headquarters country
  
  -- Data Source & Quality
  data_source: JSONB                       -- Map of report name and URL: {"report_name": "2023 Sustainability Report", "url": "https://company.com/report.pdf"}
  data_quality_score: INTEGER              -- 1-10 reliability score
  is_verified: BOOLEAN                     -- Third-party verified data
  
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}
```

#### Benchmarking Query Examples
```sql
-- Calculate organization's percentile ranking for Scope 1 emissions intensity
WITH intensity_data AS (
  SELECT 
    organization_name,
    (scope_1 / annual_cement_production) as scope1_intensity
  FROM industry_benchmarking 
  WHERE reporting_year = 2023 
    AND scope_1 IS NOT NULL 
    AND annual_cement_production > 0
)
SELECT 
  (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM intensity_data)) as percentile_rank
FROM intensity_data 
WHERE scope1_intensity <= @organization_scope1_intensity;

-- Get industry benchmarks with calculated intensities
SELECT 
  AVG(scope_1 / annual_cement_production) as avg_scope1_intensity,
  AVG(scope_2 / annual_cement_production) as avg_scope2_intensity,
  AVG(total_energy_consumption / annual_cement_production) as avg_energy_intensity,
  AVG(water_consumption / annual_cement_production) as avg_water_intensity,
  AVG(renewable_energy_consumption / total_energy_consumption * 100) as avg_renewable_rate,
  PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY scope_1 / annual_cement_production) as p25_scope1_intensity,
  PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY scope_1 / annual_cement_production) as median_scope1_intensity,
  PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY scope_1 / annual_cement_production) as p75_scope1_intensity
FROM industry_benchmarking 
WHERE reporting_year = 2023
  AND scope_1 IS NOT NULL 
  AND annual_cement_production > 0
  AND region = @organization_region;

-- Get peer group comparison with calculated intensities
SELECT 
  organization_name,
  annual_cement_production,
  (scope_1 / annual_cement_production) as scope1_intensity,
  (scope_2 / annual_cement_production) as scope2_intensity,
  (renewable_energy_consumption / total_energy_consumption * 100) as renewable_rate,
  revenue
FROM industry_benchmarking 
WHERE company_size = @organization_size
  AND reporting_year = 2023
  AND scope_1 IS NOT NULL
  AND annual_cement_production > 0
ORDER BY scope1_intensity;
```

---

## 🔧 Technology Stack

### Frontend
- **Framework**: React.js 18+
- **Styling**: Tailwind CSS / Material-UI
- **State Management**: Redux Toolkit / Zustand
- **Charts**: Chart.js / D3.js
- **Build Tool**: Vite
- **Testing**: Jest + React Testing Library

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Authentication**: JWT + Passport.js
- **ORM**: Prisma / TypeORM
- **Validation**: Joi / Zod
- **Testing**: Jest + Supertest
- **Documentation**: Swagger/OpenAPI

### AI Services
- **Language**: Python 3.9+
- **Framework**: FastAPI
- **ML Libraries**: scikit-learn, pandas, numpy
- **NLP**: OpenAI GPT API / Hugging Face
- **Data Processing**: pandas, scipy
- **Testing**: pytest

### Database
- **Primary**: PostgreSQL 14+
- **Caching**: Redis
- **Migration**: Database migration tools

### DevOps & Infrastructure
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoring**: Winston (logging)
- **Environment**: dotenv

### Development Tools
- **Linting**: ESLint, Prettier
- **Git Hooks**: Husky
- **Package Manager**: npm/yarn
- **Build Automation**: Makefile

---

## ✅ TODO Task List

### Phase 1: Foundation Setup (Weeks 1-2)
- [ ] **Development Environment Setup**
  - [ ] Initialize project structure (frontend, backend, ai-services folders)
  - [ ] Configure Makefile for development workflows
  - [ ] Setup Docker containers for PostgreSQL and Redis
  - [ ] Configure environment variables (.env files)
  - [ ] Setup git repository with proper .gitignore
  - [ ] Initialize package.json for backend (Node.js + Express)
  - [ ] Initialize React app with Vite for frontend
  - [ ] Setup Python environment for AI services
  - [ ] Configure ESLint, Prettier, and development tools
  - [ ] Setup basic CI/CD pipeline (GitHub Actions)

### Phase 2: Complete UI Development with Static Data (Weeks 3-5)
- [ ] **Static Data Foundation**
  - [ ] Create comprehensive mockData.js with all entities
  - [ ] Define data structures for organizations, facilities, emissions, targets
  - [ ] Create static emission factor library data
  - [ ] Create sample industry benchmarking data
  - [ ] Create mock AI recommendation responses

- [ ] **Dashboard Interface**
  - [ ] Dashboard layout and navigation structure
  - [ ] Facility count and goals summary cards
  - [ ] Scope 1 & 2 emission charts (monthly/yearly)
  - [ ] Energy consumption analytics charts
  - [ ] Total metrics cards (production, kgCO2e, energy)
  - [ ] Responsive design implementation

- [ ] **Facility Management UI**
  - [ ] Facility listing page with filters
  - [ ] Facility creation and edit forms
  - [ ] Facility profile tab with info and graphs
  - [ ] Data entry tab for Scope 1 & 2 emissions
  - [ ] Monthly data entry forms with validation
  - [ ] Production data entry interface
  - [ ] Targets & Goals assignment interface
  - [ ] Alternate fuels recommendation display

- [ ] **Authentication & User Management UI**
  - [ ] Login and registration forms
  - [ ] User profile management
  - [ ] Organization setup and management
  - [ ] Role-based access control UI elements
  - [ ] User invitation and management interface

- [ ] **AI Features UI**
  - [ ] Cement GPT chat interface
  - [ ] Recommendation cards and detailed views
  - [ ] Benchmarking comparison tables and charts
  - [ ] Target achievement progress indicators
  - [ ] Alternative fuel comparison interface

- [ ] **Forms and Data Entry**
  - [ ] Emission data entry forms (monthly, resource-wise)
  - [ ] Production data entry forms
  - [ ] Facility configuration forms
  - [ ] Target creation and assignment forms
  - [ ] Form validation and error handling
  - [ ] Data import/export interfaces

### Phase 3: Database Integration (Weeks 6-7)
- [ ] **Database Schema Implementation**
  - [ ] Setup PostgreSQL database
  - [ ] Create all migration files (000-015)
  - [ ] Implement migration runner system
  - [ ] Create database indexes and constraints
  - [ ] Setup database backup and restore procedures

- [ ] **Core Backend APIs**
  - [ ] Authentication APIs (JWT-based)
  - [ ] Organization management APIs
  - [ ] User management and role APIs
  - [ ] Facility CRUD APIs
  - [ ] Emission resources and EF libraries APIs
  - [ ] Database connection and ORM setup
  - [ ] API middleware (auth, validation, error handling)

### Phase 4: Context Functions & Data Integration (Weeks 8-9)
- [ ] **Data Context Layer**
  - [ ] Create React context providers for all data entities
  - [ ] Implement data fetching hooks and utilities
  - [ ] Replace static data with API calls
  - [ ] Implement data transformation functions
  - [ ] Add loading states and error handling
  - [ ] Implement data caching strategies

- [ ] **Backend Data Services**
  - [ ] Emission data CRUD operations
  - [ ] Production data tracking services
  - [ ] Facility resource configuration APIs
  - [ ] Data aggregation and calculation services
  - [ ] Monthly/yearly data analysis functions
  - [ ] Data validation and business logic

- [ ] **Data Flow Integration**
  - [ ] Connect dashboard to real emission data
  - [ ] Integrate facility management with database
  - [ ] Connect data entry forms to backend
  - [ ] Implement real-time data updates
  - [ ] Add data synchronization mechanisms

### Phase 5: AI Microservice Development (Weeks 10-11)
- [ ] **Python AI Service Setup**
  - [ ] FastAPI service architecture setup
  - [ ] Docker containerization for AI service
  - [ ] Database connection for AI service
  - [ ] API integration with Node.js backend
  - [ ] Environment setup for ML libraries

- [ ] **Cement GPT Implementation**
  - [ ] OpenAI API integration
  - [ ] Context-aware query processing
  - [ ] Facility-specific data context preparation
  - [ ] Chat history management
  - [ ] Response formatting and validation

- [ ] **AI Recommendation Engines**
  - [ ] Alternate fuel recommendation algorithm
  - [ ] EF library integration for fuel comparison
  - [ ] Cost optimization algorithms (location-based)
  - [ ] Emission reduction analysis algorithms
  - [ ] Energy efficiency comparison algorithms
  - [ ] Multi-criteria decision analysis

- [ ] **AI-Backend Integration**
  - [ ] AI recommendation storage and caching
  - [ ] Real-time AI response handling
  - [ ] AI service health monitoring
  - [ ] Error handling and fallback mechanisms

### Phase 6: Advanced AI Features (Weeks 12-13)
- [ ] **Targets & Goals AI**
  - [ ] Goal achievement prediction algorithms
  - [ ] Timeline analysis for target completion
  - [ ] Industry standard analysis for goal suggestions
  - [ ] Progress tracking and milestone predictions
  - [ ] Goal optimization recommendations

- [ ] **Benchmarking AI**
  - [ ] Industry benchmarking data integration
  - [ ] Peer comparison analysis algorithms
  - [ ] Performance gap identification
  - [ ] Improvement opportunity analysis
  - [ ] Benchmark visualization and insights

- [ ] **Advanced Analytics**
  - [ ] Trend analysis algorithms
  - [ ] Anomaly detection in emission data
  - [ ] Predictive analytics for future emissions
  - [ ] Correlation analysis between factors
  - [ ] Performance optimization suggestions

### Phase 7: Testing & Quality Assurance (Weeks 14-15)
- [ ] **Comprehensive Testing**
  - [ ] Frontend unit tests (React components)
  - [ ] Backend API integration tests
  - [ ] AI service testing and validation
  - [ ] End-to-end user workflow testing
  - [ ] Database migration testing
  - [ ] Performance and load testing
  - [ ] Security testing and vulnerability assessment

- [ ] **Code Quality & Documentation**
  - [ ] Code review and refactoring
  - [ ] API documentation completion
  - [ ] User documentation and guides
  - [ ] Deployment documentation
  - [ ] Code coverage analysis (>80% target)

### Phase 8: Production Deployment (Weeks 16-17)
- [ ] **Production Environment**
  - [ ] Production server setup and configuration
  - [ ] Database optimization and tuning
  - [ ] Security hardening and SSL setup
  - [ ] Monitoring and logging implementation
  - [ ] Backup and disaster recovery setup

- [ ] **Deployment Pipeline**
  - [ ] CI/CD pipeline optimization
  - [ ] Automated testing in pipeline
  - [ ] Staging environment setup
  - [ ] Production deployment procedures
  - [ ] Rollback and recovery procedures
  - [ ] Performance monitoring setup

---

## 📊 Success Metrics

### Technical Metrics
- **Code Coverage**: > 80%
- **API Response Time**: < 2 seconds
- **Uptime**: > 99.5%
- **User Satisfaction**: > 4.5/5

### Business Metrics
- **User Adoption**: > 90% feature utilization
- **Data Accuracy**: > 95% emission data quality
- **AI Recommendation Accuracy**: > 85%
- **Goal Achievement Rate**: Track target completion rates

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- PostgreSQL 14+
- Docker & Docker Compose

### Development Setup
```bash
# Clone repository
git clone <repository-url>
cd iLLuMinate

# Install dependencies
make install

# Setup environment
cp .env.example .env
# Configure database and API keys

# Setup database
make db-setup

# Run migrations
make migrate

# Start development servers
make dev

# Run tests
make test

# Lint code
make lint
```

### Makefile Commands
```makefile
install:    # Install all dependencies (Node.js, Python)
dev:        # Start development servers (Node.js, Python, React)
test:       # Run all tests (backend, frontend, AI services)
lint:       # Run linting and formatting (ESLint, Prettier, Black)
build:      # Build production artifacts
deploy:     # Deploy to production
clean:      # Clean build artifacts
db-setup:   # Create database and user
migrate:    # Run database migrations
migrate-create: # Create new migration file
migrate-rollback: # Rollback last migration
db-reset:   # Reset database (drop and recreate)
db-seed:    # Seed database with sample data
```

---

## 🔧 Project Structure & Setup

### Project Directory Structure
```
iLLuMinate/
├── .gitignore                    # Git ignore rules
├── .env.example                  # Environment variables template
├── Makefile                      # Development commands
├── docker-compose.yml            # Docker services
├── README.md                     # Project documentation
│
├── backend/                      # Node.js backend
│   ├── package.json
│   ├── .eslintrc.js
│   ├── src/
│   ├── tests/
│   └── migrations/               # Database migration files
│       ├── 001_create_organizations.sql
│       ├── 002_create_users.sql
│       ├── 003_create_facilities.sql
│       └── migration_history.json
│
├── frontend/                     # React.js frontend
│   ├── package.json
│   ├── .eslintrc.js
│   ├── src/
│   └── public/
│
├── ai-services/                  # Python AI microservices
│   ├── requirements.txt
│   ├── .flake8
│   ├── src/
│   └── tests/
│
└── docs/                        # Additional documentation
    ├── api/
    └── deployment/
```

### Git Configuration

#### .gitignore Setup
```gitignore
# Dependencies
node_modules/
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
env/
venv/
.venv/
pip-log.txt
pip-delete-this-directory.txt
.tox/
.coverage
.coverage.*
.cache
nosetests.xml
coverage.xml
*.cover
*.log
.git
.mypy_cache
.pytest_cache
.hypothesis

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
dist/
build/
*.egg-info/
.next/
out/

# Database
*.db
*.sqlite
*.sqlite3
data/
pgdata/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Temporary folders
tmp/
temp/

# API Keys and secrets
secrets/
credentials/
*.pem
*.key
*.crt
```

---

## 🗃️ Database Migration System

### Migration Architecture

#### Migration Folder Structure
```
backend/migrations/
├── 000_create_migration_history.sql     -- Creates migration tracking table
├── 001_create_organizations.sql
├── 002_create_users.sql
├── 003_create_facilities.sql
├── 004_create_emission_resources.sql
├── 005_create_emission_factor_libraries.sql
├── 006_create_emission_factors.sql
├── 007_create_facility_resources.sql
├── 008_create_emission_data.sql
├── 009_create_production_data.sql
├── 010_create_sustainability_targets.sql
├── 011_create_ai_recommendations.sql
├── 012_create_chat_history.sql
├── 013_create_industry_benchmarking.sql
├── 014_seed_emission_resources.sql
└── 015_seed_emission_factor_libraries.sql
```

#### Migration Tracking System

**Migration History Table**
```sql
-- 000_create_migration_history.sql
CREATE TABLE IF NOT EXISTS migration_history (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL UNIQUE,
  checksum VARCHAR(64) NOT NULL,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  execution_time_ms INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_migration_history_filename ON migration_history(filename);
CREATE INDEX IF NOT EXISTS idx_migration_history_applied_at ON migration_history(applied_at);
```

**Example Migration History Records**
```sql
SELECT * FROM migration_history ORDER BY applied_at;

-- Result:
-- id | filename                    | checksum      | applied_at          | execution_time_ms | success
-- ---|----------------------------|---------------|---------------------|-------------------|--------
-- 1  | 000_create_migration_history.sql | a1b2c3d4... | 2024-01-15 10:30:00 | 23               | true
-- 2  | 001_create_organizations.sql     | f6e5d4c3... | 2024-01-15 10:30:05 | 45               | true
-- 3  | 002_create_users.sql            | 9h8i7j6k... | 2024-01-15 10:30:10 | 32               | true
```

#### Migration Execution Logic

**Backend Migration Runner (Node.js)**
```javascript
// backend/src/utils/migrationRunner.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class MigrationRunner {
  constructor(db) {
    this.db = db;
    this.migrationsPath = path.join(__dirname, '../../migrations');
  }

  async runMigrations() {
    // First ensure migration_history table exists
    await this.ensureMigrationTable();
    
    const migrationFiles = this.getMigrationFiles();
    
    for (const file of migrationFiles) {
      if (!(await this.isMigrationApplied(file))) {
        await this.executeMigration(file);
      }
    }
  }

  async ensureMigrationTable() {
    // Check if migration_history table exists, if not create it
    const tableExists = await this.db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'migration_history'
      );
    `);

    if (!tableExists.rows[0].exists) {
      console.log('Creating migration_history table...');
      const migrationTableSql = `
        CREATE TABLE migration_history (
          id SERIAL PRIMARY KEY,
          filename VARCHAR(255) NOT NULL UNIQUE,
          checksum VARCHAR(64) NOT NULL,
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          execution_time_ms INTEGER,
          success BOOLEAN DEFAULT true,
          error_message TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX idx_migration_history_filename ON migration_history(filename);
        CREATE INDEX idx_migration_history_applied_at ON migration_history(applied_at);
      `;
      await this.db.query(migrationTableSql);
    }
  }

  getMigrationFiles() {
    return fs.readdirSync(this.migrationsPath)
      .filter(file => file.endsWith('.sql'))
      .sort();
  }

  async isMigrationApplied(filename) {
    try {
      const result = await this.db.query(
        'SELECT filename FROM migration_history WHERE filename = $1 AND success = true',
        [filename]
      );
      return result.rows.length > 0;
    } catch (error) {
      // If table doesn't exist, migration hasn't been applied
      return false;
    }
  }

  async executeMigration(filename) {
    const startTime = Date.now();
    const filePath = path.join(this.migrationsPath, filename);
    const sql = fs.readFileSync(filePath, 'utf8');
    const checksum = crypto.createHash('sha256').update(sql).digest('hex');

    console.log(`🔄 Running migration: ${filename}`);

    try {
      // Execute migration in a transaction
      await this.db.query('BEGIN');
      
      // Skip the migration_history table creation file if it's already executed via ensureMigrationTable
      if (filename !== '000_create_migration_history.sql') {
        await this.db.query(sql);
      }
      
      // Record successful migration
      await this.db.query(`
        INSERT INTO migration_history (filename, checksum, execution_time_ms, success) 
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (filename) DO UPDATE SET
          checksum = EXCLUDED.checksum,
          applied_at = CURRENT_TIMESTAMP,
          execution_time_ms = EXCLUDED.execution_time_ms,
          success = EXCLUDED.success,
          error_message = NULL
      `, [filename, checksum, Date.now() - startTime, true]);
      
      await this.db.query('COMMIT');
      console.log(`✅ Applied migration: ${filename} (${Date.now() - startTime}ms)`);
      
    } catch (error) {
      await this.db.query('ROLLBACK');
      
      // Record failed migration
      try {
        await this.db.query(`
          INSERT INTO migration_history (filename, checksum, execution_time_ms, success, error_message) 
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (filename) DO UPDATE SET
            checksum = EXCLUDED.checksum,
            applied_at = CURRENT_TIMESTAMP,
            execution_time_ms = EXCLUDED.execution_time_ms,
            success = EXCLUDED.success,
            error_message = EXCLUDED.error_message
        `, [filename, checksum, Date.now() - startTime, false, error.message]);
      } catch (logError) {
        console.error('Failed to log migration error:', logError);
      }
      
      console.error(`❌ Migration failed: ${filename}`, error);
      throw error;
    }
  }

  async getMigrationStatus() {
    await this.ensureMigrationTable();
    
    const appliedMigrations = await this.db.query(`
      SELECT filename, applied_at, execution_time_ms, success, error_message 
      FROM migration_history 
      ORDER BY applied_at
    `);
    
    const allMigrations = this.getMigrationFiles();
    const pendingMigrations = allMigrations.filter(file => 
      !appliedMigrations.rows.some(row => row.filename === file && row.success)
    );
    
    return {
      applied: appliedMigrations.rows,
      pending: pendingMigrations,
      total: allMigrations.length,
      lastMigration: appliedMigrations.rows[appliedMigrations.rows.length - 1]?.filename || null
    };
  }

  async rollbackLastMigration() {
    await this.ensureMigrationTable();
    
    const lastMigration = await this.db.query(`
      SELECT filename FROM migration_history 
      WHERE success = true 
      ORDER BY applied_at DESC 
      LIMIT 1
    `);
    
    if (lastMigration.rows.length === 0) {
      console.log('No migrations to rollback');
      return;
    }
    
    const filename = lastMigration.rows[0].filename;
    console.log(`🔄 Rolling back migration: ${filename}`);
    
    // Mark migration as rolled back
    await this.db.query(
      'UPDATE migration_history SET success = false, error_message = $1 WHERE filename = $2',
      ['Rolled back manually', filename]
    );
    
    console.log(`✅ Rolled back migration: ${filename}`);
    console.log('⚠️  Note: Manual database changes may be required for complete rollback');
  }
}

module.exports = MigrationRunner;
```

#### Example Migration Files

**001_create_organizations.sql**
```sql
-- Migration: Create organizations table
-- Created: 2024-01-15
-- Description: Base organization table for multi-tenant architecture

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS organizations (
  organization_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  subscription_plan VARCHAR(50) DEFAULT 'trial',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'trial')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations(status);
CREATE INDEX IF NOT EXISTS idx_organizations_created_at ON organizations(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at 
  BEFORE UPDATE ON organizations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**014_seed_emission_resources.sql**
```sql
-- Migration: Seed emission resources data
-- Created: 2024-01-20
-- Description: Insert standard emission resources

INSERT INTO emission_resources (resource_name, resource_type, category, scope, is_alternative_fuel, description) VALUES
('Natural Gas', 'fuel', 'fossil_fuel', 'scope1', false, 'Natural gas for combustion'),
('Coal', 'fuel', 'fossil_fuel', 'scope1', false, 'Coal for combustion'),
('Biomass', 'fuel', 'alternative_fuel', 'scope1', true, 'Biomass for combustion'),
('Electricity Grid', 'electricity', 'grid_electricity', 'scope2', false, 'Grid electricity consumption'),
('Solar Electricity', 'electricity', 'renewable', 'scope2', true, 'Solar-generated electricity')
ON CONFLICT (resource_name, scope) DO NOTHING;
```

#### Makefile Migration Commands
```makefile
# Database Migration Commands
migrate:
	@echo "Running database migrations..."
	@cd backend && npm run migrate

migrate-create:
	@echo "Creating new migration file..."
	@read -p "Enter migration name: " name; \
	timestamp=$$(date +"%Y%m%d%H%M%S"); \
	filename="$${timestamp}_$${name}.sql"; \
	touch "backend/migrations/$${filename}"; \
	echo "-- Migration: $${name}" > "backend/migrations/$${filename}"; \
	echo "-- Created: $$(date +"%Y-%m-%d")" >> "backend/migrations/$${filename}"; \
	echo "-- Description: " >> "backend/migrations/$${filename}"; \
	echo "" >> "backend/migrations/$${filename}"; \
	echo "Created migration: backend/migrations/$${filename}"

migrate-status:
	@echo "Checking migration status..."
	@cd backend && npm run migrate:status

migrate-rollback:
	@echo "Rolling back last migration..."
	@cd backend && npm run migrate:rollback

migrate-history:
	@echo "Showing migration history..."
	@cd backend && npm run migrate:history

db-reset:
	@echo "Resetting database..."
	@docker-compose down -v
	@docker-compose up -d postgres
	@sleep 5
	@make migrate
	@make db-seed

db-migration-table:
	@echo "Showing migration_history table..."
	@docker-compose exec postgres psql -U illuminate -d illuminate_db -c "SELECT * FROM migration_history ORDER BY applied_at;"
```

### Migration Best Practices

1. **Idempotent Migrations**: Use `IF NOT EXISTS` and `ON CONFLICT` clauses
2. **Incremental Numbering**: Use sequential numbering (001, 002, 003...)
3. **Descriptive Names**: Include date and purpose in filenames
4. **Rollback Strategy**: Include rollback instructions in comments
5. **Data Validation**: Add constraints and indexes in migrations
6. **Backup Before Migration**: Always backup before running migrations in production

---

## 📝 License

This project is proprietary software for cement industry sustainability management.

---

## 📞 Contact

For questions and support, please contact the development team.
