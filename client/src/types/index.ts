/**
 * Type definitions for Game Store Management Application
 * Matches backend Prisma schema and API contracts
 */

// ============================================================================
// User & Auth Types
// ============================================================================

export const UserRole = {
  USER: 'USER',
  MANAGER: 'MANAGER',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

// ============================================================================
// Game Types
// ============================================================================

export const GamePlatform = {
  PC: 'PC',
  PLAYSTATION: 'PLAYSTATION',
  XBOX: 'XBOX',
  NINTENDO: 'NINTENDO',
  MOBILE: 'MOBILE',
  OTHER: 'OTHER',
} as const;

export type GamePlatform = (typeof GamePlatform)[keyof typeof GamePlatform];

export interface Game {
  id: string;
  mobyGameId?: number;
  name: string;
  platform: GamePlatform;
  genre?: string;
  description?: string;
  coverArtUrl?: string;
  releaseDate?: string;
  price: number;
  stockLevel: number;
  createdAt: string;
  updatedAt: string;
  lineItems?: SaleLineItem[];
}

export interface GameFormData {
  name: string;
  platform: GamePlatform;
  genre?: string;
  description?: string;
  coverArtUrl?: string;
  releaseDate?: string;
  price: number;
  stockLevel?: number;
}

export interface CreateGameRequest extends GameFormData {
  // extends from form data
}

export interface UpdateGameRequest extends Partial<GameFormData> {
  // partial update
}

// ============================================================================
// Customer Types
// ============================================================================

export const LoyaltyTier = {
  STANDARD: 'STANDARD',
  GOLD: 'GOLD',
  PLATINUM: 'PLATINUM',
} as const;

export type LoyaltyTier = (typeof LoyaltyTier)[keyof typeof LoyaltyTier];

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  loyaltyTier?: LoyaltyTier;
  totalSpent: number;
  ownerId?: string;
  owner?: User;
  createdAt: string;
  updatedAt: string;
  sales?: Sale[];
}

export interface CustomerFormData {
  name: string;
  email?: string;
  phone?: string;
  loyaltyTier?: LoyaltyTier;
}

export interface CreateCustomerRequest extends CustomerFormData {
  // extends from form data
}

export interface UpdateCustomerRequest extends Partial<CustomerFormData> {
  // partial update
}

// ============================================================================
// Sale & SaleLineItem Types
// ============================================================================

export const SaleStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type SaleStatus = (typeof SaleStatus)[keyof typeof SaleStatus];

export interface SaleLineItem {
  id: string;
  saleId: string;
  gameId: string;
  quantity: number;
  pricePerUnit: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
  game?: Game;
  sale?: Sale;
}

export interface SaleLineItemFormData {
  gameId: string;
  quantity: number;
}

export interface Sale {
  id: string;
  customerId: string;
  totalAmount: number;
  status: SaleStatus;
  saleDate: string;
  ownerId?: string;
  owner?: User;
  customer?: Customer;
  createdAt: string;
  updatedAt: string;
  lineItems?: SaleLineItem[];
}

export interface SaleFormData {
  customerId: string;
  lineItems: SaleLineItemFormData[];
  status?: SaleStatus;
  saleDate?: string;
}

export interface CreateSaleRequest extends SaleFormData {
  // extends from form data
}

export interface UpdateSaleRequest extends Partial<Omit<SaleFormData, 'lineItems'>> {
  // partial update (cannot update line items through this endpoint)
}



// ============================================================================
// Search Types
// ============================================================================

export interface GameSearchResult {
  mobyGameId?: number;
  name: string;
  platforms?: string[];
  genres?: string[];
  description?: string;
  coverUrl?: string;
  releaseDate?: string;
}

export interface GameSearchResponse {
  data: GameSearchResult[];
  query: string;
  count: number;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

// ============================================================================
// Report Types
// ============================================================================

export interface SalesSummaryReport {
  totalSales: number;
  totalRevenue: number;
  averageSaleValue: number;
  totalCustomers: number;
  totalGamiesSold: number;
}

export interface RevenueByCustomerReport {
  customerId: string;
  customerName: string;
  totalRevenue: number;
  saleCount: number;
  averageSaleValue: number;
}

export interface TopSellingGameReport {
  gameId: string;
  gameName: string;
  platform: GamePlatform;
  quantitySold: number;
  totalRevenue: number;
  averagePricePerUnit: number;
}

export interface UserPerformanceReport {
  userId: string;
  userName: string;
  saleCount: number;
  totalRevenue: number;
  averageSaleValue: number;
  gamesSold: number;
}

export interface SalesSummaryResponse extends ApiResponse<SalesSummaryReport> {
  data: SalesSummaryReport;
  generatedAt: string;
}

export interface RevenueByCustomerResponse extends ApiListResponse<RevenueByCustomerReport> {
  data: RevenueByCustomerReport[];
  total: number;
  generatedAt: string;
}

export interface TopSellingGamesResponse {
  data: TopSellingGameReport[];
  count: number;
  generatedAt: string;
}

export interface UserPerformanceResponse extends ApiResponse<UserPerformanceReport[]> {
  data: UserPerformanceReport[];
  generatedAt: string;
}

// ============================================================================
// React Component Prop Types
// ============================================================================

export interface ItemTableProps<T> {
  items: T[];
  columns: Array<{
    key: keyof T;
    label: string;
  }>;
  loading?: boolean;
  renderRow?: (item: T, index: number) => React.ReactNode;
  onRowClick?: (item: T) => void;
  keyExtractor?: (item: T) => string;
}

export interface GameFormProps {
  game?: Game;
  onSubmit: (data: GameFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export interface SaleFormProps {
  sale?: Sale;
  onSubmit: (data: SaleFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export interface SaleManagerProps {
  customerId: string;
  sales: Sale[];
  onRefresh: () => void;
}

export interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export interface LoginFormProps {
  onSubmit: (data: LoginRequest) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export interface NavbarProps {
  user?: User;
  onLogout: () => void;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
}

export interface RedirectLoggedInProps {
  children: React.ReactNode;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  loading?: boolean;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

// ============================================================================
// Filter & Search Types
// ============================================================================

export interface SearchFilters {
  query?: string;
  type?: 'customer' | 'game' | 'sale';
  platform?: GamePlatform;
  ownerId?: string;
}

export interface SearchResults {
  customers: Customer[];
  games: Game[];
  sales: Sale[];
}

// ============================================================================
// Form Validation Types
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}
