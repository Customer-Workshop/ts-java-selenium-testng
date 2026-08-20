# CI/CD

Three GitHub Actions workflows. This repository is a Selenium/TestNG **test harness**, not a
deployable service, so "deployment" means shipping the harness image and publishing its
reports — not running a long-lived service.

| Workflow | File | Triggers | What it does |
| --- | --- | --- | --- |
| CI | `.github/workflows/ci.yml` | push to `main`, pull_request to `main` | `mvn verify -DskipTests`, POM/plugin resolution, suite-XML lint, then the headless smoke suite. Uploads jar, ExtentReports HTML, surefire/TestNG output. |
| Nightly | `.github/workflows/nightly.yml` | cron `30 2 * * *`, `workflow_dispatch` | Full `suites/testng.xml` in headless Chrome; publishes report artifacts (30-day retention). |
| CD (mock AWS) | `.github/workflows/cd.yml` | push to `main`, `workflow_dispatch` (`environment` input) | Builds the harness container, "pushes" to ECR, registers/runs an ECS Fargate task, syncs reports to S3 — staging first, then production behind a manual approval gate. |

Common standards: `concurrency` groups per workflow/ref, `~/.m2` caching via
`actions/setup-java` (`cache: maven`), least-privilege `permissions:` (`contents: read`,
plus `id-token: write` only on deploy jobs), and pinned action versions.

## Java / suite configuration

`pom.xml` targets Java **1.8** bytecode (`maven.compiler.source/target`), but Selenium 4.25
requires a JDK 11+ toolchain, so CI builds on **Temurin 21** (matching the sandbox where this
was validated) while still emitting 1.8 bytecode. Surefire's default suite is
`src/test/resources/suites/testng.xml`; CI overrides it with `-Dsurefire.suiteXmlFiles=...`.

### Suite scoping (why CI is smoke-scoped)

The committed suite contains two classes:

- `GoogleSearchTest` — drives `google.co.in`, passes headlessly (verified locally).
- `FaceBookLoginTest` — drives `facebook.com` and ends with `Assert.assertTrue(false, ...)`,
  i.e. it **always fails by design** (demo content), and the login markup it targets no
  longer exists.

So a full `mvn test` is expected to end in BUILD FAILURE. To keep a red CI check meaningful,
PR/push CI runs `src/test/resources/suites/smoke.xml` (added by this setup — `GoogleSearchTest`
only) with **no** `continue-on-error`. The nightly workflow runs the full suite and marks only
that one step `continue-on-error: true`, with an inline comment explaining the known failure;
its artifacts and job summary carry the real result. Remove that flag once the demo failure is
fixed or the external target is stubbed.

Both jobs reach public internet targets (Google/Facebook), which GitHub-hosted runners can
do; results still depend on those third-party sites, so treat nightly failures as
"investigate the external target first".

### Driver resolution in CI

`browser-actions/setup-chrome` installs Chrome **and** a matching chromedriver; the driver
path is passed to Maven as `-Dwebdriver.chrome.driver` / `-Dwdm.chromeDriverPath`, so
WebDriverManager uses the local binary instead of downloading one — the run works without
egress to the driver CDN. The container image (`Dockerfile`) bakes Chrome in for the same
reason and runs Maven offline (`-o`) against a pre-warmed `~/.m2`.

## MOCK AWS configuration — nothing here is real

**All AWS identifiers are placeholders.** Account `123456789012`, roles
`arn:aws:iam::123456789012:role/demo-*`, ECR repo `demo/selenium-testng-harness`, clusters
`demo-staging-cluster` / `demo-prod-cluster`, bucket `demo-mock-test-reports`, region
`us-east-1`, namespaces `demo-staging` / `demo-prod`, subnets/SGs `subnet-0abc…`/`sg-0abc…`.

The kill switch is the repository variable **`AWS_MOCK_MODE`** (default `true` when unset):

- `true` — no credentials are configured, no ECR login happens, and every push/deploy/S3
  step prints `MOCK MODE — would run: …` and exits 0. The container image is still built for
  real and uploaded as a workflow artifact, so the pipeline is genuinely exercised.
- `false` — the real `aws-actions/configure-aws-credentials` OIDC assumption, ECR login,
  `docker push`, `aws ecs register-task-definition` / `run-task`, and `aws s3 sync` execute.

There are **no long-lived AWS keys anywhere**: authentication is GitHub OIDC role assumption
(`id-token: write` on the deploy jobs only).

### Actions variables (Settings → Secrets and variables → Actions → Variables)

| Variable | Mock default | Notes |
| --- | --- | --- |
| `AWS_MOCK_MODE` | `true` | Set to `false` to actually talk to AWS. |
| `AWS_REGION` | `us-east-1` | |
| `AWS_ACCOUNT_ID` | `123456789012` | |
| `ECR_REPOSITORY` | `demo/selenium-testng-harness` | Must exist before a real push. |
| `REPORTS_BUCKET` | `demo-mock-test-reports` | Report destination for `aws s3 sync`. |
| `AWS_ROLE_ARN_STAGING` / `AWS_ROLE_ARN_PRODUCTION` | `arn:aws:iam::123456789012:role/demo-{staging,prod}-github-oidc` | Role trusted for this repo's OIDC subject. |
| `TASK_EXECUTION_ROLE_ARN_STAGING` / `_PRODUCTION` | `arn:aws:iam::123456789012:role/demo-ecsTaskExecutionRole` | ECS task execution role. |
| `ECS_CLUSTER_STAGING` / `ECS_CLUSTER_PRODUCTION` | `demo-staging-cluster` / `demo-prod-cluster` | |
| `ECS_TASK_FAMILY_STAGING` / `_PRODUCTION` | `demo-{staging,prod}-selenium-harness` | |
| `ECS_SUBNETS_STAGING` / `_PRODUCTION` | `subnet-0abc123456789def0` / `subnet-0fed987654321cba0` | Comma-separated. |
| `ECS_SECURITY_GROUPS_STAGING` / `_PRODUCTION` | `sg-0abc123456789def0` / `sg-0fed987654321cba0` | Comma-separated. |

No repository **secrets** are required — OIDC replaces them. (The harness's optional email
reporting via `simple-java-mail` would need SMTP settings in `src/test/resources/config/test.properties`;
supply those as secrets if you enable it.)

### GitHub Environments

Create two environments:

- `staging` — no reviewers required (add some if you want a gate there too).
- `production` — **required reviewers** configured. This is the manual approval gate: the
  promotion job queues until an approver releases it. Promotion re-tags the exact image that
  staging validated (`prod-<sha>`); it never rebuilds.

## Going from mock to real

1. Create the ECR repo, ECS cluster(s) (or an EKS cluster with namespaces `demo-staging`/`demo-prod`),
   the reports S3 bucket, and CloudWatch log group `/demo/selenium-testng-harness`.
2. Create the two IAM roles with a GitHub OIDC trust policy scoped to this repository and the
   `staging` / `production` environments; grant only ECR push, `ecs:RegisterTaskDefinition`,
   `ecs:RunTask`, `iam:PassRole` for the task roles, and `s3:PutObject` on the bucket prefix.
3. Set all the variables above to real values and flip `AWS_MOCK_MODE` to `false`.
4. Configure required reviewers on the `production` environment.
5. Review `deploy/ecs-task-definition.json` (cpu/memory, log group, `SUITE_FILE`).

## Dependabot

`.github/dependabot.yml` tracks Maven dependencies, GitHub Actions versions, and the
Dockerfile base images weekly.
