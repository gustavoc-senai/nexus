import { supabase } from '../lib/supabase'
export async function requestPasswordReset(email: string) { return supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` }) }
export async function updatePassword(password: string) { return supabase.auth.updateUser({ password }) }
