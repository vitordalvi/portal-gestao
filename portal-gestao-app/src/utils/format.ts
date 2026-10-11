export const formatPercent = (val: number): string => {
  if (isNaN(val) || val === null || val === undefined) return '0%';
  return `${new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  }).format(val)}%`;
};

export const formatCurrency = (val: number): string => {
  if (isNaN(val) || val === null || val === undefined) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(val);
};

export const getStatusBadgeClass = (status?: string): string => {
  if (!status) return 'badge-saudavel';
  const normalized = status
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return `badge-${normalized}`;
};

/**
 * Converte uma data em string ISO para representação relativa em português,
 * ideal para sinalizar o tempo decorrido desde a última sincronização do ERP TOTVS.
 * Ex: "agora mesmo", "há 14 min", "há 2h", "ontem", "há 3 dias".
 */
export const formatRelativeTime = (dateString?: string): string => {
  if (!dateString) return 'Não sincronizado';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Não sincronizado';

  const now = new Date();
  const diffInSeconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));

  if (diffInSeconds < 60) return 'agora mesmo';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `há ${diffInMinutes} min`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `há ${diffInHours}h`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'ontem';
  if (diffInDays < 30) return `há ${diffInDays} dias`;

  return date.toLocaleDateString('pt-BR');
};

/**
 * Formata data e hora completa para exibição em tooltip ou detalhe.
 * Ex: "11/10/2026 às 12:20"
 */
export const formatFullDateTime = (dateString?: string): string => {
  if (!dateString) return 'Data não disponível';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Data inválida';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};


