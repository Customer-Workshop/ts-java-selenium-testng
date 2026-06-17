package example.example.listeners;

import org.testng.ISuite;
import org.testng.ISuiteListener;
import org.testng.ISuiteResult;
import org.testng.ITestContext;

import example.example.util.LoggerUtil;
import example.example.util.MailUtil;
import example.example.util.TestProperties;

/**
 * Suite-level listener that loads global properties before the suite runs and,
 * once the whole suite has finished, logs an execution summary and emails the
 * report. This replaces the former {@code @BeforeSuite}/{@code @AfterSuite}
 * hooks in {@code BaseTest}: TestNG 7 no longer supports native parameter
 * injection into {@code @AfterSuite} methods, and a suite listener guarantees
 * the summary runs exactly once per suite while aggregating results across every
 * {@code <test>} tag.
 */
public class SuiteSummaryListener implements ISuiteListener {

	@Override
	public void onStart(ISuite suite) {
		LoggerUtil.log("************************** Test Execution Started ************************************");
		TestProperties.loadAllPropertie();
	}

	@Override
	public void onFinish(ISuite suite) {
		int total = 0;
		int passed = 0;
		int failed = 0;
		int skipped = 0;
		for (ISuiteResult result : suite.getResults().values()) {
			ITestContext context = result.getTestContext();
			total += context.getAllTestMethods().length;
			passed += context.getPassedTests().size();
			failed += context.getFailedTests().size();
			skipped += context.getSkippedTests().size();
		}
		LoggerUtil.log("Total number of testcases : " + total);
		LoggerUtil.log("Number of testcases Passed : " + passed);
		LoggerUtil.log("Number of testcases Failed : " + failed);
		LoggerUtil.log("Number of testcases Skipped  : " + skipped);
		boolean mailSent = MailUtil.sendMail(total, passed, failed, skipped);
		LoggerUtil.log("Mail sent : " + mailSent);
		LoggerUtil.log("************************** Test Execution Finished ************************************");
	}

}
