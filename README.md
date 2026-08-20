selenium-testng-framework
---

---
A sample framework based on Page Object Model, Selenium, TestNG using Java.

This framework is based in **Page Object Model (POM).**

The framework uses:

1. Java
2. Selenium
3. TestNG
4. ExtentReport
5. Log4j
6. SimpleJavaMail

Steps to create test cases:
----
Let's say we want to automate Google search test.  

1.Create GoogleSearchPage in **pages** package.  
  A page class typically should contain all the elements that are present on the page and corresponding action methods.
  
  ```
  public class GooglePage extends BasePage {
	
	@FindBy(name = "q")
	private WebElement searchinput;

	public GooglePage(WebDriver driver) {
		super(driver);
	}

	public void searchText(String key) {
		searchinput.sendKeys(key + Keys.ENTER);
	}

}
```
2.Create the test class which class the methods of GoogleSearchPage

```
@Test(testName = "Google search test", description = "Test description")
public class GoogleSearchTest extends BaseTest {

	@Test
	public void googleSearchTest() {
		driver.get("https://www.google.co.in/");
		GooglePage googlePage = PageinstancesFactory.getInstance(GooglePage.class);
		googlePage.searchText("abc");
		Assert.assertTrue(driver.getTitle().contains("abc"), "Title doesn't contain abc : Test Failed");
	}
}
```
3.Add the test class in testng.xml file under the folder `src/test/resources/suites/`

```
<suite name="Suite">
	<listeners></listeners>
	<test thread-count="5" name="Test" parallel="classes">
		<classes>
			<class name="example.example.tests.GoogleSearchTest" />
```
4.Execute the test cases by maven command `mvn clean test`

Runtime options
---

| Option | Default | Description |
| --- | --- | --- |
| `-DsuiteXmlFile=<path>` | `./src/test/resources/suites/testng.xml` | TestNG suite executed by Surefire. |
| `-Dbrowser=<chrome\|firefox>` | `chrome` | Browser started by `BaseTest`. |
| `-Dheadless=<true\|false>` | `true` | Chrome uses `--headless=new`, Firefox uses `-headless`. |

`BaseTest` uses a driver binary already present on the machine when
`webdriver.chrome.driver` / `webdriver.gecko.driver` is set or when the
`CHROMEWEBDRIVER` / `GECKOWEBDRIVER` directories exist (as on GitHub-hosted
runners and in the provided `Dockerfile`), and only falls back to a
WebDriverManager download otherwise. This keeps CI runs working without network
access to the driver mirrors.

The JDK must be 11 or newer because Selenium 4.25 ships Java 11 class files;
the produced bytecode still targets Java 8 (`maven.compiler.source/target`).

CI/CD
---

### `.github/workflows/ci.yml`

Triggers: push to `main`/`master`, pull requests, a nightly cron (02:00 UTC,
full suite on both browsers) and `workflow_dispatch`.

Manual-run inputs: `suite` (testng.xml path), `browser` (`chrome`, `firefox` or
`both`) and `thread_count` (rewritten into a copy of the suite file before the
run).

Jobs:

1. **Compile check** - `mvn -ntp -B clean test-compile` on Temurin 17 with the Maven cache.
2. **UI suite** - runs the TestNG suite headlessly on a `chrome`/`firefox` matrix, publishes the ExtentReports HTML, `logfile.log`, Surefire/TestNG results (screenshots are embedded in the Extent report as base64) and writes a pass/fail table into the job summary.
3. **Dependency vulnerability scan** - Trivy filesystem scan uploaded as SARIF, plus the resolved dependency tree as an artifact.
4. **Dependency review** - `actions/dependency-review-action` on pull requests. It needs the repository's Dependency graph enabled (Settings > Code security) and is non-blocking until then.

The suite job is deliberately non-blocking (`continue-on-error` plus
`-Dmaven.test.failure.ignore=true`): the demo tests drive public websites
(`google.co.in`, `facebook.com`) and `FaceBookLoginTest` asserts `false` on
purpose, so an outage or the intentional failure must not break CI. Point
`suite` at your own suite and remove those flags to make the suite gating.

### `.github/workflows/cd.yml`

A **mocked** AWS delivery pipeline for demos: it builds the runner container
(`Dockerfile`), "pushes" it to Amazon ECR and "runs" the suite as an ECS task in
`staging` and then `production`, finally "publishing" the Extent report to S3.

Every AWS identifier in the workflow is a placeholder and is commented as such:

| Value | Placeholder |
| --- | --- |
| Account / registry | `123456789012.dkr.ecr.us-east-1.amazonaws.com` |
| ECR repository, ECS cluster/namespace | `demo-selenium-testng` |
| ECS task definition | `demo-selenium-testng-runner` |
| Reports bucket | `s3://demo-selenium-testng-reports` |
| OIDC role | `arn:aws:iam::123456789012:role/demo-selenium-testng-github-oidc` |

Safety gate: the workflow is `workflow_dispatch`-only and runs in DRY_RUN mode
unless the `dry_run` input is `false` **and** the repository variable
`ENABLE_REAL_AWS_DEPLOY` is exactly `true`. In DRY_RUN the image is built but
nothing authenticates to AWS - the `aws` commands are printed into the job
summary instead.

### Required secrets and variables

Nothing has to be configured for the demo. To point the pipelines at real
infrastructure:

| Name | Kind | Purpose |
| --- | --- | --- |
| `ENABLE_REAL_AWS_DEPLOY` | repository variable | Must be `true` (with `dry_run=false`) before any AWS call is made. |
| `OIDC_ROLE_ARN`, `AWS_ACCOUNT_ID`, `AWS_REGION`, `ECR_REGISTRY`, `ECR_REPOSITORY`, `ECS_CLUSTER`, `ECS_TASK_DEFINITION`, `REPORTS_BUCKET` | workflow `env` (placeholders today) | Replace with real values; the OIDC role must trust this repository. |
| `GITHUB_TOKEN` | provided automatically | Used by `setup-geckodriver` and SARIF upload. |

GitHub environments `staging` and `production` must exist; add required
reviewers to `production` so the last stage waits for approval.

### `.github/dependabot.yml`

Weekly updates for Maven dependencies (Selenium/WebDriverManager grouped),
GitHub Actions and the Dockerfile base image.

---

Reproting
---
The framework gives report in three ways,

1. Log - In file `logfile.log`.
2. A html report - Which is generated using extent reports, under the folder `ExtentReports`.
3. A mail report - For which the toggle `mail.sendmail` in `test.properties` should be set `true`. And all the properties such as `smtp host, port, proxy details, etc.,` should be provided correctly.

---

Key Points:
---

1. The class `WebDriverContext` is responsible for maintaining the same WebDriver instance throughout the test. So whenever you require a webdriver instance which has been using for current test (In current thread) always call `WebDriverContext.getDriver()`.
2. Always use `PageinstancesFactory.getInstance(type)` to get the instance of particular Page Object. (Of course you can use `new` but it's better use a single approach across the framework.

---

>For any query or suggestions please do comment or mail @ diggavibharathish@gmail.com 
