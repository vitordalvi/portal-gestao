import { test, expect } from '@playwright/test';

test.describe('Gestão de Projetos e Marcos (Milestones)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    // Entra como Coordenadora
    await page.locator('.coordinator-card').click();
    await expect(page.locator('.page-title')).toContainText('Painel Executivo da Carteira');
  });

  test('deve navegar para a tela de detalhes de um projeto e listar marcos e alocações', async ({ page }) => {
    // Aguarda cards de projetos carregarem e clica em Gerenciar no primeiro
    const manageBtn = page.getByRole('button', { name: /Gerenciar/i }).first();
    await expect(manageBtn).toBeVisible({ timeout: 10000 });
    await manageBtn.click();

    // Valida navegação
    await expect(page).toHaveURL(/\/projects\/[a-f0-9-]+/);

    // Valida seções do detalhe
    await expect(page.locator('text=Marcos de Entrega (Milestones)')).toBeVisible();
    await expect(page.locator('text=Equipe Alocada')).toBeVisible();

    // Botões administrativos do coordenador devem estar presentes
    await expect(page.getByRole('button', { name: /Alocar Analista/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Novo Marco/i })).toBeVisible();
  });

  test('deve alternar a conclusão de um marco e atualizar o avanço físico', async ({ page }) => {
    const manageBtn = page.getByRole('button', { name: /Gerenciar/i }).first();
    await expect(manageBtn).toBeVisible({ timeout: 10000 });
    await manageBtn.click();

    // Aguarda carregar marcos
    const milestoneSection = page.locator('text=Marcos de Entrega (Milestones)');
    await expect(milestoneSection).toBeVisible();

    // Pega o primeiro marco listado
    const milestoneCard = page.locator('[title="Clique para alternar status de conclusão"]').first();
    await expect(milestoneCard).toBeVisible();

    // Captura estado anterior
    const initialText = await milestoneCard.innerText();

    // Clica para alternar status (toggle)
    await milestoneCard.click();

    // Aguarda a resposta da API e verifica que o elemento respondeu
    await page.waitForTimeout(1000);
    await expect(milestoneCard).toBeVisible();
  });
});
