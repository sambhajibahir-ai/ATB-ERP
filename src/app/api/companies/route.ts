import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth';
import {
  getCompanies,
  getCompanyById,
  createCompany,
  approveCompany,
  updateCompanyLicense,
  updateCompanyProfile,
  cancelCompanyLicense,
  toggleCompanyStatus,
  deleteCompany,
  createUser,
} from '@/lib/data-service';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

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

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.isPlatformAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Only Platform Super Admins can provision new companies directly.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      code,
      email,
      phone,
      taxId,
      gstin,
      address,
      licenseTier = 'Starter',
      licenseDays = 365,
      maxUsers = 10,
      adminName,
      adminEmail,
      adminPassword,
    } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Company Name and Email are required' }, { status: 400 });
    }

    const newCompany = await createCompany({
      name,
      code,
      email,
      phone,
      taxId,
      gstin,
      address,
      status: 'Active',
      licenseTier,
      licenseDays: Number(licenseDays),
      maxUsers: Number(maxUsers),
    });

    let adminUser = null;
    if (adminName && adminEmail && adminPassword) {
      adminUser = await createUser({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'Admin',
        department: 'Chief Executive Office (CEO)',
        companyId: newCompany.id,
        isCompanyAdmin: true,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Company ${newCompany.name} created successfully!`,
      company: newCompany,
      adminUser,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, companyId } = body;

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    // Action 0: Update Company Profile (Accessible by Tenant CEO for their own company, or Super Admin)
    if (action === 'update_profile') {
      if (!session.isPlatformAdmin && session.companyId !== Number(companyId)) {
        return NextResponse.json(
          { error: 'Forbidden: You can only edit your own company profile.' },
          { status: 403 }
        );
      }

      const updated = await updateCompanyProfile(
        Number(companyId),
        {
          name: body.name,
          operationsName: body.operationsName,
          registrationNumber: body.registrationNumber,
          documentTypeNote: body.documentTypeNote,
          taxId: body.taxId,
          gstin: body.gstin,
          email: body.email,
          phone: body.phone,
          address: body.address,
          currency: body.currency,
        },
        session.name
      );

      return NextResponse.json({
        success: true,
        message: `Company profile for ${updated.name} updated successfully!`,
        company: updated,
      });
    }

    // Platform Super Admin Only Actions below (Approvals, License extensions, Tier updates, Suspensions)
    if (!session.isPlatformAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Only Platform Super Admins can manage company approvals and licenses.' },
        { status: 403 }
      );
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

    // Action 3: Extend License
    if (action === 'extend_license') {
      const { additionalDays = 30 } = body;
      const targetCompany = await getCompanyById(Number(companyId));
      if (!targetCompany) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 });
      }

      const currentExpiry = new Date(targetCompany.licenseExpiresAt).getTime();
      const baseTime = currentExpiry > Date.now() ? currentExpiry : Date.now();
      const newExpiry = new Date(baseTime + Number(additionalDays) * 24 * 60 * 60 * 1000).toISOString();

      const updated = await updateCompanyLicense(
        Number(companyId),
        { licenseExpiresAt: newExpiry, status: 'Active' },
        session.name
      );

      return NextResponse.json({
        success: true,
        message: `Extended ${updated.name}'s license by ${additionalDays} days (Valid until ${new Date(newExpiry).toLocaleDateString()})`,
        company: updated,
      });
    }

    // Action 4: Update License & Expiration Date
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

    // Action 5: Cancel / Revoke Company Subscription License
    if (action === 'cancel_license') {
      const updated = await cancelCompanyLicense(Number(companyId), session.name);
      return NextResponse.json({
        success: true,
        message: `Subscription license for ${updated.name} has been cancelled! All user logins are now suspended.`,
        company: updated,
      });
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.isPlatformAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Only Platform Super Admins can decommission company accounts.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('id');

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    if (Number(companyId) === 1) {
      return NextResponse.json({ error: 'Cannot delete the primary platform company' }, { status: 400 });
    }

    const success = await deleteCompany(Number(companyId), session.name);
    if (!success) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Company organization and associated tenant data successfully decommissioned.',
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

