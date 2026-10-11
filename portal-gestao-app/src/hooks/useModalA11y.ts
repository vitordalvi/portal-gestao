import { useEffect } from 'react';

interface UseModalA11yOptions {
  isOpen: boolean;
  onClose: () => void;
  disabled?: boolean;
}

/**
 * Hook de acessibilidade para modais (WCAG / WAI-ARIA).
 * - Fecha o modal ao pressionar a tecla Escape (Esc)
 * - Permite fechar ao clicar no backdrop (overlay)
 * - Trava a rolagem do fundo (body scroll lock) enquanto o modal estiver aberto
 */
export function useModalA11y({ isOpen, onClose, disabled = false }: UseModalA11yOptions) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !disabled) {
        event.preventDefault();
        onClose();
      }
    };

    // Bloqueia a rolagem do corpo da página enquanto o modal estiver aberto
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, disabled]);

  /**
   * Fecha o modal ao clicar diretamente no fundo/backdrop,
   * evitando fechar se o clique ocorreu dentro do conteúdo (.modal-content).
   */
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !disabled) {
      onClose();
    }
  };

  return {
    handleOverlayClick,
    overlayProps: {
      onClick: handleOverlayClick,
      role: 'dialog' as const,
      'aria-modal': true as const,
    },
  };
}
