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

    const payload = await verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    // Refresh user state from data service if available
    const freshUser = await getUserById(payload.id);
    const companyId = freshUser?.companyId || payload.companyId || 1;
    let company = await getCompanyById(companyId);

    const isPlatformAdmin = !!(freshUser?.isPlatformAdmin || payload.isPlatformAdmin);
    if (isPlatformAdmin) {
      company = company ? { ...company, name: 'ATB Software' } : {
        id: 1,
        name: 'ATB Software',
        code: 'ATB-HQ',
        email: 'contact@atbsoftware.com',
        phone: '+91 20 4129 9000',
        taxId: 'CIN: U72200MH2026PTC******',
        gstin: '27AABCU****R1Z*',
        address: 'ATB Towers, Wagholi, Pune, Maharashtra 412207',
        status: 'Active',
        licenseTier: 'Enterprise',
        licenseExpiresAt: '2027-12-31T23:59:59Z',
        maxUsers: 50,
        createdAt: '2026-01-01T00:00:00Z',
      };
    }

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

