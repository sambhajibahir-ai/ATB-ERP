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

    // Create signed session token
    const token = createSessionToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    });

    const response = NextResponse.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      user,
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
