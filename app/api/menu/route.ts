import { NextResponse } from 'next/server';
import { fetchMenuItems } from '@/lib/menu';

export async function GET() {
  const items = await fetchMenuItems();
  return NextResponse.json(items, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
