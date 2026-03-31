/**
 * Variant-based Price Calculation Utility
 * Single source of truth for all pricing logic
 */

/**
 * Calculate final price based on original price and discount percentage
 * @param {number} originalPrice - The original/list price
 * @param {number} discountPercent - Discount percentage (0-100)
 * @returns {number} Final price after discount
 */
const calculateFinalPrice = (originalPrice, discountPercent = 0) => {
  const original = Number(originalPrice) || 0;
  const discount = Math.max(0, Math.min(Number(discountPercent) || 0, 100));
  const finalPrice = original - (original * discount / 100);
  return Math.round(finalPrice);
};

/**
 * Validate discount percentage (max 90%)
 * @param {number} discountPercent - Discount percentage to validate
 * @returns {object} { valid: boolean, error?: string }
 */
const validateDiscountPercent = (discountPercent) => {
  const discount = Number(discountPercent);
  
  if (!Number.isFinite(discount)) {
    return { valid: false, error: "Discount must be a number" };
  }
  
  if (discount < 0) {
    return { valid: false, error: "Discount cannot be negative" };
  }
  
  if (discount > 90) {
    return { valid: false, error: "Discount cannot exceed 90%" };
  }
  
  return { valid: true };
};

/**
 * Normalize variant pricing data
 * @param {object} variant - The variant object
 * @returns {object} Normalized variant with calculated finalPrice
 */
const normalizeVariantPrice = (variant) => {
  if (!variant) return null;
  
  const originalPrice = Number(variant.originalPrice) || 0;
  const discountPercent = Math.max(0, Math.min(Number(variant.discountPercent) || 0, 100));
  const finalPrice = calculateFinalPrice(originalPrice, discountPercent);
  
  return {
    ...variant,
    originalPrice,
    discountPercent,
    finalPrice,
  };
};

/**
 * Calculate cart total based on cart items
 * @param {array} cartItems - Array of cart items with finalPrice and quantity
 * @returns {object} { subtotal, total, itemCount }
 */
const calculateCartTotal = (cartItems = []) => {
  if (!Array.isArray(cartItems)) return { subtotal: 0, total: 0, itemCount: 0 };
  
  let subtotal = 0;
  let itemCount = 0;
  
  cartItems.forEach((item) => {
    const finalPrice = Number(item.finalPrice) || Number(item.price) || 0;
    const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
    subtotal += finalPrice * quantity;
    itemCount += quantity;
  });
  
  return {
    subtotal: Math.round(subtotal),
    total: Math.round(subtotal),
    itemCount,
  };
};

module.exports = {
  calculateFinalPrice,
  validateDiscountPercent,
  normalizeVariantPrice,
  calculateCartTotal,
};
