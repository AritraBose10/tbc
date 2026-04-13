// ---------------------------------------------------------------------------
// Petpooja Rider Info Service (Task 3)
// ---------------------------------------------------------------------------
// Called once a rider is assigned to a delivery.
// ONLY relevant when enable_delivery = 0 was sent in the original Save Order
// (meaning we — not the restaurant — manage last-mile delivery).
// ---------------------------------------------------------------------------

import { petpoojaPost, getPetpoojaAuth, PetpoojaError } from './client';
import type { RiderInfoRequest, RiderInfoResponse } from './types';

export interface SendRiderInfoInput {
  orderId: string;
  riderName: string;
  riderPhone: string;
  riderLatitude: string;
  riderLongitude: string;
  /** ETA in minutes */
  estimatedTimeMinutes: number;
}

export type SendRiderInfoResult =
  | { success: true; response: RiderInfoResponse }
  | {
      success: false;
      error: string;
      httpStatus?: number;
      petpoojaBody?: unknown;
    };

/**
 * Sends rider details to Petpooja so the restaurant can track ETA.
 * Call this only when enable_delivery was 0 on the associated Save Order.
 */
export async function sendRiderInfo(
  input: SendRiderInfoInput,
): Promise<SendRiderInfoResult> {
  const auth = getPetpoojaAuth();

  const body: RiderInfoRequest = {
    ...auth,
    details: {
      order_id: input.orderId,
      rider_name: input.riderName,
      rider_phone: input.riderPhone,
      rider_latitude: input.riderLatitude,
      rider_longitude: input.riderLongitude,
      estimated_time: String(input.estimatedTimeMinutes),
    },
  };

  try {
    const response = await petpoojaPost<RiderInfoResponse>('/rider_info', body);
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
    throw err;
  }
}
