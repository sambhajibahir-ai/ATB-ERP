import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserById,
  getAllUsersForPlatformAdmin,
} from '@/lib/data-service';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetCompanyId = searchParams.get('companyId');

    let users;
    if (session.isPlatformAdmin && targetCompanyId === 'all') {
      users = await getAllUsersForPlatformAdmin();
    } else if (session.isPlatformAdmin && targetCompanyId) {
      users = await getUsers(Number(targetCompanyId));
    } else {
      users = await getUsers(session.companyId);
    }

    return NextResponse.json({ success: true, users });
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

    // Only Admin or CEO can provision team sub-accounts
    if (session.role !== 'Admin' && !session.isCompanyAdmin && !session.isPlatformAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Only the Company CEO or Administrator can provision sub-accounts.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, password, role, department, companyId } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Name, email, password, and role are required' },
        { status: 400 }
      );
    }

    // Platform admin can specify target companyId; Company CEO can only add to their own company
    const effectiveCompanyId = session.isPlatformAdmin && companyId ? Number(companyId) : session.companyId;

    const newUser = await createUser({
      companyId: effectiveCompanyId,
      name: name.trim(),
      email: email.trim(),
      password,
      role,
      department: department || 'Enterprise Operations',
      isCompanyAdmin: false, // sub-account
    });

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
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
    const { id, name, role, department, status, password } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const existingUser = await getUserById(Number(id));
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Ensure company CEO can only modify their own company's users
    if (!session.isPlatformAdmin && existingUser.companyId !== session.companyId) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to modify users of another company.' },
        { status: 403 }
      );
    }

    const updated = await updateUser(Number(id), {
      name,
      role,
      department,
      status,
      password,
    });

    return NextResponse.json({ success: true, user: updated });
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const existingUser = await getUserById(Number(id));
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Ensure company CEO can only delete their own company's users
    if (!session.isPlatformAdmin && existingUser.companyId !== session.companyId) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to delete users of another company.' },
        { status: 403 }
      );
    }

    if (existingUser.isCompanyAdmin && !session.isPlatformAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: The company primary CEO account cannot be deleted.' },
        { status: 403 }
      );
    }

    const success = await deleteUser(Number(id));
    if (!success) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Sub-account decommissioned successfully' });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
