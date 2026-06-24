# GxCapture Redbird - Playwright Test Automation

Automated regression test suite for the GxCapture Redbird Benefits Management application using Playwright with TypeScript.

## Test Coverage

| Module | Test Cases | Spec File |
|--------|-----------|-----------|
| Portal Screen | TC#1-2 | `tests/portal/portal.spec.ts` |
| BM Landing Page | TC#3 | `tests/portal/bm-landing.spec.ts` |
| Manage Clients | TC#4-5 | `tests/manage-clients/manage-clients.spec.ts` |
| Manage Context | TC#6-7 | `tests/manage-context/manage-context.spec.ts` |
| Manage Definitions | TC#8 | `tests/manage-definitions/manage-definitions.spec.ts` |
| Hierarchy | TC#9 | `tests/hierarchy/hierarchy.spec.ts` |
| Templates | TC#10-13 | `tests/templates/templates.spec.ts` |
| Plans | TC#14-22 | `tests/plans/plans.spec.ts` |
| My Work Queue | TC#23-27 | `tests/my-work-queue/my-work-queue.spec.ts` |
| Roles & Privileges | TC#28-32 | `tests/roles-and-privileges/roles.spec.ts` |
| Plan Life Cycle | TC#33-46 | `tests/plan-lifecycle/plan-lifecycle.spec.ts` |
| Rules | TC#47-57 | `tests/rules/rules.spec.ts` |
| Load Definitions | TC#58-66, 70-71 | `tests/load-definitions/load-definitions.spec.ts` |
| Report Configuration | TC#67-68 | `tests/report-configuration/report-config.spec.ts` |
| Exports | TC#69 | `tests/exports/exports.spec.ts` |

**Total: 71 test cases automated across 15 modules**

## Project Structure

```
├── pages/                    # Page Object Model classes
│   ├── LoginPage.ts
│   ├── PortalPage.ts
│   ├── DashboardPage.ts
│   ├── ManageClientsPage.ts
│   ├── ManageContextPage.ts
│   ├── ManageDefinitionsPage.ts
│   ├── HierarchyPage.ts
│   ├── TemplatesPage.ts
│   ├── PlansPage.ts
│   ├── MyWorkQueuePage.ts
│   ├── RolesAndPrivilegesPage.ts
│   ├── LoadDefinitionsPage.ts
│   ├── ReportConfigurationPage.ts
│   └── ValidationsPage.ts
├── tests/                    # Test specifications
│   ├── auth.setup.ts         # Authentication setup
│   ├── portal/
│   ├── manage-clients/
│   ├── manage-context/
│   ├── manage-definitions/
│   ├── hierarchy/
│   ├── templates/
│   ├── plans/
│   ├── my-work-queue/
│   ├── plan-lifecycle/
│   ├── rules/
│   ├── load-definitions/
│   ├── report-configuration/
│   └── exports/
├── utils/                    # Helper utilities
│   ├── helpers.ts
│   └── test-config.ts
├── fixtures/                 # Test data
│   └── test-data.json
├── playwright.config.ts      # Playwright configuration
└── .github/workflows/        # CI/CD pipeline
    └── playwright.yml
```

## Setup

### Prerequisites
- Node.js 18+ 
- Access to GxCapture Redbird application network

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install --with-deps
```

### Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `.env` with your credentials:
```env
BASE_URL=https://gxcapture-redbird-dc.galaxe.com:6500
USERNAME=your_username
PASSWORD=your_password
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests with browser visible
npm run test:headed

# Run in debug mode (step through tests)
npm run test:debug

# Run specific module
npm run test:portal
npm run test:plans
npm run test:lifecycle
npm run test:templates
npm run test:clients
npm run test:context
npm run test:definitions
npm run test:hierarchy
npm run test:workqueue
npm run test:roles
npm run test:rules
npm run test:load
npm run test:reports
npm run test:exports

# View HTML report
npm run report
```

## CI/CD

The GitHub Actions workflow runs automatically on:
- Push to `main` branch
- Pull requests to `main`
- Manual trigger (workflow_dispatch)

### Required Secrets (GitHub Repository Settings)
- `BASE_URL` - Application base URL
- `TEST_USERNAME` - Test user username
- `TEST_PASSWORD` - Test user password

## Customization

### Updating Locators
Since this framework was built without live access to the application UI, some locators may need adjustment. Each Page Object class uses multiple locator strategies (role-based, text-based, CSS selectors) with fallbacks.

To update locators:
1. Run tests in headed mode: `npm run test:headed`
2. Use Playwright Inspector: `npm run test:debug`
3. Use Playwright Codegen: `npx playwright codegen <URL>`

### Adding New Test Cases
1. Create or update the appropriate spec file in `tests/`
2. If needed, add new Page Object methods in `pages/`
3. Follow the existing pattern of `test.describe` and `test()` blocks

## Architecture

- **Page Object Model (POM)**: Each page/screen has a dedicated class encapsulating locators and actions
- **Authentication**: Shared auth state via `storageState` - login happens once, all tests reuse the session
- **Cross-browser**: Configured for Chromium and Firefox
- **Auto-retry**: Failed tests retry once with trace capture
- **Screenshots/Videos**: Captured automatically on failure
