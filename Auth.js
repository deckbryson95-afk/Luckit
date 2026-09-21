import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://mjkieyjmdkgvoywwbgcn.supabase.co";
const SUPABASE_KEY = "sb_publishable_IuH3kfIixAOSS2FwxirUtg_EJ89PD9o";

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

export async function signUp(username, password) {

    username = username.trim().toLowerCase();

    if (!/^[a-z0-9_]+$/.test(username)) {
        return {
            error: {
                message: "Username can only contain letters, numbers, and underscores."
            }
        };
    }

    if (username.length < 3) {
        return {
            error: {
                message: "Username must be at least 3 characters."
            }
        };
    }

    if (password.length < 6) {
        return {
            error: {
                message: "Password must be at least 6 characters."
            }
        };
    }

    const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .maybeSingle();

    if (existingProfile) {
        return {
            error: {
                message: "That username is already taken."
            }
        };
    }

    const email = username + "@lucklit.local";

    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password
    });

    if (error) {
        return { error };
    }

    if (!data.user) {
        return {
            error: {
                message: "Account creation failed."
            }
        };
    }

    if (!data.session) {
        return {
            error: {
                message: "Account created, but email confirmation is enabled in Supabase."
            }
        };
    }

    const { error: profileError } = await supabase
        .from("profiles")
        .insert({
            id: data.user.id,
            username: username,
            lucks: 0,
            blooks_unlocked: 0,
            packs_opened: 0
        });

    if (profileError) {
        await supabase.auth.signOut();

        return {
            error: {
                message: "Could not create your profile."
            }
        };
    }

    return {
        data
    };
}

export async function logIn(username, password) {

    username = username.trim().toLowerCase();

    const email = username + "@lucklit.local";

    return await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });
}

export async function logOut() {
    return await supabase.auth.signOut();
}

export async function getCurrentUser() {

    const {
        data: {
            user
        }
    } = await supabase.auth.getUser();

    return user;
}

export async function getProfile() {

    const user = await getCurrentUser();

    if (!user) {
        return {
            user: null,
            profile: null,
            error: null
        };
    }

    const { data, error } = await supabase
        .from("profiles")
        .select("username, lucks, blooks_unlocked, packs_opened")
        .eq("id", user.id)
        .single();

    return {
        user,
        profile: data,
        error
    };
}