import { useEffect, useRef } from 'react';

interface UseModalA11yOptions {
  isOpen: boolean;
  onClose: () => void;
  disabled?: boolean;
}

const FOCUSABLE_SELECTOR = [
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'a[href]',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * Hook de acessibilidade para modais (WCAG 2.1 / WAI-ARIA Modal Pattern).
 * - Fecha o modal ao pressionar a tecla Escape (Esc)
 * - Foca automaticamente no primeiro campo editável ao abrir o modal
 * - Prende e cicla a navegação por TAB/Shift+TAB exclusivamente dentro do modal (Focus Trap)
 * - Restaura o foco para o botão original ao fechar
 * - Trava a rolagem do fundo (body scroll lock) enquanto o modal estiver aberto
 * - Permite fechar ao clicar no backdrop (overlay)
 */
export function useModalA11y({ isOpen, onClose, disabled = false }: UseModalA11yOptions) {
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Foco inicial ao abrir e restauração de foco ao fechar
  useEffect(() => {
    if (!isOpen) return;

    // Salva o elemento que disparou a abertura do modal
    triggerRef.current = document.activeElement as HTMLElement | null;

    // Move o foco para dentro do modal após montagem no DOM
    const focusTimer = setTimeout(() => {
      if (!modalRef.current) return;

      // 1. Tenta focar no primeiro campo de formulário editável (input, select, textarea)
      const firstInput = modalRef.current.querySelector<HTMLElement>(
        'input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled])'
      );

      if (firstInput) {
        firstInput.focus();
      } else {
        // 2. Se não houver campos de input (ex: confirmações de exclusão), foca no primeiro elemento interativo
        const firstFocusable = modalRef.current.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
        firstFocusable?.focus();
      }
    }, 40);

    return () => {
      clearTimeout(focusTimer);
      // Ao fechar, devolve o foco ao elemento disparador da página
      if (triggerRef.current && typeof triggerRef.current.focus === 'function') {
        triggerRef.current.focus();
      }
    };
  }, [isOpen]);

  // Teclado: ESC (fechar) e TAB (Focus Trap restrito aos elementos do modal)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // 1. ESC para fechar
      if (event.key === 'Escape' && !disabled) {
        event.preventDefault();
        onClose();
        return;
      }

      // 2. TAB / Shift+TAB: Prende o ciclo de foco exclusivamente dentro do modal
      if (event.key === 'Tab') {
        if (!modalRef.current) return;

        // Coleta todos os elementos focáveis visíveis no modal
        const focusable = Array.from(
          modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        ).filter(el => {
          return el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0;
        });

        if (focusable.length === 0) {
          event.preventDefault();
          return;
        }

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        // Se o foco estiver fora do modal, traz de volta para o primeiro ou último
        if (!modalRef.current.contains(document.activeElement)) {
          event.preventDefault();
          if (event.shiftKey) {
            lastElement.focus();
          } else {
            firstElement.focus();
          }
          return;
        }

        if (event.shiftKey) {
          // Shift + Tab: se estiver no primeiro elemento, move para o último
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: se estiver no último elemento, move de volta para o primeiro
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    // Bloqueia rolagem do body enquanto o modal estiver aberto
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
    modalRef,
    handleOverlayClick,
    overlayProps: {
      ref: modalRef,
      onClick: handleOverlayClick,
      role: 'dialog' as const,
      'aria-modal': true as const,
    },
  };
}
