import type {
  Game,
  SaleLineItemFormData,
} from '../types/index';

export function callAPIWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('token');
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  if (import.meta.env.VITE_API_URL) {
    const protocol = import.meta.env.DEV ? 'http' : 'https';

    // If VITE_API_URL is already a full domain name (or contains '.onrender.com'), do not append it.
    const hasDomain = import.meta.env.VITE_API_URL.includes('.') || import.meta.env.DEV;
    const domain = hasDomain ? '' : '.onrender.com';

    url = `${protocol}://${import.meta.env.VITE_API_URL}${domain}/api/${url}`;
  }

  return fetch(url, { ...options, headers });
}

export function callAPI(url: string, options: RequestInit = {}): Promise<Response> {
  if (import.meta.env.VITE_API_URL) {
    const protocol = import.meta.env.DEV ? 'http' : 'https';

    // If VITE_API_URL is already a full domain name (or contains '.onrender.com'), do not append it.
    const hasDomain = import.meta.env.VITE_API_URL.includes('.') || import.meta.env.DEV;
    const domain = hasDomain ? '' : '.onrender.com';

    url = `${protocol}://${import.meta.env.VITE_API_URL}${domain}/api/${url}`;
  }

  return fetch(url, { ...options });
}

// ============================================================================
// Customer API Functions
// ============================================================================

export async function fetchCustomers(page: number = 1, limit: number = 10) {
  const response = await callAPIWithAuth(`customers?page=${page}&limit=${limit}`);
  return response.json();
}

export async function fetchCustomer(id: string) {
  const response = await callAPIWithAuth(`customers/${id}`);
  return response.json();
}

export async function createCustomer(data: { name: string; email?: string; phone?: string; loyaltyTier?: string }) {
  const response = await callAPIWithAuth('customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function updateCustomer(id: string, data: { name?: string; email?: string; phone?: string; loyaltyTier?: string }) {
  const response = await callAPIWithAuth(`customers/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteCustomer(id: string) {
  const response = await callAPIWithAuth(`customers/${id}`, { method: 'DELETE' });
  return response.json();
}

// ============================================================================
// Game/Inventory API Functions
// ============================================================================

export async function fetchGames(
  page: number = 1,
  limit: number = 10,
  filters?: { platform?: string; genre?: string; minPrice?: number; maxPrice?: number }
) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filters?.platform) params.append('platform', filters.platform);
  if (filters?.genre) params.append('genre', filters.genre);
  if (filters?.minPrice) params.append('minPrice', String(filters.minPrice));
  if (filters?.maxPrice) params.append('maxPrice', String(filters.maxPrice));

  const response = await callAPIWithAuth(`inventory?${params}`);
  return response.json();
}

export async function fetchGame(id: string) {
  const response = await callAPIWithAuth(`inventory/${id}`);
  return response.json();
}

export async function searchGames(query: string) {
  const response = await callAPIWithAuth(`inventory/search?q=${encodeURIComponent(query)}`);
  return response.json();
}

export async function createGame(data: Omit<Game, 'id' | 'createdAt' | 'updatedAt' | 'lineItems'>) {
  const response = await callAPIWithAuth('inventory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function addGameFromSearch(data: Omit<Game, 'id' | 'createdAt' | 'updatedAt' | 'lineItems'>) {
  const response = await callAPIWithAuth('inventory/add-from-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function updateGame(id: string, data: Partial<Omit<Game, 'id' | 'createdAt' | 'updatedAt' | 'lineItems'>>) {
  const response = await callAPIWithAuth(`inventory/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteGame(id: string) {
  const response = await callAPIWithAuth(`inventory/${id}`, { method: 'DELETE' });
  return response.json();
}

// ============================================================================
// Sales API Functions
// ============================================================================

export async function fetchSales(page: number = 1, limit: number = 10) {
  const response = await callAPIWithAuth(`sales?page=${page}&limit=${limit}`);
  return response.json();
}

export async function fetchSale(id: string) {
  const response = await callAPIWithAuth(`sales/${id}`);
  return response.json();
}

export async function createSale(data: {
  customerId: string;
  lineItems: SaleLineItemFormData[];
  status?: string;
  saleDate?: string;
}) {
  const response = await callAPIWithAuth('sales', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function updateSale(id: string, data: { customerId?: string; lineItems?: { gameId: string; quantity: number }[]; status?: string }) {
  const response = await callAPIWithAuth(`sales/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteSale(id: string) {
  const response = await callAPIWithAuth(`sales/${id}`, { method: 'DELETE' });
  return response.json();
}



// ============================================================================
// Report API Functions
// ============================================================================

export async function fetchSalesSummary() {
  const response = await callAPIWithAuth('reports/sales-summary');
  return response.json();
}

export async function fetchRevenueByCustomer(page: number = 1, limit: number = 50) {
  const response = await callAPIWithAuth(`reports/revenue-by-customer?page=${page}&limit=${limit}`);
  return response.json();
}

export async function fetchTopSellingGames(limit: number = 20) {
  const response = await callAPIWithAuth(`reports/top-selling-games?limit=${limit}`);
  return response.json();
}

export async function fetchUserPerformance(limit: number = 50) {
  const response = await callAPIWithAuth(`reports/user-performance?limit=${limit}`);
  return response.json();
}
