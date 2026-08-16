export const isValidPhone = (phone: string): boolean => {
  return /^09\d{9}$/.test(phone);
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

export const validateShop = (shop: { name: string; category: string; address: string }): { valid: boolean; error?: string } => {
  if (!shop.name || shop.name.length < 2) return { valid: false, error: 'نام فروشگاه باید حداقل 2 کاراکتر باشد' };
  if (!shop.category) return { valid: false, error: 'دسته‌بندی الزامی است' };
  if (!shop.address || shop.address.length < 5) return { valid: false, error: 'آدرس الزامی است' };
  return { valid: true };
};
