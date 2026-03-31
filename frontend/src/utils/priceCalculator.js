/**
 * Variant-based Price Calculation Utility (Frontend)
 * Single source of truth for all pricing logic
 */

/**
 * Calculate final price based on original price and discount percentage
 * @param {number} originalPrice - The original/list price
 * @param {number} discountPercent - Discount percentage (0-100)
 * @returns {number} Final price after discount
 */
export const calculateFinalPrice = (originalPrice, discountPercent = 0) => {
  const original = Number(originalPrice) || 0;
  const discount = Math.max(0, Math.min(Number(discountPercent) || 0, 100));
  const finalPrice = original - (original * discount / 100);
  return Math.round(finalPrice);
};

/**
 * Calculate savings amount and percentage
 * @param {number} originalPrice - The original/list price
 * @param {number} finalPrice - The final price after discount
 * @returns {object} { savingsAmount, savingsPercent }
 */
export const calculateSavings = (originalPrice, finalPrice) => {
  const original = Number(originalPrice) || 0;
  const final = Number(finalPrice) || 0;
  
  if (original <= final) {
    return { savingsAmount: 0, savingsPercent: 0 };
  }
  
  const savingsAmount = original - final;
  const savingsPercent = Math.round((savingsAmount / original) * 100);
  
  return { savingsAmount: Math.round(savingsAmount), savingsPercent };
};

/**
 * Format price for Indian Rupees
 * @param {number} price - Price to format
 * @returns {string} Formatted price string
 */
export const formatPrice = (price) => {
  const num = Number(price) || 0;
  return `₹${num.toLocaleString("en-IN")}`;
};

/**
 * Normalize variant pricing data for display
 * @param {object} variant - The variant object
 * @returns {object} Normalized variant with all price fields
 */
export const normalizeVariantPrice = (variant) => {
  if (!variant) return null;
  
  const originalPrice = Number(variant.originalPrice) || 0;
  const discountPercent = Math.max(0, Math.min(Number(variant.discountPercent) || 0, 100));
  const finalPrice = calculateFinalPrice(originalPrice, discountPercent);
  const { savingsAmount, savingsPercent } = calculateSavings(originalPrice, finalPrice);
  
  return {
    ...variant,
    originalPrice,
    discountPercent,
    finalPrice,
    savingsAmount,
    savingsPercent: savingsPercent || discountPercent,
  };
};

/**
 * Calculate cart total based on cart items
 * @param {array} cartItems - Array of cart items with finalPrice and quantity
 * @returns {object} { subtotal, total, itemCount, formattedTotal }
 */
export const calculateCartTotal = (cartItems = []) => {
  if (!Array.isArray(cartItems)) {
    return { subtotal: 0, total: 0, itemCount: 0, formattedTotal: formatPrice(0) };
  }
  
  let subtotal = 0;
  let itemCount = 0;
  
  cartItems.forEach((item) => {
    const finalPrice = Number(item.finalPrice) || Number(item.price) || 0;
    const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
    subtotal += finalPrice * quantity;
    itemCount += quantity;
  });
  
  const total = Math.round(subtotal);
  
  return {
    subtotal: total,
    total,
    itemCount,
    formattedTotal: formatPrice(total),
  };
};
