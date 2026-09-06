import { getAccessToken } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { accessToken } = await getAccessToken({
      authorizationParams: {
        audience: process.env.AUTH0_AUDIENCE,
      },
    });
    return NextResponse.json({ accessToken });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Unauthorized' }, { status: 401 });
  }
}
