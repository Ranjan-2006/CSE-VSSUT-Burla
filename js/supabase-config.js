import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://ycwkzwgnhqxmeuozqinz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inljd2t6d2duaHF4bWV1b3pxaW56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwODkyODIsImV4cCI6MjA5NDY2NTI4Mn0.5CdhlRe2s8XoBHaHSq6iAmG43CtxYKt1mAzHJ6yykkc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: window.sessionStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});