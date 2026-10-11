import { test, expect } from '@playwright/test';

test.describe('Responsividade e Mobile Drawer', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // Simula smartphone (iPhone SE)

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('deve renderizar a tela de login adaptada ao mobile sem estouro horizontal', async ({ page }) => {
    // Verifica que a página de login está visível
    await expect(page.locator('.login-title')).toBeVisible();
    await expect(page.locator('.coordinator-card')).toBeVisible();

    // Verifica se não há rolagem horizontal acidental no body
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowInnerWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(windowInnerWidth + 1);
  });

  test('deve exibir barra superior mobile, abrir e fechar drawer da sidebar', async ({ page }) => {
    // Login como Coordenadora
    await page.locator('.coordinator-card').click();
    await expect(page.locator('.page-title')).toBeVisible();

    // A barra mobile-topbar deve estar visível
    const mobileTopbar = page.locator('.mobile-topbar');
    await expect(mobileTopbar).toBeVisible();

    // A sidebar deve estar escondida inicialmente no viewport mobile (fora da tela)
    const sidebar = page.locator('aside.sidebar');
    await expect(sidebar).not.toHaveClass(/mobile-open/);

    // Clica no botão de abrir menu
    const menuBtn = page.locator('.mobile-menu-btn');
    await menuBtn.click();

    // Agora a sidebar deve ter a classe mobile-open e backdrop deve estar visível
    await expect(sidebar).toHaveClass(/mobile-open/);
    const backdrop = page.locator('.sidebar-backdrop');
    await expect(backdrop).toBeVisible();

    // Clica em um link de navegação para Projetos e verifica que fecha a sidebar automaticamente
    const projectsLink = page.locator('nav.sidebar-nav a[href="/projects"]');
    await projectsLink.click();

    // Deve navegar para a página de projetos e fechar a sidebar
    await expect(page).toHaveURL(/.*projects/);
    await expect(sidebar).not.toHaveClass(/mobile-open/);
  });

  test('deve renderizar tabelas e KPIs com rolagem adequada sem quebrar layout em mobile', async ({ page }) => {
    // Login como Coordenadora
    await page.locator('.coordinator-card').click();
    await expect(page.locator('.page-title')).toBeVisible();

    // Verifica os KPIs
    const kpiGrid = page.locator('.kpi-grid');
    await expect(kpiGrid).toBeVisible();

    // Verifica o container de tabela com scroll horizontal habilitado
    const tableContainer = page.locator('.data-table-container');
    if (await tableContainer.count() > 0) {
      await expect(tableContainer).toBeVisible();
      const hasOverflowX = await tableContainer.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.overflowX === 'auto' || style.overflowX === 'scroll';
      });
      expect(hasOverflowX).toBe(true);
    }
  });

  test('modal de lançamento de horas deve caber confortavelmente na tela mobile', async ({ page }) => {
    await page.locator('.coordinator-card').click();
    await expect(page.locator('.page-title')).toBeVisible();

    // Abre o modal de lançamento de horas
    const logHoursBtn = page.getByRole('button', { name: /Lançar Horas/i }).first();
    await logHoursBtn.click();

    const modalContent = page.locator('.modal-content');
    await expect(modalContent).toBeVisible();

    // Verifica se os botões de ação do modal estão visíveis
    const submitBtn = modalContent.getByRole('button', { name: /Confirmar Apontamento/i });
    await expect(submitBtn).toBeVisible();

    const cancelBtn = modalContent.getByRole('button', { name: /Cancelar/i });
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click();

    await expect(modalContent).not.toBeVisible();
  });
});
