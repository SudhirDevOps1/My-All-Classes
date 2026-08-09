import { neon } from '@neondatabase/serverless';

export async function onRequest(context) {
  const connectionString = context.env.NEON_DB_URL;
  
  if (!connectionString) {
    return new Response(JSON.stringify({ 
      error: 'Database connection string not configured. Add NEON_DB_URL to Cloudflare Pages settings.' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const sql = neon(connectionString);
  
  try {
    const subjects = await sql`SELECT * FROM subjects`;
    const sessions = await sql`SELECT * FROM sessions`;
    
    // Attempt to fetch new tables if they exist
    let appUsage = [];
    let blockRules = [];
    try {
      appUsage = await sql`SELECT * FROM app_usage`;
      blockRules = await sql`SELECT * FROM block_rules`;
    } catch (e) {
      // Ignore error if tables don't exist yet
      console.log('App usage or block rules tables missing, skipping.');
    }

    return new Response(JSON.stringify({ subjects, sessions, appUsage, blockRules }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
