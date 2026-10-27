import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth';
import { getAllAuditLogsForPlatformAdmin, getAuditLogs } from '@/lib/data-service';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.isPlatformAdmin) {
      const logs = await getAllAuditLogsForPlatformAdmin();
      return NextResponse.json({ success: true, logs });
    }

    // Company admin gets only their company logs
    const logs = await getAuditLogs(session.companyId);
    return NextResponse.json({ success: true, logs });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

