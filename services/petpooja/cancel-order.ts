import { petpoojaPost, getPetpoojaAuth, PetpoojaError } from './client';

export type CancelOrderResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Sends a cancellation request to Petpooja for the given orderID.
 * status "-1" is Petpooja's cancel signal.
 */
export async function cancelPetpoojaOrder(orderID: string): Promise<CancelOrderResult> {
  const restID = process.env.PETPOOJA_REST_ID;
  if (!restID) {
    return { success: false, error: 'PETPOOJA_REST_ID env var is not set' };
  }

  let auth: ReturnType<typeof getPetpoojaAuth>;
  try {
    auth = getPetpoojaAuth();
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Auth config error' };
  }

  try {
    const response = await petpoojaPost<{ status: string | number; message?: string }>(
      '/update_order_status',
      {
        app_key:      auth.app_key,
        app_secret:   auth.app_secret,
        access_token: auth.access_token,
        restID,
        orderID,
        status:  '-1',
        reason:  'Cancelled by customer',
      },
    );

    if (String(response.status) === '1') {
      return { success: true };
    }
    return { success: false, error: response.message ?? 'Petpooja rejected the cancellation' };
  } catch (err) {
    if (err instanceof PetpoojaError) {
      return { success: false, error: err.message };
    }
    throw err;
  }
}
