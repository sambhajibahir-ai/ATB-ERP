import { NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/data-service';
import { createSessionToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await authenticateUser(email.trim(), password);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email credentials or incorrect password' },
        { status: 401 }
      );
    }

    // Create signed session token with company tenant context
    const token = createSessionToken({
      id: user.id,
      companyId: user.company.id,
      companyName: user.company.name,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      isCompanyAdmin: !!user.isCompanyAdmin,
      isPlatformAdmin: !!user.isPlatformAdmin,
    });

    const response = NextResponse.json({
      success: true,
      message: `Welcome back, ${user.name}! (${user.company.name})`,
      user,
      company: user.company,
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || 'Authentication failed' },
      { status: 400 }
    );
  }
}

