// Vercel Cron endpoint for background GitHub sync
// Runs daily at 4 AM UTC to refresh GitHub project data
// Protected by CRON_SECRET to prevent unauthorized access

import { syncGitHubProjects } from "@/lib/actions/github";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Verify request is from Vercel Cron (or authorized caller)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("CRON_SECRET not configured");
    return new Response("Server configuration error", { status: 500 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    console.warn("Unauthorized cron request");
    return new Response("Unauthorized", { status: 401 });
  }

  console.log("Starting GitHub sync cron job...");

  const result = await syncGitHubProjects();

  if (result.success && result.data) {
    const { synced, hidden, errors } = result.data;

    console.log(`GitHub sync complete: ${synced} synced, ${hidden} hidden`);

    if (errors.length > 0) {
      console.warn("Sync errors:", errors);
    }

    return Response.json({
      success: true,
      synced,
      hidden,
      errors: errors.length > 0 ? errors : undefined,
    });
  } else {
    console.error("GitHub sync failed:", result.error);

    return Response.json(
      { success: false, error: result.error },
      { status: 500 }
    );
  }
}
