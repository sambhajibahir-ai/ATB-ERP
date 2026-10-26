import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth';
import { getUserById, getCompanyById } from '@/lib/data-service';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    const payload = verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    // Refresh user state from data service if available
    const freshUser = await getUserById(payload.id);
    const companyId = freshUser?.companyId || payload.companyId || 1;
    const company = await getCompanyById(companyId);

    return NextResponse.json({
      authenticated: true,
      user: freshUser || payload,
      company: company || {
        id: companyId,
        name: payload.companyName || 'Corporate Enterprise',
        licenseTier: 'Enterprise',
        status: 'Active',
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { authenticated: false, error: err.message },
      { status: 200 }
    );
  }
}

