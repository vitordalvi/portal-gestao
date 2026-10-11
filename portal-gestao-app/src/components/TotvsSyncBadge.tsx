import React from 'react';
import { RefreshCw, Database } from 'lucide-react';
import { formatRelativeTime, formatFullDateTime } from '../utils/format';

interface TotvsSyncBadgeProps {
  lastSyncDate?: string;
  syncStatus?: string;
  erpId?: string;
  onSync?: () => void;
  isSyncing?: boolean;
  canSync?: boolean;
  compact?: boolean;
}

/**
 * Componente visual que sinaliza a última sincronização de dados entre a plataforma e o ERP TOTVS.
 * Exibe o tempo relativo decorrido ("há 14 min", "agora mesmo") e permite disparo de sincronização sob demanda.
 */
export const TotvsSyncBadge: React.FC<TotvsSyncBadgeProps> = ({
  lastSyncDate,
  syncStatus = 'Sincronizado',
  erpId = 'TOTVS',
  onSync,
  isSyncing = false,
  canSync = false,
  compact = false,
}) => {
  const relativeText = formatRelativeTime(lastSyncDate);
  const fullDateTimeText = formatFullDateTime(lastSyncDate);

  if (compact) {
    return (
      <div 
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
        }}
        title={`ERP ID: ${erpId} • Última sincronização: ${fullDateTimeText}`}
      >
        <span style={{
          display: 'inline-block',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: syncStatus === 'Sincronizado' ? 'var(--success)' : 'var(--warning)',
        }} />
        <span>TOTVS: <strong>{relativeText}</strong></span>
      </div>
    );
  }

  return (
    <div 
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.6rem',
        padding: '0.35rem 0.75rem',
        background: 'rgba(59, 130, 246, 0.08)',
        border: '1px solid rgba(59, 130, 246, 0.25)',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
      }}
      title={`Código ERP: ${erpId} • Sincronização em: ${fullDateTimeText} (${syncStatus})`}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <Database size={13} style={{ color: 'var(--accent-light)' }} />
        <span>
          TOTVS <span style={{ opacity: 0.6 }}>({erpId})</span>:
        </span>
        <strong style={{ color: 'var(--text-primary)' }}>
          {relativeText}
        </strong>
      </div>

      {canSync && onSync && (
        <button
          type="button"
          onClick={onSync}
          disabled={isSyncing}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--accent-light)',
            cursor: isSyncing ? 'not-allowed' : 'pointer',
            padding: '2px 6px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '116px',
            gap: '0.35rem',
            fontSize: '0.75rem',
            fontWeight: 500,
            borderRadius: '4px',
            transition: 'background 0.2s ease, opacity 0.2s ease',
            opacity: isSyncing ? 0.75 : 1,
          }}
          title="Sincronizar agora com o ERP TOTVS"
        >
          <RefreshCw 
            size={12} 
            className={isSyncing ? 'spinning' : ''} 
          />
          <span>{isSyncing ? 'Sincronizando...' : 'Atualizar'}</span>
        </button>
      )}
    </div>
  );
};
