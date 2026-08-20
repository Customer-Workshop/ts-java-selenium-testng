package example.example.tests;

import java.io.File;
import java.util.concurrent.TimeUnit;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.testng.ITestContext;
import org.testng.annotations.AfterClass;
import org.testng.annotations.AfterSuite;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.BeforeSuite;
import org.testng.annotations.Listeners;

import example.example.context.WebDriverContext;
import example.example.listeners.LogListener;
import example.example.listeners.ReportListener;
import example.example.util.LoggerUtil;
import example.example.util.MailUtil;
import example.example.util.TestProperties;
import io.github.bonigarcia.wdm.WebDriverManager;

/**
 * Every test class should extend this calss.
 *
 * @author Bharathish
 */
@Listeners({ ReportListener.class, LogListener.class })
public class BaseTest {

	/** The driver. */
	protected WebDriver driver;

	/**
	 * Global setup.
	 */
	@BeforeSuite(alwaysRun = true)
	public void globalSetup() {
		LoggerUtil.log("************************** Test Execution Started ************************************");
		TestProperties.loadAllPropertie();
	}

	/**
	 * Wrap all up.
	 *
	 * @param context the context
	 */
	@AfterSuite(alwaysRun = true)
	public void wrapAllUp(ITestContext context) {
		int total = context.getAllTestMethods().length;
		int passed = context.getPassedTests().size();
		int failed = context.getFailedTests().size();
		int skipped = context.getSkippedTests().size();
		LoggerUtil.log("Total number of testcases : " + total);
		LoggerUtil.log("Number of testcases Passed : " + passed);
		LoggerUtil.log("Number of testcases Failed : " + failed);
		LoggerUtil.log("Number of testcases Skipped  : " + skipped);
		boolean mailSent = MailUtil.sendMail(total, passed, failed, skipped);
		LoggerUtil.log("Mail sent : " + mailSent);
		LoggerUtil.log("************************** Test Execution Finished ************************************");
	}

	/**
	 * Setup.
	 */
	@BeforeClass
	protected void setup() {
		String browser = System.getProperty("browser", "chrome").toLowerCase();
		boolean headless = Boolean.parseBoolean(System.getProperty("headless", "true"));
		if ("firefox".equals(browser)) {
			driver = createFirefoxDriver(headless);
		} else {
			driver = createChromeDriver(headless);
		}
		driver.manage().window().maximize();
		driver.manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS);
		WebDriverContext.setDriver(driver);
	}

	/**
	 * Creates a Chrome driver. A driver binary provided by the environment
	 * (webdriver.chrome.driver or CHROMEWEBDRIVER) is preferred so that no
	 * download is needed; WebDriverManager is used as the fallback.
	 *
	 * @param headless whether to run without a visible browser window
	 * @return the driver
	 */
	private WebDriver createChromeDriver(boolean headless) {
		if (!resolveDriverBinary("webdriver.chrome.driver", "CHROMEWEBDRIVER", "chromedriver")) {
			WebDriverManager.chromedriver().setup();
		}
		ChromeOptions ops = new ChromeOptions();
		ops.addArguments("disable-infobars");
		if (headless) {
			ops.addArguments("--headless=new");
		}
		ops.addArguments("--no-sandbox");
		ops.addArguments("--disable-dev-shm-usage");
		ops.addArguments("--window-size=1920,1080");
		return new ChromeDriver(ops);
	}

	/**
	 * Creates a Firefox driver.
	 *
	 * @param headless whether to run without a visible browser window
	 * @return the driver
	 */
	private WebDriver createFirefoxDriver(boolean headless) {
		if (!resolveDriverBinary("webdriver.gecko.driver", "GECKOWEBDRIVER", "geckodriver")) {
			WebDriverManager.firefoxdriver().setup();
		}
		FirefoxOptions ops = new FirefoxOptions();
		if (headless) {
			ops.addArguments("-headless");
		}
		ops.addArguments("--width=1920");
		ops.addArguments("--height=1080");
		return new FirefoxDriver(ops);
	}

	/**
	 * Points the given webdriver system property at a driver binary already
	 * present on the machine, if one can be located.
	 *
	 * @param systemProperty the webdriver system property
	 * @param directoryVariable the environment variable holding the driver directory
	 * @param binaryName the driver executable name
	 * @return true when the system property is set to an existing binary
	 */
	private boolean resolveDriverBinary(String systemProperty, String directoryVariable, String binaryName) {
		String configured = System.getProperty(systemProperty);
		if (configured != null && new File(configured).isFile()) {
			return true;
		}
		String directory = System.getenv(directoryVariable);
		if (directory != null) {
			File binary = new File(directory, binaryName);
			if (binary.isFile()) {
				System.setProperty(systemProperty, binary.getAbsolutePath());
				return true;
			}
		}
		return false;
	}

	/**
	 * Wrap up.
	 */
	@AfterClass
	public void wrapUp() {
		if (driver != null) {
			// quit() closes every window and ends the session; calling close()
			// first ends the session already on single-window browsers.
			driver.quit();
		}
	}
}
