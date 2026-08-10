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
    
    let appUsageJSON = "[]";
    let blockRulesJSON = "[]";
    
    try {
      const auRes = await sql`SELECT COALESCE(json_agg(row_to_json(app_usage)), '[]')::text AS json FROM app_usage`;
      if (auRes.length > 0) appUsageJSON = auRes[0].json;
      
      const brRes = await sql`SELECT COALESCE(json_agg(row_to_json(block_rules)), '[]')::text AS json FROM block_rules`;
      if (brRes.length > 0) blockRulesJSON = brRes[0].json;
    } catch (e) {
      console.log('App usage or block rules tables missing, skipping.');
    }

    const responseBody = `{
      "subjects": ${JSON.stringify(subjects)},
      "sessions": ${JSON.stringify(sessions)},
      "appUsage": ${appUsageJSON},
      "blockRules": ${blockRulesJSON}
    }`;

    return new Response(responseBody, {
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
