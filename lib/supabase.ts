import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qybgoxczkiphrtkeyvtj.supabase.co';
const supabaseKey = 'sb_publishable_FUzT6cV-krcXpdPidpGS1w_1rH_CYan';

export const supabase = createClient(supabaseUrl, supabaseKey);