// js/supabase.js
const SUPABASE_URL = 'https://rwvhdykxdedtefnpaygv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3dmhkeWt4ZGVkdGVmbnBheWd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4MjIzODIsImV4cCI6MjEwMDM5ODM4Mn0.X_0NvlZg0YjwC7ZpyY-nVidgoVv91jY1e-DT6zVqRGs'; // Ta clé "anon public" collée ici

// Initialisation sécurisée
if (typeof window.supabaseClient === 'undefined') {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

var supabase = window.supabaseClient;
