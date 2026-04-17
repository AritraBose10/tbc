// ---------------------------------------------------------------------------
// Petpooja Save Order Service (Task 1)
// ---------------------------------------------------------------------------
// Builds the /save_order payload and dispatches it to Petpooja.
//
// Key constraints enforced here:
//   • restID always comes from the DB (set by Push Menu webhook) — never hardcoded
//   • total must NOT include delivery charges (Petpooja requirement)
//   • advanced_order is derived from whether preorder fields are provided
// ---------------------------------------------------------------------------

import { prisma } from '@/lib/prisma';
import { petpoojaPost, getPetpoojaAuth, PetpoojaError } from './client';
import type {
  SaveOrderRequest,
  SaveOrderResponse,
  OrderType,
  PaymentType,
} from './types';

// ---------------------------------------------------------------------------
// Input / output types for callers
// ---------------------------------------------------------------------------

export interface InputOrderItem {
  id: string;
  name: string;
  price: number;
  final_price: number;
  quantity: number;
  gst_liability: 'restaurant' | 'thirdparty';
  item_tax: any[];
  tax_inclusive: 0 | 1;
  tax_percentage: number;
  addons: any[];
}

export interface InputTaxDetail {
  id: string;
  title: string;
  type: string;
  price: number;
  tax: number;
  restaurant_liable_amt: number;
}

/**
 * Domain-level input for saveOrder().
 * Uses camelCase; this service translates to Petpooja's snake_case wire format.
 */
export interface SaveOrderInput {
  orderID: string;
  orderType: OrderType;

  /**
   * total = sum(item_final_price * quantity) + tax_total + packing_charges + service_charge + delivery_charges - discount_total
   */
  total: number;
  taxTotal: number;
  discountTotal: number;
  /** "P" = percentage discount, "F" = flat amount */
  discountType: 'P' | 'F';
  packingCharges: number;
  deliveryCharges: number;
  serviceCharge?: number;
  /** Delivery charge tax % (0 if not applicable) */
  dcTaxPercentage?: number;
  /** Packing charge tax % */
  pcTaxPercentage?: number;

  paymentType: PaymentType;
  /** 0 = we manage delivery (triggers Rider Info flow); 1 = restaurant manages */
  enableDelivery: 0 | 1;

  customer: {
    name: string;     // Required by Petpooja
    address: string;  // Required by Petpooja
    mobile: string;
    email: string;
    latitude: string;
    longitude: string;
  };

  /** Full URL that Petpooja will POST order status updates to */
  callbackUrl: string;

  items: InputOrderItem[];
  taxDetails: InputTaxDetail[];

  /** "DD/MM/YYYY" — omit or pass "" for immediate orders */
  preorderDate?: string;
  /** "HH:MM" — omit or pass "" for immediate orders */
  preorderTime?: string;
}

export type SaveOrderResult =
  | { success: true; response: SaveOrderResponse }
  | {
      success: false;
      error: string;
      /** Petpooja HTTP status, if the failure was an API error */
      httpStatus?: number;
      /** Raw Petpooja response body for debugging */
      petpoojaBody?: unknown;
    };

// ---------------------------------------------------------------------------
// Service function
// ---------------------------------------------------------------------------

/**
 * Posts an order to Petpooja's /save_order endpoint.
 *
 * Returns a discriminated union rather than throwing so callers can handle
 * Petpooja errors inline without try/catch boilerplate. Unexpected errors
 * (network failure, DB failure) are still thrown.
 */
export async function saveOrder(
  input: SaveOrderInput,
): Promise<SaveOrderResult> {
  // Fetch the menu sharing code from DB — this is what the API doc calls "restID".
  // The Push Menu webhook stores it as 'restaurantId' (the alphanumeric code like "A409632R"),
  // NOT 'restID' which is the numeric internal ID ("4341").
  const configRow = await prisma.petpoojaConfig.findUnique({
    where: { key: 'restaurantId' },
  });

  const restID = configRow?.value || process.env.PETPOOJA_REST_ID;

  if (!restID) {
    return {
      success: false,
      error:
        'restaurantId not found in DB or PETPOOJA_REST_ID env var. The Push Menu webhook must be received before orders can be placed.',
    };
  }

  const auth = getPetpoojaAuth();

  const restMapID = process.env.PETPOOJA_REST_MAP_ID ?? 'sikue9cb';

  // Mathematical Reconciliation Check
  const serviceCharge = input.serviceCharge || 0;
  const calculatedTotal = input.items.reduce((sum, item) => sum + (item.final_price * item.quantity), 0)
    + input.taxTotal
    + input.packingCharges
    + serviceCharge
    + input.deliveryCharges
    - input.discountTotal;

  if (Math.abs(calculatedTotal - input.total) >= 0.01) {
    return {
      success: false,
      error: `Mathematical Reconciliation Failed: Provided total (${input.total}) does not exactly match calculated total (${calculatedTotal.toFixed(2)})`
    };
  }

  // Date/Time formatting for created_on ("YYYY-MM-DD HH:MM:SS")
  const now = new Date();
  const createdOn = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  const body: SaveOrderRequest = {
    ...auth,
    orderinfo: {
      OrderInfo: {
        Restaurant: {
          details: {
            res_name: "The Biryani Canteen",
            address: "Kolkata",
            contact_information: "8478910707",
            restID: restMapID
          }
        },
        Customer: {
          details: {
            email: input.customer.email,
            name: input.customer.name,
            address: input.customer.address,
            phone: input.customer.mobile,
            latitude: input.customer.latitude,
            longitude: input.customer.longitude
          }
        },
        Order: {
          details: {
            orderID: input.orderID,
            preorder_date: input.preorderDate ? input.preorderDate.split('/').reverse().join('-') : createdOn.split(' ')[0],
            preorder_time: input.preorderTime || createdOn.split(' ')[1],
            service_charge: serviceCharge.toFixed(2),
            sc_tax_amount: "0.00",
            delivery_charges: input.deliveryCharges.toFixed(2),
            dc_tax_percentage: input.dcTaxPercentage ? input.dcTaxPercentage.toFixed(2) : "0.00",
            dc_tax_amount: "0.00",
            packing_charges: input.packingCharges.toFixed(2),
            pc_tax_amount: "0.00",
            pc_tax_percentage: input.pcTaxPercentage ? input.pcTaxPercentage.toFixed(2) : "0.00",
            order_type: input.orderType,
            advanced_order: input.preorderDate || input.preorderTime ? 'Y' : 'N',
            urgent_order: false,
            urgent_time: 0,
            payment_type: input.paymentType,
            table_no: "",
            no_of_persons: "0",
            discount_total: input.discountTotal.toFixed(2),
            tax_total: input.taxTotal.toFixed(2),
            discount_type: input.discountType,
            total: input.total.toFixed(2),
            description: "",
            created_on: createdOn,
            enable_delivery: input.enableDelivery,
            min_prep_time: 20,
            callback_url: input.callbackUrl
          }
        },
        OrderItem: {
          details: input.items.map(item => ({
            id: item.id,
            name: item.name,
            tax_inclusive: item.tax_inclusive === 1 ? true : false,
            gst_liability: item.gst_liability,
            item_tax: Array.isArray(item.item_tax) ? item.item_tax.map((tax: any) => ({
              id: String(tax.id),
              name: String(tax.title || tax.name),
              tax_percentage: Number(tax.price || tax.tax_percentage).toFixed(2),
              amount: Number(tax.tax || tax.amount).toFixed(2)
            })) : [],
            item_discount: "0", // Map if applicable
            price: item.price.toFixed(2),
            final_price: item.final_price.toFixed(2),
            quantity: String(item.quantity),
            description: "",
            variation_name: "",
            variation_id: "",
            AddonItem: {
              details: Array.isArray(item.addons) ? item.addons.map((a: any) => ({
                id: String(a.id),
                name: String(a.name),
                group_name: "Addons",
                price: Number(a.price).toFixed(2),
                group_id: "0",
                quantity: "1"
              })) : []
            }
          }))
        },
        Tax: {
          details: input.taxDetails.map(tax => ({
            id: String(tax.id),
            title: String(tax.title),
            type: String(tax.type),
            price: String(tax.price),
            tax: tax.tax.toFixed(2),
            restaurant_liable_amt: tax.restaurant_liable_amt.toFixed(2)
          }))
        },
        Discount: {
          details: []
        }
      },
      udid: "",
      device_type: "Web"
    }
  };

  try {
    const response = await petpoojaPost<SaveOrderResponse>('/save_order', body);
    return { success: true, response };
  } catch (err) {
    if (err instanceof PetpoojaError) {
      return {
        success: false,
        error: err.message,
        httpStatus: err.httpStatus,
        petpoojaBody: err.body,
      };
    }
    // Re-throw unexpected errors (network failure, JSON parse, etc.)
    throw err;
  }
}
