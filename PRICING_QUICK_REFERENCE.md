# Quick Reference: Pricing Locations

## Backend Files

| File | Line(s) | Type | Calculation/Function |
|------|---------|------|----------------------|
| [backend/controllers/orderController.js](backend/controllers/orderController.js) | 26 | Display | Order email: `item.price × quantity` |
| [backend/controllers/orderController.js](backend/controllers/orderController.js) | 77 | Display | Admin email: `item.price × quantity` |
| [backend/controllers/orderController.js](backend/controllers/orderController.js) | 199-213 | Store | Receive & save `subtotal, delivery, total, itemCount` |
| [backend/controllers/productController.js](backend/controllers/productController.js) | 60-80 | Query | `price-low` / `price-high` sorting |
| [backend/controllers/offerController.js](backend/controllers/offerController.js) | 83-87 | Calculate | `clampDiscount()`: 0-100% validation |
| [backend/controllers/offerController.js](backend/controllers/offerController.js) | 115-131 | Store | `discount_percentage` storage & validation |
| [backend/routes/adminRoutes.js](backend/routes/adminRoutes.js) | 15 | Calculate | Total revenue: `$sum: "$total"` aggregation |
| [backend/models/Product.js](backend/models/Product.js) | 8 | Schema | `price`: Required, min 0 |
| [backend/models/Product.js](backend/models/Product.js) | 9 | Schema | `originalPrice`: Optional (backward compat) |
| [backend/models/Product.js](backend/models/Product.js) | 27-28 | Pre-save | Sync `mrp` ↔ `originalPrice` |
| [backend/models/Product.js](backend/models/Product.js) | 43-46 | Virtual | **Discount**: `Math.round(((base - price) / base) × 100)` |
| [backend/models/Variant.js](backend/models/Variant.js) | 7 | Schema | `price`: Required, min 0 |
| [backend/models/Variant.js](backend/models/Variant.js) | 8 | Schema | `mrp`: Optional per-variant original price |
| [backend/models/Order.js](backend/models/Order.js) | 8 | Schema | `price`: Item price at order time |
| [backend/models/Order.js](backend/models/Order.js) | 46-48 | Schema | `subtotal`, `delivery`, `total` storage |
| [backend/models/Offer.js](backend/models/Offer.js) | 10 | Schema | `discount_percentage`: 0-100, default 0 |
| [backend/models/Offer.js](backend/models/Offer.js) | 98-100 | Virtual | Format discount as `"${percentage}% OFF"` |

## Frontend Context/State Files

| File | Line(s) | Type | Calculation/Function |
|------|---------|------|----------------------|
| [frontend/src/context/CartContext.jsx](frontend/src/context/CartContext.jsx) | 74 | Calculate | Use variant price OR product price |
| [frontend/src/context/CartContext.jsx](frontend/src/context/CartContext.jsx) | 117 | Calculate | **Cart Total**: `Σ(item.price × quantity)` |
| [frontend/src/context/ProductContext.jsx](frontend/src/context/ProductContext.jsx) | 24 | Extract | Get discount %: `discount_percentage ?? discountPercent ?? 0` |
| [frontend/src/context/ProductContext.jsx](frontend/src/context/ProductContext.jsx) | 287-290 | Calculate | **Order Total**: `subtotal + delivery + codFee` |

## Frontend Component Files

| File | Line(s) | Type | Calculation/Function |
|------|---------|------|----------------------|
| [frontend/src/components/ProductCard.jsx](frontend/src/components/ProductCard.jsx) | 18 | Store | `mrp = product.mrp OR originalPrice OR 0` |
| [frontend/src/components/ProductCard.jsx](frontend/src/components/ProductCard.jsx) | 20-21 | Calculate | **Discount %**: `Math.round(((mrp - price) / mrp) × 100)` |
| [frontend/src/components/ProductCard.jsx](frontend/src/components/ProductCard.jsx) | 26 | Display | Badge: `${discount}% OFF` |
| [frontend/src/components/ProductCard.jsx](frontend/src/components/ProductCard.jsx) | 136 | Display | Current price: `₹{product.price}` |
| [frontend/src/components/ProductCard.jsx](frontend/src/components/ProductCard.jsx) | 145 | Calculate | Savings amount: `(mrp - price)` |

## Frontend Pages

| File | Line(s) | Type | Calculation/Function |
|------|---------|------|----------------------|
| [frontend/src/pages/ProductDetails.jsx](frontend/src/pages/ProductDetails.jsx) | 107-109 | Calculate | **Discount %**: `Math.round(((mrp - price) / mrp) × 100)` |
| [frontend/src/pages/ProductDetails.jsx](frontend/src/pages/ProductDetails.jsx) | 119 | Calculate | Display price: `selectedVariant?.price ?? product.price` |
| [frontend/src/pages/Cart.jsx](frontend/src/pages/Cart.jsx) | 21-23 | Calculate | **Item Discount %**: `Math.round((savings / originalPrice) × 100)` |
| [frontend/src/pages/Cart.jsx](frontend/src/pages/Cart.jsx) | 115-118 | Calculate | **Cart Totals**: `subtotal`, `totalSavings`, `deliveryCharge`, `finalTotal` |
| [frontend/src/pages/Checkout.jsx](frontend/src/pages/Checkout.jsx) | 169-178 | Calculate | **Order Summary**: All totals + savings display |
| [frontend/src/pages/Checkout.jsx](frontend/src/pages/Checkout.jsx) | 392-393 | Calculate | **Final Total**: With delivery & COD fee |

## Frontend Admin Pages

| File | Line(s) | Type | Calculation/Function |
|------|---------|------|----------------------|
| [frontend/src/admin/AdminDashboard.jsx](frontend/src/admin/AdminDashboard.jsx) | 62 | Calculate | **Total Revenue**: `orders.reduce((s, o) => s + o.total)` |
| [frontend/src/admin/AdminOrders.jsx](frontend/src/admin/AdminOrders.jsx) | 118 | Display | Item price: `₹{item.price}` |
| [frontend/src/admin/AdminOrders.jsx](frontend/src/admin/AdminOrders.jsx) | 136 | Display | Subtotal: `₹{order.subtotal}` |
| [frontend/src/admin/AdminOrders.jsx](frontend/src/admin/AdminOrders.jsx) | 145 | Display | Total: `₹{order.total}` |
| [frontend/src/admin/AdminOrders.jsx](frontend/src/admin/AdminOrders.jsx) | 327 | Calculate | **Total Revenue**: Same as Dashboard |
| [frontend/src/admin/AdminProductForm.jsx](frontend/src/admin/AdminProductForm.jsx) | 63 | Validate | Price must be > 0 |
| [frontend/src/admin/AdminProductForm.jsx](frontend/src/admin/AdminProductForm.jsx) | 146-148 | Store | `price`, `mrp`, `originalPrice` initialization |
| [frontend/src/admin/AdminProductForm.jsx](frontend/src/admin/AdminProductForm.jsx) | 200 | Calculate | **Discount %**: `Math.round(((mrp - price) / mrp) × 100)` |
| [frontend/src/admin/AdminProductForm.jsx](frontend/src/admin/AdminProductForm.jsx) | 354 | Calculate | **Savings**: `(mrp - price)` |
| [frontend/src/admin/AdminOffers.jsx](frontend/src/admin/AdminOffers.jsx) | 25 | State | Initial: `discountPercent: 0` |
| [frontend/src/admin/AdminOffers.jsx](frontend/src/admin/AdminOffers.jsx) | 91 | Validate | Discount must be 0-100 |
| [frontend/src/admin/AdminOffers.jsx](frontend/src/admin/AdminOffers.jsx) | 129 | Store | `discount_percentage` storage |
| [frontend/src/admin/AdminOffers.jsx](frontend/src/admin/AdminOffers.jsx) | 388 | Display | Discount label: `${discountPercent}% OFF` |
| [frontend/src/admin/AdminProducts.jsx](frontend/src/admin/AdminProducts.jsx) | 140-142 | Display | Current & original prices |

## Modals & Special Components

| File | Line(s) | Type | Calculation/Function |
|------|---------|------|----------------------|
| [frontend/src/components/QuickViewModal.jsx](frontend/src/components/QuickViewModal.jsx) | 18 | Calculate | **Discount %**: `Math.round(((mrp - price) / mrp) × 100)` |

## Utility Files

| File | Line(s) | Type | Calculation/Function |
|------|---------|------|----------------------|
| [frontend/src/utils/delivery.js](frontend/src/utils/delivery.js) | 33 | Calculate | Distance: `Math.round(distance × 10) / 10` |
| [frontend/src/utils/delivery.js](frontend/src/utils/delivery.js) | 51-52 | Parse | Latitude/Longitude: `parseFloat()` |
| [frontend/src/components/ProductFilter.jsx](frontend/src/components/ProductFilter.jsx) | 14 | Constant | `PRICE_RANGES` definition |

---

## KEY THRESHOLDS & CONSTANTS

### Delivery Pricing
- **Free Delivery Threshold**: ₹999 (subtotal)
- **Delivery Charge**: ₹79 (below threshold)
- **Delivery Radius**: 20 KM from Akurdi, Pune
- **Store Location**: 18.6492°N, 73.7698°E

### COD (Cash on Delivery)
- **COD Fee**: ₹50
- **Applied**: Only for `paymentMethod === "cod"`

### Discount
- **Range**: 0-100%
- **Rounding**: `Math.round()` to integer
- **Formula**: `((original - sale) / original) × 100`

### Price Fields Compatibility
- Primary: `price`, `mrp`
- Fallback: `originalPrice`, `mrp` (Product Model)
- Variants: Independent `price`, `mrp`

---

## DECIMAL PRECISION ISSUES

### At Risk
- [ProductContext.jsx:287](frontend/src/context/ProductContext.jsx#L287) - No rounding in subtotal calculation
- [Cart.jsx:115](frontend/src/pages/Cart.jsx#L115) - No rounding in originalTotal
- [Checkout.jsx:175](frontend/src/pages/Checkout.jsx#L175) - No rounding in savings calculation

### Safe (Rounded)
- All discount percentages (use `Math.round()`)
- Order totals (sent as whole numbers from frontend)
- Distance calculations (round to 1 decimal place)

---

## Math.round() Usage Summary

| Location | Purpose |
|----------|---------|
| ProductCard.jsx:21 | Discount % |
| ProductDetails.jsx:107 | Discount % |
| QuickViewModal.jsx:18 | Discount % |
| Cart.jsx:23 | Discount % |
| AdminProductForm.jsx:200 | Discount % |
| Product.js virtual:46 | Discount % |
| delivery.js:33 | Distance decimal |

