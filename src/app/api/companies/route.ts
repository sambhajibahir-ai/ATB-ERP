import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth';
import {
  getCompanies,
  getCompanyById,
  approveCompany,
  updateCompanyLicense,
  toggleCompanyStatus,
} from '@/lib/data-service';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const session = token ? verifySessionToken(token) : null;

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Platform Admin gets all companies
    if (session.isPlatformAdmin) {
      const companies = await getCompanies();
      return NextResponse.json({ success: true, companies });
    }

    // Tenant CEO gets only their company
    const company = await getCompanyById(session.companyId);
    return NextResponse.json({ success: true, company, companies: company ? [company] : [] });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const session = token ? verifySessionToken(token) : null;

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only platform admin can approve or modify license parameters of companies
    if (!session.isPlatformAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Only Platform Super Admins can manage company approvals and licenses.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, companyId } = body;

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    // Action 1: Approve Company
    if (action === 'approve') {
      const approved = await approveCompany(Number(companyId), session.name);
      return NextResponse.json({
        success: true,
        message: `Company ${approved.name} approved successfully!`,
        company: approved,
      });
    }

    // Action 2: Toggle Status (Suspend / Reactivate)
    if (action === 'toggle_status') {
      const updated = await toggleCompanyStatus(Number(companyId), session.name);
      return NextResponse.json({
        success: true,
        message: `Company ${updated.name} status updated to ${updated.status}`,
        company: updated,
      });
    }

    // Action 3: Update License & Expiration Date
    if (action === 'update_license') {
      const { licenseTier, licenseExpiresAt, maxUsers, status } = body;
      const updated = await updateCompanyLicense(
        Number(companyId),
        { licenseTier, licenseExpiresAt, maxUsers, status },
        session.name
      );
      return NextResponse.json({
        success: true,
        message: `Company ${updated.name} license parameters updated successfully!`,
        company: updated,
      });
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

