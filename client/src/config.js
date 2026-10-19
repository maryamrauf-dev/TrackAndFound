export const CAMPUS = {
  name: import.meta.env.VITE_CAMPUS_NAME || 'Campus',
  lat: Number(import.meta.env.VITE_CAMPUS_LAT) || 34.33,
  lng: Number(import.meta.env.VITE_CAMPUS_LNG) || 73.2,
};

export const CATEGORIES = [
  { id: 'keys', label: 'Keys', icon: 'key' },
  { id: 'wallet', label: 'Wallet', icon: 'account_balance_wallet' },
  { id: 'id-card', label: 'ID card', icon: 'badge' },
  { id: 'bag', label: 'Bag', icon: 'backpack' },
  { id: 'phone', label: 'Phone', icon: 'smartphone' },
  { id: 'electronics', label: 'Electronics', icon: 'headphones' },
  { id: 'books', label: 'Books', icon: 'menu_book' },
  { id: 'clothing', label: 'Clothing', icon: 'checkroom' },
  { id: 'other', label: 'Other', icon: 'category' },
];

export const catOf = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

export const DEFAULT_WHATSAPP = import.meta.env.VITE_DEFAULT_WHATSAPP || '+923001234567';

export const cleanWhatsAppNumber = (raw) => {
  if (!raw) return '';
  let cleaned = String(raw).replace(/[^\d+]/g, '');
  if (cleaned.startsWith('0')) {
    // Default country prefix (Pakistan +92 or general 0xx conversion)
    cleaned = '92' + cleaned.slice(1);
  }
  return cleaned.replace(/^\+/, '');
};

export const createWhatsAppLink = (number, message) => {
  const phone = cleanWhatsAppNumber(number || DEFAULT_WHATSAPP);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message || '')}`;
};
