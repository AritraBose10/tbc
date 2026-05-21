// Server-Sent Events stream for real-time menu availability updates.
//
// Flow:
//   1. Client connects → receives current menu immediately.
//   2. Every 5 s we check MAX(updatedAt) in DB.
//      If it advanced → send fresh menu. Otherwise → send a keepalive ping.
//   3. EventSource on the client reconnects automatically on disconnect.

import { fetchMenuItems, getMenuLastUpdated } from '@/lib/menu';

export const runtime = 'nodejs';
// Allow long-lived connections on Vercel (seconds). Adjust to your plan limit.
export const maxDuration = 300;

const POLL_MS   = 5_000;  // how often to check for changes
const PING_MS   = 25_000; // keepalive so proxies don't cut the connection

export async function GET() {
  const encoder = new TextEncoder();

  let pollTimer:  ReturnType<typeof setInterval> | undefined;
  let pingTimer:  ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
          );
        } catch {
          // client disconnected
        }
      };

      // Send the initial menu immediately
      let lastUpdated = await getMenuLastUpdated();
      send('menu', await fetchMenuItems());

      // Poll DB for changes
      pollTimer = setInterval(async () => {
        try {
          const latest = await getMenuLastUpdated();
          if (latest > lastUpdated) {
            lastUpdated = latest;
            send('menu', await fetchMenuItems());
          }
        } catch {
          // DB hiccup — skip this tick, will retry next interval
        }
      }, POLL_MS);

      // Keepalive pings so load balancers / proxies don't close idle connections
      pingTimer = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'));
        } catch {
          clearInterval(pingTimer);
          clearInterval(pollTimer);
        }
      }, PING_MS);
    },

    cancel() {
      clearInterval(pollTimer);
      clearInterval(pingTimer);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
      'X-Accel-Buffering': 'no', // disable Nginx response buffering
    },
  });
}
