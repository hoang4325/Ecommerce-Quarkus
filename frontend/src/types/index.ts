// ─── Common ───────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  errorCode?: string;
  data?: T;
  errors?: FieldError[];
  timestamp?: string;
}

export interface FieldError {
  field: string;
  message: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
}

export interface UserInfoDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  emailVerified: boolean;
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export interface UserProfileDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}

// ─── Product ───────────────────────────────────────────────────────────────────

export interface ProductDTO {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: string;
  categoryName: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  slug: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId?: string;
}

export interface UpdateProductRequest {
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  categoryId?: string;
  active?: boolean;
}

// ─── Category ─────────────────────────────────────────────────────────────────

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export enum CartStatus {
  ACTIVE = 'ACTIVE',
  CHECKED_OUT = 'CHECKED_OUT',
}

export interface CartDTO {
  id: string;
  userId: string;
  status: CartStatus;
  items: CartItemDTO[];
  totalAmount: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItemDTO {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface AddCartItemRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// ─── Order ────────────────────────────────────────────────────────────────────

export enum OrderStatus {
  PENDING = 'PENDING',
  STOCK_RESERVED = 'STOCK_RESERVED',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export interface OrderDTO {
  id: string;
  userId: string;
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: string;
  items: OrderItemDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemDTO {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface CreateOrderRequest {
  shippingAddress: string;
}

// ─── Payment ──────────────────────────────────────────────────────────────────

export interface PaymentDTO {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  status: string;
  transactionId: string;
  reason: string;
  createdAt: string;
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export interface InventoryDTO {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  reservedQuantity: number;
  available: number;
}

export interface CreateInventoryRequest {
  productId: string;
  productName: string;
  quantity: number;
}

// ─── Notification ─────────────────────────────────────────────────────────────

export interface NotificationDTO {
  id: string;
  userId: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}