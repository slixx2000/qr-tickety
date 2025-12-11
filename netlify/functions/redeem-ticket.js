const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if(!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) console.warn('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Netlify');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

exports.handler = async function(event) {
  try{
    if(event.httpMethod !== 'POST') return { statusCode:405, body: JSON.stringify({ message:'Method Not Allowed' }) };
    const body = JSON.parse(event.body || '{}');
    const code = body.code;
    const scanner = body.scanner || 'netlify-func';
    if(!code) return { statusCode:400, body: JSON.stringify({ message:'Missing code' }) };

    // Call redeem RPC
    const { data, error } = await supabase.rpc('redeem_ticket', { p_code: code, p_scanner: scanner });
    if(error) {
      console.error('RPC error', error);
      await supabase.from('scans').insert([{ ticket_id: null, scanner, success: false, note: error.message }]);
      return { statusCode:500, body: JSON.stringify({ message: 'Internal error' }) };
    }

    if(!data || data.length === 0) {
      await supabase.from('scans').insert([{ ticket_id: null, scanner, success: false, note: 'not_found_or_used' }]);
      return { statusCode:404, body: JSON.stringify({ message: 'Ticket not found or already used' }) };
    }

    const ticket = data[0];
    await supabase.from('scans').insert([{ ticket_id: ticket.id, scanner, success: true }]);
    return { statusCode:200, body: JSON.stringify({ id: ticket.id, code: ticket.code, used: ticket.used }) };

  } catch(err){
    console.error(err);
    return { statusCode:500, body: JSON.stringify({ message: err.message }) };
  }
};
