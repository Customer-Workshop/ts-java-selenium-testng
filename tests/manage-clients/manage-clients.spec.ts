import { test, expect } from '@playwright/test';
import { PortalPage } from '../../pages/PortalPage';
import { ManageClientsPage } from '../../pages/ManageClientsPage';
import { generateUniqueName } from '../../utils/helpers';

test.describe('Manage Clients - Regression Tests', () => {
  let portalPage: PortalPage;
  let clientsPage: ManageClientsPage;

  test.beforeEach(async ({ page }) => {
    portalPage = new PortalPage(page);
    clientsPage = new ManageClientsPage(page);
    await page.goto('/portal#/');
    await portalPage.clickBenefitsManagement();
  });

  test('TC#4 - Verify that user is able to ADD new Client', async ({ page }) => {
    // Navigate to Manage Clients
    await clientsPage.navigateToManageClients();

    // Add a new client
    const clientName = generateUniqueName('TestClient');
    await clientsPage.addNewClient(clientName);

    // Verify client was added
    await clientsPage.verifyClientExists(clientName);
  });

  test('TC#5 - Verify that user is able to Edit an existing Client', async ({ page }) => {
    // Navigate to Manage Clients
    await clientsPage.navigateToManageClients();

    // First create a client to edit
    const originalName = generateUniqueName('EditClient');
    await clientsPage.addNewClient(originalName);

    // Edit the client
    const newName = generateUniqueName('EditedClient');
    await clientsPage.editClient(originalName, { name: newName });

    // Verify the edit was saved
    await clientsPage.verifyClientExists(newName);
  });
});
