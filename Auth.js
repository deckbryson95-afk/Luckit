import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const SUPABASE_URL = "https://mmrvamxpqqsozijrrnlx.supabase.co";
const SUPABASE_KEY = "sb_publishable_5rSQewEmqfaEDleTv93jIw_A_dUBT1Q";
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
 auth: {
 persistSession: true,
 autoRefreshToken: true,
 detectSessionInUrl: true
 }
});
export const accountEmail = username =>
 `${String(username).trim().toLowerCase()}@luckit.com`;
export async function getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    return error ? null : data.user;
}
export async function getProfile() {
    const user = await getCurrentUser();
    if (!user) return { user: null, profile: null, error: null };
    const { data, error } = await supabase
 .from("profiles")
 .select("id,username,lucks,blooks_unlocked,packs_opened,tokens,last_hourly_reward,is_Admin,is_banned,ban_reason")
 .eq("id", user.id)
 .maybeSingle();
    return { user, profile: data, error };
}
export async function logIn(username, password) {
    username = String(username).trim().toLowerCase();
    if (!username) return { error: { message: "Enter your username." } };
    if (!password) return { error: { message: "Enter your password." } };
    return await supabase.auth.signInWithPassword({
 email: accountEmail(username),
 password
}
);
}

export async function signUp(username, password) {
    username = String(username).trim().toLowerCase();
    if (!/^[a-z0-9_]+$/.test(username))
 return { error: { message: "Username can only contain letters, numbers, and underscores." } };
    if (username.length < 3 || username.length > 20)
 return { error: { message: "Username must be between 3 and 20 characters." } };
    if (password.length < 6)
 return { error: { message: "Password must be at least 6 characters." } };
    const { data: existing, error: checkError } = await supabase
 .from("profiles")
 .select("id")
 .eq("username", username)
 .maybeSingle();
    if (checkError) return { error: { message: checkError.message } };
    if (existing) return { error: { message: "That username is already taken." } };
    const { data, error } = await supabase.auth.signUp({
 email: accountEmail(username),
 password
}
);
if (error) return { error };
if (!data.user) return { error: { message: "Account creation failed." } };
if (!data.session)
 return { data, error: { message: "Account created. Email confirmation is required before you can log in." } };
const { error: profileError } = await supabase.from("profiles").insert({
 id: data.user.id,
 username,
 lucks: 0,
 blooks_unlocked: 0,
 packs_opened: 0,
 tokens: 0
 });
if (profileError) {
    await supabase.auth.signOut({ scope: "local"
}
);
return { error: { message: profileError.message } };
}

 return { data, error: null };
}

export async function logOut() {
    return await supabase.auth.signOut({ scope: "local"
}
);
}

export async function claimHourlyReward() {
    const user = await getCurrentUser();
    if (!user) return { data: null, error: { message: "You must be logged in." } };
    const { data, error } = await supabase.rpc("claim_hourly_reward");
    return { data: Array.isArray(data) ? data[0] : data, error };
}
export async function spinDailyWheel() {
    const user = await getCurrentUser();
    if (!user) return { data: null, error: { message: "You must be logged in." } };
    const { data, error } = await supabase.rpc("spin_daily_wheel");
    return { data: Array.isArray(data) ? data[0] : data, error };
}
