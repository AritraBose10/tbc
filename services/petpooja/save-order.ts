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
  PetpoojaOrderItem,
  PetpoojaTaxDetail,
  OrderType,
  PaymentType,
} from './types';

// ---------------------------------------------------------------------------
// Input / output types for callers
// ---------------------------------------------------------------------------

/**
 * Domain-level input for saveOrder().
 * Uses camelCase; this service translates to Petpooja's snake_case wire format.
 */
export interface SaveOrderInput {
  orderID: string;
  orderType: OrderType;

  /**
   * total = sum(item.final_price) - order_discount
   *       + GST (only if gst_liability = "restaurant")
   *       + packing charges
   *
   * ⚠️  Delivery charges must NOT be included — Petpooja invoices those separately.
   */
  total: number;
  taxTotal: number;
  discountTotal: number;
  /** "1" = percentage discount, "2" = flat amount */
  discountType: '1' | '2';
  /** Delivery charge tax % (0 if not applicable) */
  dcTaxPercentage: number;
  /** Packing charge tax % */
  pcTaxPercentage: number;

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

  items: PetpoojaOrderItem[];
  taxDetails: PetpoojaTaxDetail[];

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
  // Fetch restID from DB — it arrives via the Push Menu webhook and is the
  // only valid source. Hardcoding is explicitly disallowed by the spec.
  const configRow = await prisma.petpoojaConfig.findUnique({
    where: { key: 'restID' },
  });

  if (!configRow) {
    return {
      success: false,
      error:
        'restID not found in DB. The Push Menu webhook must be received before orders can be placed.',
    };
  }

  const auth = getPetpoojaAuth();

  const body: SaveOrderRequest = {
    ...auth,
    details: {
      restID: configRow.value,
      orderID: input.orderID,
      preorder_date: input.preorderDate ?? '',
      preorder_time: input.preorderTime ?? '',
      // advanced_order must be "Y" whenever either preorder field is non-empty
      advanced_order: input.preorderDate || input.preorderTime ? 'Y' : 'N',
      order_type: input.orderType,
      total: input.total,
      tax_total: input.taxTotal,
      discount_total: input.discountTotal,
      discount_type: input.discountType,
      created_on: Math.floor(Date.now() / 1000),
      dc_tax_percentage: input.dcTaxPercentage,
      pc_tax_percentage: input.pcTaxPercentage,
      payment_type: input.paymentType,
      enable_delivery: input.enableDelivery,
      name: input.customer.name,
      address: input.customer.address,
      mobile: input.customer.mobile,
      email: input.customer.email,
      latitude: input.customer.latitude,
      longitude: input.customer.longitude,
      callback_url: input.callbackUrl,
      items: input.items,
      tax_details: input.taxDetails,
    },
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
