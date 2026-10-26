import { NextResponse } from 'next/server';
import { createCompany, createUser } from '@/lib/data-service';
import { createSessionToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      companyName,
      companyEmail,
      phone,
      taxId,
      gstin,
      address,
      adminName,
      adminEmail,
      password,
      licenseMode, // 'trial' | 'pending'
    } = body;

    // Validation
    if (!companyName || !companyEmail || !adminName || !adminEmail || !password) {
      return NextResponse.json(
        { error: 'Company Name, Company Email, CEO Name, Admin Email, and Password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const isPendingApproval = licenseMode === 'pending';

    // 1. Create the tenant company
    const newCompany = await createCompany({
      name: companyName.trim(),
      email: companyEmail.trim(),
      phone: phone?.trim(),
      taxId: taxId?.trim(),
      gstin: gstin?.trim(),
      address: address?.trim(),
      status: isPendingApproval ? 'Pending' : 'Active',
      licenseTier: isPendingApproval ? 'Enterprise' : 'Trial',
      licenseDays: isPendingApproval ? 365 : 30,
      maxUsers: isPendingApproval ? 50 : 10,
    });

    // 2. Create the single primary CEO / Admin account for this company
    const ceoUser = await createUser({
      companyId: newCompany.id,
      name: adminName.trim(),
      email: adminEmail.trim(),
      password,
      role: 'Admin',
      department: 'Chief Executive Office (CEO)',
      isCompanyAdmin: true,
    });

    const response = NextResponse.json({
      success: true,
      message: isPendingApproval
        ? `Registration submitted! Company ${newCompany.name} is pending platform administrator verification.`
        : `Welcome to ATB ERP! ${newCompany.name} has been provisioned with a 30-Day Active Trial License.`,
      company: newCompany,
      user: ceoUser,
      isPendingApproval,
    });

    // 3. If instantly active trial, issue session cookie so they're logged in directly
    if (!isPendingApproval) {
      const token = createSessionToken({
        id: ceoUser.id,
        companyId: newCompany.id,
        companyName: newCompany.name,
        name: ceoUser.name,
        email: ceoUser.email,
        role: ceoUser.role,
        department: ceoUser.department,
        isCompanyAdmin: true,
        isPlatformAdmin: false,
      });

      response.cookies.set({
        name: COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
      });
    }

    return response;
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || 'Registration failed' },
      { status: 400 }
    );
  }
}

