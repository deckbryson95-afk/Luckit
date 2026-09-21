import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://mjkieyjmdkgvoywwbgcn.supabase.co";
const SUPABASE_KEY = "sb_publishable_guhukPTVtX9LVN2JiIwaow_Wvv1BJ2g";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const links = [
  ["Home", "index.html"],
  ["Stats", "stats.html"],
  ["Market", "market.html"],
  ["Inventory", "inventory.html"],
  ["Friends", "friends.html"],
  ["Chat", "chat.html"],
  ["Profile", "profile.html"],
  ["Settings", "settings.html"]
];

export async function setupNav() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, tokens, is_Admin")
    .eq("id", user.id)
    .maybeSingle();

  const nav = document.createElement("aside");
  nav.className = "luckit-nav";

  let html = `
    <div class="nav-brand">
      <div class="nav-logo">LUCKIT</div>
      <div class="nav-user">${escapeHtml(profile?.username || "Player")}</div>
    </div>

    <div class="nav-links">
  `;

  for (const [name, href] of links) {
    const active = location.pathname.endsWith(href);
    html += `
      <a class="nav-link ${active ? "active" : ""}" href="${href}">
        ${name}
      </a>
    `;
  }

  if (profile?.is_Admin === true) {
    html += `
      <a class="nav-link admin-link ${location.pathname.endsWith("admin.html") ? "active" : ""}" href="admin.html">
        Admin Panel
      </a>
    `;
  }

  html += `
    </div>

    <div class="nav-bottom">
      <div class="nav-tokens">
        <span>Tokens</span>
        <strong>${Number(profile?.tokens || 0).toLocaleString()}</strong>
      </div>

      <button id="logoutButton" class="logout-button">Log Out</button>
    </div>
  `;

  nav.innerHTML = html;
  document.body.prepend(nav);

  document.body.classList.add("has-luckit-nav");

  document.getElementById("logoutButton").addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "login.html";
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function addNavStyles() {
  const style = document.createElement("style");

  style.textContent = `
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background: #07552f;
      color: #f4f7f4;
      font-family: Arial, Helvetica, sans-serif;
    }

    .has-luckit-nav {
      padding-left: 220px;
    }

    .luckit-nav {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      width: 220px;
      background: #063d23;
      border-right: 1px solid #14633b;
      display: flex;
      flex-direction: column;
      z-index: 1000;
    }

    .nav-brand {
      padding: 22px 18px 18px;
      border-bottom: 1px solid #14633b;
    }

    .nav-logo {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: 1px;
    }

    .nav-user {
      margin-top: 5px;
      color: #9db8a7;
      font-size: 13px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .nav-links {
      padding: 12px 10px;
      display: flex;
      flex-direction: column;
      gap: 3px;
      overflow-y: auto;
    }

    .nav-link {
      display: block;
      padding: 11px 12px;
      color: #c6d7cc;
      text-decoration: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 700;
    }

    .nav-link:hover {
      background: #0a4b2c;
      color: #ffffff;
    }

    .nav-link.active {
      background: #167342;
      color: #ffffff;
    }

    .nav-link.admin-link {
      margin-top: 8px;
      border-top: 1px solid #14633b;
      border-radius: 0 0 6px 6px;
      padding-top: 15px;
      color: #d9f5e2;
    }

    .nav-bottom {
      margin-top: auto;
      padding: 12px;
      border-top: 1px solid #14633b;
    }

    .nav-tokens {
      background: #052f1b;
      border: 1px solid #145b36;
      border-radius: 6px;
      padding: 10px;
      margin-bottom: 8px;
    }

    .nav-tokens span {
      display: block;
      color: #91aa9a;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: .5px;
    }

    .nav-tokens strong {
      display: block;
      margin-top: 3px;
      font-size: 17px;
    }

    .logout-button {
      width: 100%;
      border: 1px solid #245f3e;
      background: #0b482b;
      color: #dce8df;
      padding: 10px;
      border-radius: 6px;
      font-weight: 700;
      cursor: pointer;
    }

    .logout-button:hover {
      background: #115837;
    }

    @media (max-width: 700px) {
      .has-luckit-nav {
        padding-left: 0;
        padding-bottom: 70px;
      }

      .luckit-nav {
        top: auto;
        width: 100%;
        height: 64px;
        flex-direction: row;
        border-right: 0;
        border-top: 1px solid #14633b;
      }

      .nav-brand,
      .nav-bottom {
        display: none;
      }

      .nav-links {
        width: 100%;
        flex-direction: row;
        overflow-x: auto;
        padding: 8px;
      }

      .nav-link {
        white-space: nowrap;
      }

      .nav-link.admin-link {
        margin-top: 0;
        border-top: 0;
      }
    }
  `;

  document.head.appendChild(style);
}