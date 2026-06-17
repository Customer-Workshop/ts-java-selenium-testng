package example.example.tests;

import java.time.Duration;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Listeners;

import example.example.context.WebDriverContext;
import example.example.listeners.LogListener;
import example.example.listeners.ReportListener;
import example.example.listeners.SuiteSummaryListener;
import io.github.bonigarcia.wdm.WebDriverManager;

/**
 * Every test class should extend this calss.
 *
 * @author Bharathish
 */
@Listeners({ ReportListener.class, LogListener.class, SuiteSummaryListener.class })
public class BaseTest {

	/** The driver. */
	protected WebDriver driver;

	/**
	 * Setup.
	 */
	@BeforeClass
	protected void setup() {
//		System.setProperty("webdriver.chrome.driver", Constants.CHROME_DRIVER_PATH);
		WebDriverManager.chromedriver().setup();
		ChromeOptions ops = new ChromeOptions();
		ops.addArguments("disable-infobars");
		ops.addArguments("--headless");
		ops.addArguments("--no-sandbox");
		ops.addArguments("--disable-dev-shm-usage");
		driver = new ChromeDriver(ops);
		driver.manage().window().maximize();
		driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
		WebDriverContext.setDriver(driver);
	}

	/**
	 * Wrap up.
	 */
	@AfterClass
	public void wrapUp() {
		if (driver != null) {
			driver.close();
			driver.quit();
		}
	}
}
