import { error, json } from '@sveltejs/kit';


import { SUPABASE_KEY, SUPABASE_URL } from '$env/static/private'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY!);


export async function GET({ url }) {
    const res = await supabase.from("payloads").select("request_id, task_type");

    return json(res.data);
}