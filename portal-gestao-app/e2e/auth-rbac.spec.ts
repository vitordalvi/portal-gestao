import { test, expect } from '@playwright/test';

test.describe('Controle de Acessos e Governança (RBAC)', () => {
  test.beforeEach(async ({ page }) => {
    // Limpa localStorage para garantir estado deslogado
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('deve exibir a tela de login inicial com as opções de persona', async ({ page }) => {
    await expect(page.locator('.login-title')).toContainText('Acesse o Portal de Gestão');
    await expect(page.locator('.coordinator-card')).toBeVisible();
    await expect(page.locator('.analyst-card')).toBeVisible();
  });

  test('deve fazer login como Coordenadora e exibir métricas executivas e financeiras', async ({ page }) => {
    // Login como Coordenadora
    await page.locator('.coordinator-card').click();

    // Valida Header Executivo
    await expect(page.locator('.page-title')).toContainText('Painel Executivo da Carteira');

    // Valida presença de métricas financeiras (exclusivas de cargos superiores)
    const marginCard = page.locator('.kpi-card', { hasText: 'Margem Contratual' });
    await expect(marginCard).toBeVisible();
    await expect(marginCard).toContainText('R$');

    // Valida botão de criação de projeto
    const newProjectBtn = page.getByRole('button', { name: /Novo Projeto/i });
    await expect(newProjectBtn).toBeVisible();

    // Valida itens de menu da coordenação na Sidebar
    await expect(page.locator('.sidebar-nav')).toContainText('Projetos');
    await expect(page.locator('.sidebar-nav')).toContainText('Analistas');
    await expect(page.locator('.sidebar-nav')).toContainText('Agenda');
  });

  test('deve fazer login como Analista e ocultar estritamente métricas financeiras e de gestão', async ({ page }) => {
    // Login como Analista
    await page.locator('.analyst-card').click();

    // Valida Header do Analista
    await expect(page.locator('.page-title')).toContainText('Painel do Consultor');

    // Garante que o card de Margem Financeira NÃO está presente
    const marginCard = page.locator('.kpi-card', { hasText: 'Margem Contratual' });
    await expect(marginCard).not.toBeVisible();

    // Garante que o botão de criar novos projetos NÃO está acessível
    const newProjectBtn = page.getByRole('button', { name: /Novo Projeto/i });
    await expect(newProjectBtn).not.toBeVisible();

    // Garante que menus de gestão NÃO aparecem na sidebar
    await expect(page.locator('.sidebar-nav')).not.toContainText('Analistas');
    await expect(page.locator('.sidebar-nav')).not.toContainText('Agenda');
    await expect(page.locator('.sidebar-nav')).toContainText('Meus Apontamentos');
  });

  test('deve permitir deslogar e alternar de usuário pela sidebar', async ({ page }) => {
    await page.locator('.coordinator-card').click();
    await expect(page.locator('.page-title')).toBeVisible();

    // Clica no botão de trocar usuário
    await page.locator('.btn-switch-user').click();

    // Retorna para a tela de login
    await expect(page.locator('.login-title')).toContainText('Acesse o Portal de Gestão');
  });
});
