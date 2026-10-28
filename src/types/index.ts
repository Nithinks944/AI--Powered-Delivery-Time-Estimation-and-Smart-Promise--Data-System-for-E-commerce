// src/types/index.ts

export interface RawOrderRecord {
  order_id: string;
  order_purchase_timestamp: string;
  item_count: number;
  total_price: number;
  total_freight: number;
  seller_count: number;
  category: string;
  customer_state: string;
  seller_state: string;
  purchase_month: number;
  purchase_day_of_week: number; // 0 = Mon, 6 = Sun
  purchase_hour: number;
  is_weekend: number; // 0 or 1
  same_state: number; // 0 or 1
  estimated_delivery_days: number;
  delivery_days: number;
}

export interface EnrichedOrderRecord extends RawOrderRecord {
  is_late: boolean;
  delay_gap: number; // delivery_days - estimated_delivery_days
  order_value: number; // total_price + total_freight
  freight_ratio: number; // total_freight / total_price
  year_month: string; // YYYY-MM
  date: string; // YYYY-MM-DD
}

export interface SummaryKPIs {
  totalOrders: number;
  totalRevenue: number;
  totalFreight: number;
  avgOrderValue: number;
  avgFreight: number;
  freightRatio: number; // percentage
  avgDeliveryDays: number;
  avgEstimatedDays: number;
  avgDelayGap: number;
  onTimeRate: number; // percentage
  lateRate: number; // percentage
  sameStateShare: number; // percentage
  dateRange: {
    start: string;
    end: string;
  };
  p50DeliveryDays: number;
  p90DeliveryDays: number;
  p99DeliveryDays: number;
  p99EstimatedDays: number;
  p99TotalPrice: number;
}

export interface MonthAggregate {
  yearMonth: string;
  orders: number;
  revenue: number;
  avgFreight: number;
  avgDeliveryDays: number;
  avgEstimatedDays: number;
  onTimeRate: number;
  lateRate: number;
}

export interface StateAggregate {
  state: string;
  orders: number;
  revenue: number;
  avgFreight: number;
  avgDeliveryDays: number;
  avgEstimatedDays: number;
  lateRate: number;
  sameStateShare: number;
}

export interface CategoryAggregate {
  category: string;
  orders: number;
  revenue: number;
  avgFreight: number;
  avgDeliveryDays: number;
  lateRate: number;
  freightRatio: number;
}

export interface RouteAggregate {
  sellerState: string;
  customerState: string;
  orders: number;
  revenue: number;
  avgFreight: number;
  avgDeliveryDays: number;
  avgEstimatedDays: number;
  lateRate: number;
}

export interface DateAggregate {
  date: string;
  orders: number;
  revenue: number;
  avgDeliveryDays: number;
  lateRate: number;
}

export interface HourWeekdayCell {
  dayIndex: number;
  dayName: string;
  hour: number;
  orders: number;
  revenue: number;
  avgDeliveryDays: number;
}

export interface StateCentroid {
  name: string;
  lat: number;
  lng: number;
  region: string;
}

export interface GlobalFilters {
  startDate: string;
  endDate: string;
  categories: string[];
  customerStates: string[];
  sameState: 'all' | 'same' | 'cross';
  weekend: 'all' | 'weekend' | 'weekday';
  searchQuery: string;
}

export interface SavedView {
  id: string;
  name: string;
  createdAt: string;
  page: string;
  filters: GlobalFilters;
}

export interface DrawerState {
  isOpen: boolean;
  type: 'state' | 'date' | 'category' | 'route' | null;
  id: string | null;
  title: string;
  subtitle?: string;
  data?: unknown;
}

export interface AutoInsight {
  id: string;
  type: 'positive' | 'warning' | 'critical' | 'info';
  title: string;
  message: string;
  metric: string;
  impactScore: number;
}
