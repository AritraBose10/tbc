import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  _request: NextRequest,
  _context: { params: Promise<{ orderId: string }> }
) {
  return NextResponse.json({ error: 'Delivery service is currently disabled' }, { status: 503 });
}
