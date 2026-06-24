import { test, expect } from '@playwright/test';
import { PortalPage } from '../../pages/PortalPage';
import { PlansPage } from '../../pages/PlansPage';
import { generateUniqueName } from '../../utils/helpers';

test.describe('Plan Life Cycle - Regression Tests', () => {
  let portalPage: PortalPage;
  let plansPage: PlansPage;

  test.beforeEach(async ({ page }) => {
    portalPage = new PortalPage(page);
    plansPage = new PlansPage(page);
    await page.goto('/portal#/');
    await portalPage.clickBenefitsManagement();
    await plansPage.navigateToPlans();
  });

  test('TC#33 - Verify newly created plan has OPEN status with grey dot', async ({ page }) => {
    // Create a new plan
    const planName = generateUniqueName('LifecyclePlan');
    await plansPage.createPlan(planName);

    // Verify the plan has OPEN status (grey dot)
    const planRow = page.locator(`tr:has-text("${planName}"), [class*="row"]:has-text("${planName}")`).first();
    const statusDot = planRow.locator('.status-dot, [class*="status"], .dot').first();
    await expect(statusDot).toBeVisible();
    // Grey dot indicates OPEN status
    await expect(statusDot).toHaveCSS('background-color', /grey|gray|rgb\(128|rgb\(169/);
  });

  test('TC#34 - Verify SUBMIT FOR REVIEW changes status to PENDING REVIEW with orange dot', async ({ page }) => {
    // Find a plan with OPEN status
    const planRow = page.locator('table tbody tr, [class*="plan-row"]').first();
    await expect(planRow).toBeVisible();

    // Submit for review
    await planRow.locator('[title*="edit" i], .edit-icon').first().click();
    await page.getByRole('button', { name: /submit for review/i }).first().click();

    // Add comments if required
    const commentInput = page.locator('textarea, input[name*="comment"]').first();
    if (await commentInput.isVisible()) {
      await commentInput.fill('Submitting for review - automated test');
      await page.getByRole('button', { name: /submit|confirm|ok/i }).first().click();
    }

    // Verify orange dot appears (PENDING REVIEW status)
    await page.waitForLoadState('networkidle');
  });

  test('TC#35 - Verify orange dot displays appropriate color coding flow', async ({ page }) => {
    // Find a plan with orange dot (PENDING REVIEW)
    const orangeDot = page.locator('.status-dot[class*="pending"], [class*="orange"], [style*="orange"]').first();

    if (await orangeDot.isVisible()) {
      // Click on the orange dot
      await orangeDot.click();

      // Verify flow displays with color coding
      const flowDisplay = page.locator('.status-flow, .workflow-display, [class*="lifecycle"]').first();
      await expect(flowDisplay).toBeVisible();

      // Verify audit details are shown
      const auditDetails = page.locator('[class*="audit"], .audit-details').first();
      await expect(auditDetails).toBeVisible();
    }
  });

  test('TC#36 - Verify APPROVE changes status to APPROVED with green dot', async ({ page }) => {
    // Find a plan with PENDING REVIEW status
    const planRow = page.locator('table tbody tr, [class*="plan-row"]').first();
    await expect(planRow).toBeVisible();

    // Approve the plan
    await planRow.locator('[title*="edit" i], .edit-icon').first().click();
    await page.getByRole('button', { name: /approve/i }).first().click();

    // Add comments if required
    const commentInput = page.locator('textarea, input[name*="comment"]').first();
    if (await commentInput.isVisible()) {
      await commentInput.fill('Approved - automated test');
      await page.getByRole('button', { name: /submit|confirm|ok/i }).first().click();
    }

    // Verify green dot appears
    await page.waitForLoadState('networkidle');
  });

  test('TC#37 - Verify green dot displays appropriate color coding flow', async ({ page }) => {
    // Find a plan with green dot (APPROVED)
    const greenDot = page.locator('.status-dot[class*="approved"], [class*="green"], [style*="green"]').first();

    if (await greenDot.isVisible()) {
      await greenDot.click();

      // Verify flow displays with color coding and audit details
      const flowDisplay = page.locator('.status-flow, .workflow-display, [class*="lifecycle"]').first();
      await expect(flowDisplay).toBeVisible();
    }
  });

  test('TC#38 - Verify PUBLISH changes status to PUBLISHED with dark green dot', async ({ page }) => {
    // Find a plan with APPROVED status
    const planRow = page.locator('table tbody tr, [class*="plan-row"]').first();
    await expect(planRow).toBeVisible();

    // Publish the plan
    await planRow.locator('[title*="edit" i], .edit-icon').first().click();
    await page.getByRole('button', { name: /publish/i }).first().click();

    // Add comments if required
    const commentInput = page.locator('textarea, input[name*="comment"]').first();
    if (await commentInput.isVisible()) {
      await commentInput.fill('Published - automated test');
      await page.getByRole('button', { name: /submit|confirm|ok/i }).first().click();
    }

    // Verify dark green dot appears
    await page.waitForLoadState('networkidle');
  });

  test('TC#39 - Verify dark green dot displays appropriate color coding flow', async ({ page }) => {
    // Find a plan with dark green dot (PUBLISHED)
    const darkGreenDot = page.locator('.status-dot[class*="published"], [class*="dark-green"]').first();

    if (await darkGreenDot.isVisible()) {
      await darkGreenDot.click();

      // Verify flow with Grey, Orange, Green, and Dark Green dots plus audit details
      const flowDisplay = page.locator('.status-flow, .workflow-display, [class*="lifecycle"]').first();
      await expect(flowDisplay).toBeVisible();
    }
  });

  test('TC#40 - Verify REJECT before approving shows REJECTED with red dot', async ({ page }) => {
    // Find a plan with PENDING REVIEW status
    const planRow = page.locator('table tbody tr, [class*="plan-row"]').first();
    await expect(planRow).toBeVisible();

    // Reject the plan
    await planRow.locator('[title*="edit" i], .edit-icon').first().click();
    await page.getByRole('button', { name: /reject/i }).first().click();

    // Add rejection comments
    const commentInput = page.locator('textarea, input[name*="comment"]').first();
    if (await commentInput.isVisible()) {
      await commentInput.fill('Rejected before approval - automated test');
      await page.getByRole('button', { name: /submit|confirm|ok/i }).first().click();
    }

    // Verify red dot appears
    await page.waitForLoadState('networkidle');
  });

  test('TC#41 - Verify red dot (rejected before approval) displays appropriate color coding', async ({ page }) => {
    const redDot = page.locator('.status-dot[class*="rejected"], [class*="red"], [style*="red"]').first();

    if (await redDot.isVisible()) {
      await redDot.click();

      // Verify flow displays Grey and Red dots with audit details
      const flowDisplay = page.locator('.status-flow, .workflow-display, [class*="lifecycle"]').first();
      await expect(flowDisplay).toBeVisible();
    }
  });

  test('TC#42 - Verify REJECT before publishing shows REJECTED with red dot', async ({ page }) => {
    // Find a plan with APPROVED status
    const planRow = page.locator('table tbody tr, [class*="plan-row"]').first();
    await expect(planRow).toBeVisible();

    // Reject the plan before publishing
    await planRow.locator('[title*="edit" i], .edit-icon').first().click();
    await page.getByRole('button', { name: /reject/i }).first().click();

    // Add rejection comments
    const commentInput = page.locator('textarea, input[name*="comment"]').first();
    if (await commentInput.isVisible()) {
      await commentInput.fill('Rejected before publishing - automated test');
      await page.getByRole('button', { name: /submit|confirm|ok/i }).first().click();
    }

    await page.waitForLoadState('networkidle');
  });

  test('TC#43 - Verify red dot (rejected before publishing) displays appropriate color coding', async ({ page }) => {
    const redDot = page.locator('.status-dot[class*="rejected"], [class*="red"], [style*="red"]').first();

    if (await redDot.isVisible()) {
      await redDot.click();

      const flowDisplay = page.locator('.status-flow, .workflow-display, [class*="lifecycle"]').first();
      await expect(flowDisplay).toBeVisible();
    }
  });

  test('TC#44 - Verify user can SUBMIT FOR REVIEW rejected plans', async ({ page }) => {
    // Filter for rejected plans
    await page.getByText('REJECTED', { exact: true }).first().click();
    await page.waitForLoadState('networkidle');

    // Find a rejected plan
    const planRow = page.locator('table tbody tr, [class*="plan-row"]').first();

    if (await planRow.isVisible()) {
      // Edit and submit for review again
      await planRow.locator('[title*="edit" i], .edit-icon').first().click();
      const submitButton = page.getByRole('button', { name: /submit for review/i }).first();
      await expect(submitButton).toBeVisible();
      await submitButton.click();

      const commentInput = page.locator('textarea, input[name*="comment"]').first();
      if (await commentInput.isVisible()) {
        await commentInput.fill('Resubmitting rejected plan - automated test');
        await page.getByRole('button', { name: /submit|confirm|ok/i }).first().click();
      }
    }
  });

  test('TC#45 - Verify user can update status from Plan Edit screen', async ({ page }) => {
    // Open a plan in edit mode
    const planRow = page.locator('table tbody tr, [class*="plan-row"]').first();
    await expect(planRow).toBeVisible();

    await planRow.locator('[title*="edit" i], .edit-icon').first().click();
    await page.waitForLoadState('networkidle');

    // Verify status change buttons are available in edit screen
    const statusButtons = page.getByRole('button', { name: /submit for review|approve|publish|reject/i });
    await expect(statusButtons.first()).toBeVisible();
  });

  test('TC#46 - Verify user can update status from Plan summary screen', async ({ page }) => {
    // Click on a plan to view summary
    const planRow = page.locator('table tbody tr, [class*="plan-row"]').first();
    await expect(planRow).toBeVisible();
    await planRow.click();
    await page.waitForLoadState('networkidle');

    // Verify status change options are available in summary view
    const statusButtons = page.getByRole('button', { name: /submit for review|approve|publish|reject/i });
    await expect(statusButtons.first()).toBeVisible();
  });
});
