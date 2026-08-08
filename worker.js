export default {
  async fetch(request) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "*",
      "Content-Type": "application/json"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    const url = new URL(request.url);

    // =========================
    // WORKER TEST
    // =========================

    if (url.pathname === "/") {
      return json({
        success: true,
        message: "Roblox AI Fit Worker is running!"
      }, corsHeaders);
    }

    // =========================
    // USERNAME → USER ID
    // =========================

    if (url.pathname === "/roblox/user") {
      const username = url.searchParams.get("username");

      if (!username) {
        return json({
          error: "Username is required"
        }, corsHeaders, 400);
      }

      try {
        const response = await fetch(
          "https://users.roblox.com/v1/users/search",
          {
            method: "GET",
            headers: {
              "Accept": "application/json",
              "User-Agent": "Mozilla/5.0"
            }
          }
        );

        // IMPORTANT:
        // We don't actually use this response.
        // This route is intentionally handled below.
      } catch (error) {
        // Ignore
      }

      /*
       * Roblox's username search can return 520/522
       * when called from Cloudflare.
       *
       * Try the username endpoint instead.
       */

      try {
        const response = await fetch(
          "https://users.roblox.com/v1/usernames/users",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
              "User-Agent": "Mozilla/5.0"
            },
            body: JSON.stringify({
              usernames: [username],
              excludeBannedUsers: false
            })
          }
        );

        const text = await response.text();

        if (!response.ok) {
          return json({
            error: "Roblox username lookup failed",
            status: response.status,
            details: text
          }, corsHeaders, 502);
        }

        const data = JSON.parse(text);

        if (!data.data || data.data.length === 0) {
          return json({
            found: false,
            user: null
          }, corsHeaders);
        }

        const user = data.data[0];

        return json({
          found: true,
          user: {
            id: user.id,
            name: user.name,
            displayName: user.displayName,
            previousUsernames: user.previousUsernames || [],
            hasVerifiedBadge: user.hasVerifiedBadge || false
          }
        }, corsHeaders);

      } catch (error) {
        return json({
          error: "Username lookup failed",
          details: error.message
        }, corsHeaders, 502);
      }
    }

    // =========================
    // USER ID → AVATAR
    // =========================

    if (url.pathname === "/roblox/avatar") {
      const userId = url.searchParams.get("userId");

      if (!userId) {
        return json({
          error: "userId is required"
        }, corsHeaders, 400);
      }

      try {
        const response = await fetch(
          "https://avatar.roblox.com/v1/users/" +
          encodeURIComponent(userId) +
          "/avatar",
          {
            method: "GET",
            headers: {
              "Accept": "application/json",
              "User-Agent": "Mozilla/5.0"
            }
          }
        );

        const text = await response.text();

        if (!response.ok) {
          return json({
            error: "Roblox avatar API returned HTTP " +
              response.status,
            details: text
          }, corsHeaders, response.status);
        }

        const data = JSON.parse(text);

        return json({
          success: true,
          avatar: data
        }, corsHeaders);

      } catch (error) {
        return json({
          error: "Avatar request failed",
          details: error.message
        }, corsHeaders, 502);
      }
    }

    return json({
      error: "Route not found"
    }, corsHeaders, 404);
  }
};

function json(data, headers, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers
  });
}
