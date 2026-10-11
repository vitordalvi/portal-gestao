import { test, expect } from '@playwright/test';

test.describe('Modal de Apontamento de Horas (Time Entry)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    // Entra como Coordenadora
    await page.locator('.coordinator-card').click();
    await expect(page.locator('.page-title')).toContainText('Painel Executivo da Carteira');
  });

  test('deve abrir o modal de lançamento de horas, testar chips rápidos e cancelar', async ({ page }) => {
    // Clica no botão de Lançar Horas no header
    await page.getByRole('button', { name: /Lançar Horas/i }).click();

    // Modal deve ser exibido com título e novos componentes visuais
    await expect(page.locator('.modal-title')).toContainText('Apontamento de Horas');
    await expect(page.locator('.quick-chips-row')).toBeVisible();

    // Testa os chips rápidos de horas
    const chip2h = page.locator('.quick-chip', { hasText: '2.0h' });
    await expect(chip2h).toBeVisible();
    await chip2h.click();

    // O input de horas deve receber '2.0'
    const hoursInput = page.locator('input[placeholder="Ex: 4.0"]');
    await expect(hoursInput).toHaveValue('2.0');

    // Preenche a descrição
    const textarea = page.locator('textarea');
    await textarea.fill('Análise de requisitos e documentação E2E');
    await expect(textarea).toHaveValue('Análise de requisitos e documentação E2E');

    // Clica em Cancelar
    await page.locator('.btn-modal-cancel').click();

    // Modal deve fechar
    await expect(page.locator('.modal-overlay')).not.toBeVisible();
  });

  test('deve abrir o modal a partir do card específico de um projeto', async ({ page }) => {
    // Aguarda carregar os cards e clica em Apontar no primeiro projeto
    const cardApontarBtn = page.getByRole('button', { name: /Apontar/i }).first();
    await expect(cardApontarBtn).toBeVisible({ timeout: 10000 });
    await cardApontarBtn.click();

    // Valida que o modal abriu
    await expect(page.locator('.modal-title')).toContainText('Apontamento de Horas');

    // Fecha usando o botão "X" do cabeçalho
    await page.locator('.modal-close-btn').click();
    await expect(page.locator('.modal-overlay')).not.toBeVisible();
  });
});
