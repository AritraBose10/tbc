// ---------------------------------------------------------------------------
// Petpooja API — Shared TypeScript Types
// ---------------------------------------------------------------------------
// All types correspond to payloads defined in the Petpooja Integration Guide.
// Field names must match exactly — Petpooja's API is case-sensitive.
// ---------------------------------------------------------------------------

// --- Auth (top-level block on every outbound request) ----------------------

export interface PetpoojaAuth {
  app_key: string;
  app_secret: string;
  access_token: string;
}

// --- Save Order (Outbound: POST /save_order) --------------------------------

/** "H" = home delivery, "P" = parcel/takeaway, "D" = dine-in */
export type OrderType = 'H' | 'P' | 'D';

export type PaymentType = 'COD' | 'CARD' | 'ONLINE';

/** Whether GST is collected by the restaurant or by us (third-party) */
export type GstLiability = 'restaurant' | 'thirdparty';

export interface PetpoojaAddon {
  id: string;
  name: string;
  price: number;
}

export interface PetpoojaOrderItem {
  /** Petpooja item ID from Push Menu — NOT our internal catalogue ID */
  id: string;
  name: string;
  /** Unit price including any addon prices */
  price: number;
  /** price minus any item-level discount */
  final_price: number;
  quantity: number;
  gst_liability: GstLiability;
  /** Tax amount for this line item */
  item_tax: number;
  /** 1 = tax already included in price, 0 = tax added on top */
  tax_inclusive: 0 | 1;
  tax_percentage: number;
  addons: PetpoojaAddon[];
}

export interface PetpoojaTaxDetail {
  id: string;
  title: string;
  type: string;             // e.g. "percentage" or "flat"
  price: number;            // Rate value
  tax: number;              // Total tax amount collected
  restaurant_liable_amt: number;
}

export interface PetpoojaOrderDetails {
  /** Must come from the stored value set by Push Menu webhook — never hardcode */
  restID: string;
  orderID: string;
  /** "DD/MM/YYYY" for pre-orders; "" for immediate */
  preorder_date: string;
  /** "HH:MM" for pre-orders; "" for immediate */
  preorder_time: string;
  advanced_order: 'Y' | 'N';
  order_type: OrderType;
  /**
   * total = sum(item.final_price) - order_discount + GST (if restaurant liable) + packing_charges
   * ⚠️  Do NOT include delivery charges here — Petpooja requirement
   */
  total: number;
  tax_total: number;
  discount_total: number;
  /** "1" = percentage discount, "2" = flat amount discount */
  discount_type: '1' | '2';
  /** Unix timestamp in seconds */
  created_on: number;
  /** Delivery charge tax percentage */
  dc_tax_percentage: number;
  /** Packing charge tax percentage */
  pc_tax_percentage: number;
  payment_type: PaymentType;
  /** 0 = we (third-party) manage delivery; 1 = restaurant manages delivery */
  enable_delivery: 0 | 1;
  /** Customer name — required by Petpooja */
  name: string;
  /** Customer address — required by Petpooja */
  address: string;
  mobile: string;
  email: string;
  latitude: string;
  longitude: string;
  /** URL that Petpooja will POST order status updates to */
  callback_url: string;
  items: PetpoojaOrderItem[];
  tax_details: PetpoojaTaxDetail[];
}

export interface SaveOrderRequest extends PetpoojaAuth {
  details: PetpoojaOrderDetails;
}

export interface SaveOrderResponse {
  status: string;
  message: string;
  orderID?: string;
  [key: string]: unknown;
}

// --- Push Menu Webhook (Inbound) -------------------------------------------

export interface PetpoojaItemVariant {
  id: string;
  name: string;
  price: string;
}

export interface PetpoojaMenuItem {
  itemid: string;
  itemname: string;
  item_price: string;
  /** "1" = active/available, "0" = inactive */
  active: string;
  item_tax: string;
  itemallowvariant: string;
  itemvariants?: PetpoojaItemVariant[];
  [key: string]: unknown; // Petpooja includes many additional fields
}

export interface PetpoojaMenuCategory {
  categoryid: string;
  categoryname: string;
  /** "1" = active, "0" = inactive */
  active: string;
  items: PetpoojaMenuItem[];
}

export interface PetpoojaRestaurant {
  restaurant_id: string;
  restaurantname: string;
  categories: PetpoojaMenuCategory[];
  [key: string]: unknown;
}

export interface PushMenuPayload extends PetpoojaAuth {
  restaurants: PetpoojaRestaurant[];
}

// --- Item On/Off Webhook (Inbound) -----------------------------------------

export interface ItemStatusPayload extends PetpoojaAuth {
  restaurant_id: string;
  item_id: string;
  /** "1" = item available, "0" = item unavailable (86'd) */
  active: '1' | '0';
}

// --- Store On/Off Webhook (Inbound) ----------------------------------------

export interface StoreStatusPayload extends PetpoojaAuth {
  restaurant_id: string;
  /** "1" = store open, "0" = store closed */
  is_open: '1' | '0';
}

// --- Order Status Callback Webhook (Inbound) --------------------------------

/**
 * Petpooja order status codes.
 * Sent as callback_order_status in the callback webhook payload.
 */
export const PETPOOJA_ORDER_STATUS: Record<string, string> = {
  '1': 'accepted',
  '2': 'rejected',
  '3': 'food_ready',
  '4': 'dispatched',
  '5': 'delivered',
};

export interface OrderCallbackPayload extends PetpoojaAuth {
  restaurant_id: string;
  /** Our internal order ID — Petpooja echoes back exactly what we sent */
  order_id: string;
  /** See PETPOOJA_ORDER_STATUS for mapping */
  callback_order_status: string;
  [key: string]: unknown;
}

// --- Rider Info (Outbound: POST /rider_info) --------------------------------
// Only relevant when enable_delivery = 0 (we manage delivery)

export interface RiderInfoDetails {
  order_id: string;
  rider_name: string;
  rider_phone: string;
  rider_latitude: string;
  rider_longitude: string;
  /** Minutes as a string, e.g. "30" */
  estimated_time: string;
}

export interface RiderInfoRequest extends PetpoojaAuth {
  details: RiderInfoDetails;
}

export interface RiderInfoResponse {
  status: string;
  message: string;
  [key: string]: unknown;
}

// --- Structured error shape returned by the Petpooja client ----------------

export interface PetpoojaErrorPayload {
  httpStatus: number;
  /** Raw response body from Petpooja — may be a string on non-JSON errors */
  body: unknown;
}
