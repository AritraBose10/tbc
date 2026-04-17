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
  group_name: string;
  price: string;
  group_id: string;
  quantity: string;
}

export interface PetpoojaItemTax {
  id: string;
  name: string;
  tax_percentage: string;
  amount: string;
}

export interface PetpoojaOrderItem {
  id: string;
  name: string;
  tax_inclusive: boolean;
  gst_liability: GstLiability;
  item_tax: PetpoojaItemTax[];
  item_discount: string;
  price: string;
  final_price: string;
  quantity: string;
  description: string;
  variation_name: string;
  variation_id: string;
  AddonItem: {
    details: PetpoojaAddon[];
  };
}

export interface PetpoojaTaxDetail {
  id: string;
  title: string;
  type: string;
  price: string;
  tax: string;
  restaurant_liable_amt: string;
}

export interface SaveOrderRequest extends PetpoojaAuth {
  orderinfo: {
    OrderInfo: {
      Restaurant: {
        details: {
          res_name: string;
          address: string;
          contact_information: string;
          restID: string;
        }
      };
      Customer: {
        details: {
          email: string;
          name: string;
          address: string;
          phone: string;
          latitude: string;
          longitude: string;
        }
      };
      Order: {
        details: {
          orderID: string;
          preorder_date: string;
          preorder_time: string;
          service_charge: string;
          sc_tax_amount: string;
          delivery_charges: string;
          dc_tax_percentage: string;
          dc_tax_amount: string;
          packing_charges: string;
          pc_tax_amount: string;
          pc_tax_percentage: string;
          order_type: OrderType;
          advanced_order: 'Y' | 'N';
          urgent_order: boolean;
          urgent_time: number;
          payment_type: PaymentType;
          table_no: string;
          no_of_persons: string;
          discount_total: string;
          tax_total: string;
          discount_type: 'P' | 'F';
          total: string;
          description: string;
          created_on: string;
          enable_delivery: 0 | 1;
          min_prep_time: number;
          callback_url: string;
        }
      };
      OrderItem: {
        details: PetpoojaOrderItem[];
      };
      Tax: {
        details: PetpoojaTaxDetail[];
      };
      Discount: {
        details: any[];
      };
    };
    udid: string;
    device_type: string;
  };
}

export interface SaveOrderResponse {
  status: string;
  message: string;
  orderID?: string;
  [key: string]: unknown;
}

// --- Push Menu Webhook (Inbound) -------------------------------------------

// --- Push Menu Webhook (Inbound) -------------------------------------------
// Payload structure matches Petpooja Integration Guide (confirmed field names).

export interface PushMenuVariation {
  id: string;       // variation.id — NOT variationid
  name: string;
  price: string;
}

/** Reference from an item to an addon group it belongs to */
export interface PushMenuAddonRef {
  addon_group_id: string;
}

export interface PushMenuItem {
  itemid: string;
  itemname: string;
  price: string;
  item_categoryid: string;
  /** "1" = variants enabled */
  itemallowvariation: string;
  /** "1" = addons enabled */
  itemallowaddon: string;
  variation?: PushMenuVariation[];
  addon?: PushMenuAddonRef[];
  [key: string]: unknown;
}

export interface PushMenuAddonItem {
  addonitemid: string;
  addonitem_name: string;
  addonitem_price: string;
}

export interface PushMenuAddonGroup {
  addongroupid: string;
  addongroupitems: PushMenuAddonItem[];
}

/** Tax entry from body.taxes[] */
export interface PushMenuTax {
  taxid: string;
  taxname: string;
  /** Tax rate as a string, e.g. "5.00" */
  tax: string;
}

export interface PushMenuRestaurant {
  /** Petpooja's numeric restaurant ID, e.g. "4341" */
  restaurantid: string;
  restaurantname?: string;
  [key: string]: unknown;
}

export interface PushMenuPayload extends PetpoojaAuth {
  restaurants: PushMenuRestaurant[];
  items: PushMenuItem[];
  addongroups: PushMenuAddonGroup[];
  taxes: PushMenuTax[];
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
  '-1': 'cancelled',
  '1': 'accepted',
  '2': 'accepted',
  '3': 'accepted',
  '4': 'dispatched',
  '5': 'food_ready',
  '10': 'delivered',
};

export interface OrderCallbackPayload {
  restID: string;
  orderID: string;
  status: string;
  cancel_reason?: string;
  minimum_prep_time?: string | number;
  minimum_delivery_time?: string | number;
  rider_name?: string;
  rider_phone_number?: string;
  is_modified?: string | boolean;
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
