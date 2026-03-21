# Pricing Calculations & Displays Audit - Mahalaxmi Steels

## Summary
Complete audit of all pricing-related calculations, stores, and displays across the codebase.

---

## BACKEND PRICING CALCULATIONS

### 1. **Order Controller** - [backend/controllers/orderController.js](backend/controllers/orderController.js)

#### Line 26 - Order Email: Item Line Price Calculation
- **Type**: DISPLAYING price
- **Code**: `₹${(i.price * i.quantity).toLocaleString("en-IN")}`
- **Purpose**: Shows item total in order confirmation email
- **Calculation**: `item.price × item.quantity`

#### Line 77 - Admin Email: Item Line Price Calculation
- **Type**: DISPLAYING price
- **Code**: `₹${(i.price * i.quantity).toLocaleString("en-IN")}`
- **Purpose**: Shows item total in admin notification email
- **Calculation**: `item.price × item.quantity`

#### Line 199-201 - Create Order: Receives Pre-Calculated Totals
- **Type**: STORING price values (received from frontend)
- **Parameters**: `subtotal, delivery, total, itemCount`
- **Code**: `const { customer, address, items, paymentMethod, subtotal, delivery, total, itemCount } = req.body;`
- **Note**: All totals are calculated on frontend and sent to backend

#### Line 207-213 - Order Database Save
- **Type**: STORING price values to database
- **Fields**: `subtotal, delivery, total, itemCount`
- **Code**: Creates Order with all pricing data preserved

### 2. **Product Controller** - [backend/controllers/productController.js](backend/controllers/productController.js)

#### Line 60-80 - Product List Query: Supports Price Sorting
- **Type**: QUERYING with price sort
- **Supported Sorts**: 
  - `price-low`: Ascending price order
  - `price-high`: Descending price order
- **Code in sortMap**: `"price-low": { price: 1 }, "price-high": { price: -1 }`

### 3. **Offer Controller** - [backend/controllers/offerController.js](backend/controllers/offerController.js)

#### Line 83-87 - Discount Percentage Validation & Clamping
- **Type**: CALCULATING/VALIDATING discount
- **Function**: `clampDiscount(value)`
- **Logic**: Ensures discount is between 0-100%
- **Code**:
  ```javascript
  const clampDiscount = (value) => {
    const discount = toNumber(value, 0);
    if (discount < 0) return 0;
    if (discount > 100) return 100;
    return discount;
  };
  ```

#### Line 115-116 - Offer Creation: Discount Percentage Storage
- **Type**: STORING discount
- **Code**: `discount_percentage: clampDiscount(body.discount_percentage ?? body.discountPercent ?? body.discount)`

#### Line 131 - Offer Update: Discount Percentage Storage
- **Type**: STORING discount (with fallback to existing value)
- **Code**: Similar to creation with fallback

### 4. **Admin Routes** - [backend/routes/adminRoutes.js](backend/routes/adminRoutes.js)

#### Line 15 - Total Revenue Aggregation
- **Type**: CALCULATING total from orders
- **Code**: `Order.aggregate([{ $group: { _id: null, total: { $sum: "$total" } } }])`
- **Purpose**: Sum all order totals for dashboard
- **Fields**: Aggregates `$total` from Order collection

---

## DATABASE MODELS - PRICING SCHEMA

### 1. **Product Model** - [backend/models/Product.js](backend/models/Product.js)

#### Line 8-9 - Price Fields
- **Fields**:
  - `price`: Required, minimum 0 (current/sale price)
  - `originalPrice`: Optional (backward compatibility)

#### Line 27-28 - Pre-save Hook: MRP/OriginalPrice Sync
- **Type**: CALCULATING default values
- **Logic**: Syncs `mrp` ↔ `originalPrice`
- **Code**:
  ```javascript
  if (this.mrp && !this.originalPrice) this.originalPrice = this.mrp;
  if (this.originalPrice && !this.mrp) this.mrp = this.originalPrice;
  ```

#### Line 43-46 - Virtual: Discount Percentage
- **Type**: CALCULATING discount on read
- **Formula**: `((base - price) / base) × 100`
- **Code**:
  ```javascript
  productSchema.virtual("discount").get(function () {
    const base = this.mrp || this.originalPrice;
    if (!base || base <= this.price) return 0;
    return Math.round(((base - this.price) / base) * 100);
  });
  ```
- **Note**: Uses `Math.round()` for integer percentage

### 2. **Variant Model** - [backend/models/Variant.js](backend/models/Variant.js)

#### Line 7-8 - Price Fields
- **Fields**:
  - `price`: Required, minimum 0 (variant sale price)
  - `mrp`: Optional (variant original price)
- **Note**: Each variant can have its own pricing independent of product

### 3. **Order Model** - [backend/models/Order.js](backend/models/Order.js)

#### Line 8 - Item Price Storage
- **Field**: `price` (per item)
- **Type**: Number, required
- **Purpose**: Stores the price at time of order creation

#### Line 46-48 - Order Totals
- **Fields**:
  - `subtotal`: Sum of (item.price × quantity) before fees
  - `delivery`: Delivery charge (0 or 79)
  - `total`: Final total after all fees

#### Line 57 - Offer Schema
- **Field**: `discount_percentage`
- **Range**: 0-100
- **Default**: 0

---

## FRONTEND PRICING CALCULATIONS

### 1. **Cart Context** - [frontend/src/context/CartContext.jsx](frontend/src/context/CartContext.jsx)

#### Line 74-86 - Add to Cart: Price Selection
- **Type**: CALCULATING line item price
- **Logic**: Uses variant price if available, otherwise product price
- **Code**:
  ```javascript
  const price = variant?.price ?? product.price;
  // ... add to cart with this price
  originalPrice: product.originalPrice || product.mrp || product.price,
  ```

#### Line 117 - Cart Total Calculation
- **Type**: CALCULATING subtotal
- **Formula**: `Σ(item.price × item.quantity)`
- **Code**: `const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);`

### 2. **Product Context** - [frontend/src/context/ProductContext.jsx](frontend/src/context/ProductContext.jsx)

#### Line 24 - Offer Normalization: Discount Extraction
- **Type**: EXTRACTING discount percentage
- **Code**: `const discountPercentage = Number(o.discount_percentage ?? o.discountPercent ?? 0) || 0;`

#### Line 287-290 - Order Placement: Complete Total Calculation
- **Type**: CALCULATING order totals
- **Code**:
  ```javascript
  const subtotal  = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const delivery  = subtotal >= 999 ? 0 : 79;  // Delivery threshold at ₹999
  const codFee    = paymentMethod === "cod" ? 50 : 0;  // COD fee
  const total     = subtotal + delivery + codFee;
  const itemCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  ```
- **Thresholds**:
  - Free delivery when subtotal ≥ ₹999
  - COD fee: ₹50
  - Delivery charge: ₹79

### 3. **Product Card Component** - [frontend/src/components/ProductCard.jsx](frontend/src/components/ProductCard.jsx)

#### Line 20-21 - Discount Calculation
- **Type**: CALCULATING discount percentage for display
- **Formula**: `((mrp - price) / mrp) × 100`
- **Code**:
  ```javascript
  const mrp = product.mrp || product.originalPrice || 0;
  const discount = mrp > product.price
    ? Math.round(((mrp - product.price) / mrp) * 100)
    : 0;
  ```
- **Uses**: `Math.round()` for integer rounding

#### Line 136-145 - Price Display
- **Type**: DISPLAYING prices
- **Shows**:
  - Current price (primary)
  - MRP (strikethrough if sale)
  - Savings amount: `(mrp - price).toLocaleString("en-IN")`

### 4. **Product Details Page** - [frontend/src/pages/ProductDetails.jsx](frontend/src/pages/ProductDetails.jsx)

#### Line 107-109 - Discount Calculation
- **Type**: CALCULATING discount percentage
- **Formula**: Same as ProductCard
- **Code**:
  ```javascript
  const mrp = product.mrp || product.originalPrice || 0;
  const discount = mrp > product.price ? Math.round(((mrp - product.price) / mrp) * 100) : 0;
  const savings = mrp > product.price ? mrp - product.price : 0;
  ```

#### Line 119 - Variant Price Fallback
- **Type**: CALCULATING display price
- **Code**: `const displayPrice = selectedVariant?.price ?? product.price;`
- **Logic**: Uses variant price if selected, otherwise product price

### 5. **Cart Page** - [frontend/src/pages/Cart.jsx](frontend/src/pages/Cart.jsx)

#### Line 21-23 - Item Discount Calculation
- **Type**: CALCULATING discount percentage per item
- **Code**:
  ```javascript
  const originalPrice = item.originalPrice || item.mrp || item.price;
  const savings = originalPrice - item.price;
  const discountPct = originalPrice > item.price ? Math.round((savings / originalPrice) * 100) : 0;
  ```

#### Line 115-118 - Cart Summary Totals
- **Type**: CALCULATING order totals
- **Code**:
  ```javascript
  const originalTotal  = cartItems.reduce((sum, item) => sum + (item.originalPrice || item.mrp || item.price) * item.quantity, 0);
  const totalSavings   = originalTotal - cartTotal;
  const deliveryCharge = cartTotal >= 999 ? 0 : cartTotal === 0 ? 0 : 79;
  const finalTotal     = cartTotal + deliveryCharge;
  ```
- **Thresholds**: Same ₹999 free delivery threshold

### 6. **Checkout Page** - [frontend/src/pages/Checkout.jsx](frontend/src/pages/Checkout.jsx)

#### Line 175-178 - Order Summary Component
- **Type**: CALCULATING totals for display
- **Code**:
  ```javascript
  const safeCartTotal = toNumber(cartTotal);
  const originalTotal = safeItems.reduce((s, i) => s + toNumber(i.originalPrice || i.mrp || i.price) * toNumber(i.quantity ?? i.qty ?? 1, 1), 0);
  const savings = originalTotal - safeCartTotal;
  const delivery = safeCartTotal >= 999 ? 0 : 79;
  const total = safeCartTotal + delivery + toNumber(codFee);
  ```

#### Line 392-393 - Final Total Before Submission
- **Type**: CALCULATING final amount
- **Code**:
  ```javascript
  const safeCartTotal = toNumber(cartTotal);
  const currentTotal  = safeCartTotal + (safeCartTotal >= 999 ? 0 : 79) + codFee;
  ```

### 7. **Quick View Modal** - [frontend/src/components/QuickViewModal.jsx](frontend/src/components/QuickViewModal.jsx)

#### Line 18 - Discount Calculation
- **Type**: CALCULATING discount percentage
- **Formula**: `((mrp - price) / mrp) × 100`
- **Code**:
  ```javascript
  const mrp = product.mrp || product.originalPrice || 0;
  const discount = mrp > product.price ? Math.round(((mrp - product.price) / mrp) * 100) : 0;
  ```

### 8. **Admin Dashboard** - [frontend/src/admin/AdminDashboard.jsx](frontend/src/admin/AdminDashboard.jsx)

#### Line 62 - Total Revenue Calculation
- **Type**: CALCULATING total from orders
- **Code**: `const totalRevenue  = orders.reduce((s, o) => s + (o.total || 0), 0);`
- **Purpose**: Sum all order totals for dashboard stats

### 9. **Admin Orders** - [frontend/src/admin/AdminOrders.jsx](frontend/src/admin/AdminOrders.jsx)

#### Line 118 - Item Price Display
- **Type**: DISPLAYING item price
- **Code**: `₹{Number(item.price || 0).toLocaleString("en-IN")}`

#### Line 136 - Order Subtotal Display
- **Type**: DISPLAYING subtotal
- **Code**: `<span>Subtotal</span><span>₹{(order.subtotal || 0).toLocaleString("en-IN")}</span>`

#### Line 145 - Order Total Display
- **Type**: DISPLAYING final total
- **Code**: `<span>Total</span><span>₹{(order.total || 0).toLocaleString("en-IN")}</span>`

#### Line 327 - Total Revenue Calculation
- **Type**: CALCULATING total from orders
- **Code**: `const totalRevenue = (Array.isArray(orders) ? orders : []).reduce((s, o) => s + (o.total || 0), 0);`

### 10. **Admin Product Form** - [frontend/src/admin/AdminProductForm.jsx](frontend/src/admin/AdminProductForm.jsx)

#### Line 63 - Price Validation
- **Type**: VALIDATING price input
- **Code**: `if (!form.price || isNaN(form.price) || +form.price <= 0) e.price = "Enter a valid price";`

#### Line 146-148 - Product Payload: Price Storage
- **Type**: STORING prices
- **Code**:
  ```javascript
  price:         +form.price,
  mrp:           +form.mrp || +form.price,
  originalPrice: +form.mrp || +form.price,
  ```
- **Logic**: If MRP not provided, uses sale price as MRP

#### Line 198-200 - Product Edit: Discount Preview Calculation
- **Type**: CALCULATING discount for preview
- **Formula**: `((mrp - price) / mrp) × 100`
- **Code**:
  ```javascript
  const discount =
    form.price && form.mrp && (+form.mrp > +form.price)
      ? Math.round(((+form.mrp - +form.price) / +form.mrp) * 100)
      : 0;
  ```

#### Line 354 - Display Savings Amount
- **Type**: CALCULATING and DISPLAYING savings
- **Code**: `(Customer saves ₹{(+form.mrp - +form.price).toLocaleString("en-IN")})`

#### Line 175 - New Variant Price Initialization
- **Type**: INITIALIZING variant price
- **Code**: `const newVariant = { id: Date.now(), label: "", price: form.price, stock: 0 };`
- **Logic**: New variants inherit product's sale price

### 11. **Admin Offers** - [frontend/src/admin/AdminOffers.jsx](frontend/src/admin/AdminOffers.jsx)

#### Line 25 - Initial Discount State
- **Type**: INITIALIZING discount
- **Code**: `discountPercent: 0,`

#### Line 91 - Discount Validation
- **Type**: VALIDATING discount input
- **Code**: `if (form.discountPercent < 0 || form.discountPercent > 100) e.discountPercent = "Discount must be between 0 and 100";`

#### Line 129 - Offer Payload
- **Type**: STORING discount percentage
- **Code**: `discount_percentage: Number(form.discountPercent || 0),`

#### Line 197 - Discount Input Field
- **Type**: DISPLAYING discount input
- **Label**: "Discount %"

#### Line 388 - Discount Display Label
- **Type**: CALCULATING display text
- **Code**: `const discountLabel = offer.discount || (offer.discountPercent ? `${offer.discountPercent}% OFF` : "Special Offer");`

### 12. **Admin Products** - [frontend/src/admin/AdminProducts.jsx](frontend/src/admin/AdminProducts.jsx)

#### Line 140-142 - Product Price Display
- **Type**: DISPLAYING prices
- **Code**:
  ```jsx
  <p className="font-black text-slate-900">₹{(product.price || 0).toLocaleString("en-IN")}</p>
  {!!(product.mrp || product.originalPrice) && (
    <p className="text-xs text-slate-400 line-through">₹{(product.mrp || product.originalPrice).toLocaleString("en-IN")}</p>
  )}
  ```

---

## DELIVERY PRICING UTILITIES

### [frontend/src/utils/delivery.js](frontend/src/utils/delivery.js)

#### Line 33 - Distance Rounding
- **Type**: CALCULATING distance
- **Code**: `return { distance: Math.round(distance * 10) / 10, withinRadius: distance <= MAX_DELIVERY_RADIUS_KM };`
- **Purpose**: Calculates delivery eligibility, not price

#### Line 51-52 - Geocode Parsing
- **Type**: PARSING coordinates
- **Code**: `lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon),`

---

## UTILITY HELPERS & CONSTANTS

### Delivery Constants - [frontend/src/utils/delivery.js](frontend/src/utils/delivery.js)
- `MAX_DELIVERY_RADIUS_KM = 20`
- `STORE_LOCATION = { lat: 18.6492, lng: 73.7698 }`

### Price Ranges Filter - [frontend/src/components/ProductFilter.jsx](frontend/src/components/ProductFilter.jsx)
- **Type**: Defines selectable price ranges for filtering
- **Constant**: `PRICE_RANGES`` 

---

## KEY PRICING FORMULAS & THRESHOLDS

### Discount Percentage Formula
```
discount% = Math.round(((mrp - price) / mrp) * 100)
```
- Used in: ProductCard, ProductDetails, QuickViewModal, Cart, Admin ProductForm
- Always rounds to integer using `Math.round()`

### Order Total Calculation
```
subtotal = Σ(item.price × quantity)
delivery = subtotal >= 999 ? 0 : 79
codFee = paymentMethod === "cod" ? 50 : 0
total = subtotal + delivery + codFee
```
- **Free Delivery Threshold**: ₹999
- **Delivery Charge**: ₹79
- **COD Fee**: ₹50
- Consistent across frontend Cart, ProductContext, Checkout, and backend OrderController

### Savings Calculation
```
originalTotal = Σ(originalPrice × quantity)
savings = originalTotal - cartTotal
```
- Used in: Cart, Checkout pages

---

## DECIMAL HANDLING & ROUNDING

### Math.round() Usage
1. **ProductCard.jsx:21** - Discount percentage
2. **ProductDetails.jsx:107** - Discount percentage
3. **QuickViewModal.jsx:18** - Discount percentage
4. **Cart.jsx:23** - Discount percentage
5. **AdminProductForm.jsx:200** - Discount percentage
6. **Product Model virtual:46** - Discount percentage
7. **delivery.js:33** - Distance rounding to 1 decimal place

### toFixed() Usage
- **seed.js:86** - Rating: `+(Math.random() * 2 + 3).toFixed(1)`
- **productSeeder.js:337** - Rating: `+(Math.random() * 1.5 + 3.5).toFixed(1)`

### toLocaleString() Usage
- Used throughout for INR formatting with thousands separator
- Example: `₹{amount.toLocaleString("en-IN")}`

---

## STORAGE vs CALCULATION vs DISPLAY

| Phase | Implementation | Files | Formula |
|-------|-----------------|-------|---------|
| **STORE** | Database saves exact prices | Order Model, Product Model | `price`, `mrp`, `originalPrice` |
| **CALCULATE** | Frontend computes totals before sending to backend | ProductContext, CartContext | Subtotal, Delivery, COD Fee, Total |
| **STORE** | Backend receives and saves calculated totals | OrderController | Receives pre-calculated `subtotal`, `delivery`, `total` |
| **CALCULATE** | Frontend shows recalculated totals for display | Cart, Checkout, Admin Dashboard | Uses stored prices |
| **DISPLAY** | Format with currency and locale | All Components | `toLocaleString("en-IN")` |

---

## CRITICAL OBSERVATIONS

1. **Discount rounding** consistently uses `Math.round()` → always rounds to integer percentage
2. **Free delivery threshold** is set at ₹999 across all implementations
3. **COD fee** is ₹50, applied only for "cod" payment method
4. **Delivery charge** is ₹79 for orders below ₹999
5. **Price fields** support both `price`/`mrp` and `price`/`originalPrice` for backward compatibility
6. **Variant prices** are independent from product price
7. **Order totals are calculated on frontend** and then stored in database (frontend-first approach)
8. **Discount calculations** handle null/undefined safely with fallbacks

---

## POTENTIAL DECIMAL ISSUES TO MONITOR

- **Line 287** [ProductContext.jsx]: Decimal prices could accumulate
  - `subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0)`
  - If items have decimal prices (₹10.50), rounding might differ

- **Missing explicit rounding** in:
  - Subtotal calculations (Cart, Checkout, ProductContext)
  - Savings calculations
  - Total calculations after adding delivery/COD

- **toLocaleString()** used for display but no explicit rounding of the values before display

