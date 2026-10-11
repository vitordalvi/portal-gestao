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

