import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { getStatusBadgeClass } from '../utils/format';
import './HealthBadge.css';

/**
 * Propriedades do componente HealthBadge.
 */
interface HealthBadgeProps {
  /** Situação consolidada da saúde do projeto ('Saudável' | 'Atenção' | 'Crítico') */
  status: 'Saudável' | 'Atenção' | 'Crítico';
  /** Lista opcional de diagnósticos objetivos calculados pelo Rich Domain Model no backend */
  reasons?: string[];
  /** Alinhamento horizontal preferencial do popover ('left' | 'center' | 'right') */
  align?: 'left' | 'center' | 'right';
  /** Posicionamento vertical preferencial ('bottom' | 'top') */
  placement?: 'bottom' | 'top';
  /** Indica se deve renderizar o ícone semântico ao lado do texto */
  showIcon?: boolean;
}

/**
 * Componente que exibe uma badge colorida com o status de saúde do projeto e,
 * ao passar o cursor (hover), abre um popover detalhado com o diagnóstico.
 * 
 * Principais características arquiteturais:
 * - Renderização via React Portal (`createPortal`) no `document.body` para evitar cortes por `overflow: hidden` ou z-index de tabelas;
 * - Auto-flip inteligente: detecta dinamicamente a distância da borda inferior da viewport e inverte para cima quando necessário;
 * - Tolerância a mouseleave com delay de 120ms para permitir interação com o popover sem fechamentos indesejados.
 */
export const HealthBadge: React.FC<HealthBadgeProps> = ({
  status,
  reasons = [],
  align = 'center',
  placement = 'bottom',
  showIcon = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; placement: 'top' | 'bottom' }>({
    top: 0,
    left: 0,
    placement: 'bottom',
  });

  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const statusClass = getStatusBadgeClass(status);
  const isHealthy = status === 'Saudável';
  const isAttention = status === 'Atenção';
  const isCritical = status === 'Crítico';
  const hasReasons = reasons && reasons.length > 0;

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const popoverWidth = 320;
    // Estima ou mede a altura do popover
    const popoverHeight = popoverRef.current?.offsetHeight || 220;

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Se placement for forçado ou se não houver espaço embaixo (menos de 240px) e houver mais espaço em cima, abre para cima
    const shouldFlipToTop = placement === 'top' || (spaceBelow < 250 && spaceAbove > 180);

    let top: number;
    if (shouldFlipToTop) {
      top = Math.max(10, rect.top - popoverHeight - 8);
    } else {
      top = Math.min(window.innerHeight - popoverHeight - 10, rect.bottom + 8);
    }

    // Alinhamento horizontal baseado na prop, mas protegido contra overflow de tela
    let left: number;
    if (align === 'left') {
      left = rect.left;
    } else if (align === 'right') {
      left = rect.right - popoverWidth;
    } else {
      left = rect.left + rect.width / 2 - popoverWidth / 2;
    }

    // Mantém no viewport com 12px de folga das bordas
    if (left < 12) left = 12;
    if (left + popoverWidth > window.innerWidth - 12) {
      left = window.innerWidth - popoverWidth - 12;
    }

    setCoords({
      top,
      left,
      placement: shouldFlipToTop ? 'top' : 'bottom',
    });
  }, [align, placement]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    updatePosition();
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 120);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isVisible) {
      updatePosition();
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Reavalia posição ao redimensionar ou rolar
  useEffect(() => {
    if (isVisible) {
      updatePosition();
      const handleScrollOrResize = () => updatePosition();
      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);
      return () => {
        window.removeEventListener('scroll', handleScrollOrResize, true);
        window.removeEventListener('resize', handleScrollOrResize);
      };
    }
  }, [isVisible, updatePosition]);

  // Fecha ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        popoverRef.current && !popoverRef.current.contains(target)
      ) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible]);

  // Limpa timeout ao desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const getHeaderIcon = () => {
    if (isCritical) return <AlertOctagon size={16} color="var(--danger)" />;
    if (isAttention) return <AlertTriangle size={16} color="var(--warning)" />;
    return <CheckCircle2 size={16} color="var(--success)" />;
  };

  const getTriggerIcon = () => {
    if (!showIcon) return null;
    if (isCritical) {
      return (
        <span className="health-badge-icon" style={{ color: 'var(--danger)' }}>
          <AlertOctagon size={13} />
        </span>
      );
    }
    if (isAttention) {
      return (
        <span className="health-badge-icon" style={{ color: 'var(--warning)' }}>
          <AlertTriangle size={13} />
        </span>
      );
    }
    return (
      <span className="health-badge-icon" style={{ color: 'var(--success)', opacity: 0.7 }}>
        <CheckCircle2 size={12} />
      </span>
    );
  };

  const getRecommendation = () => {
    if (isCritical) {
      return 'Intervenção imediata: Avaliar aditivo contratual de horas ou antecipar validação de entregas pendentes.';
    }
    if (isAttention) {
      return 'Monitoramento preventivo: Cuidado com o teto de horas contratadas e descompasso frente aos marcos.';
    }
    return 'Projeto equilibrado: Consumo de horas compatível com o percentual de avanço físico entregue.';
  };

  const popoverContent = isVisible && (
    <div
      ref={popoverRef}
      className={`health-popover-portal placement-${coords.placement}`}
      style={{
        top: `${coords.top}px`,
        left: `${coords.left}px`,
      }}
      onMouseEnter={() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      }}
      onMouseLeave={handleMouseLeave}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="health-popover-header">
        <div className="health-popover-title">
          {getHeaderIcon()}
          <span>
            {isCritical 
              ? 'Diagnóstico Crítico' 
              : isAttention 
              ? 'Motivo de Atenção' 
              : 'Saúde Operacional'}
          </span>
        </div>
        <span 
          className={`badge ${statusClass}`} 
          style={{ fontSize: '0.68rem', padding: '0.15rem 0.4rem' }}
        >
          {status}
        </span>
      </div>

      {hasReasons ? (
        <ul className="health-popover-reasons">
          {reasons.map((reason, idx) => (
            <li key={idx} className="health-popover-reason-item">
              <span 
                className="health-popover-bullet"
                style={{ color: isCritical ? 'var(--danger)' : 'var(--warning)' }}
              >
                •
              </span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
          {isHealthy 
            ? 'Consumo de horas dentro do previsto e entregas dos marcos em dia.' 
            : 'Nenhum motivo detalhado cadastrado no momento.'}
        </div>
      )}

      <div className="health-popover-footer">
        <strong>Dica:</strong> {getRecommendation()}
      </div>
    </div>
  );

  return (
    <div 
      className="health-badge-container" 
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <div className={`badge ${statusClass} health-badge-trigger`}>
        {getTriggerIcon()}
        <span>{status}</span>
      </div>

      {typeof document !== 'undefined' && createPortal(popoverContent, document.body)}
    </div>
  );
};
