export default {
  async fetch(request) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
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

    if (url.pathname === "/") {
      return json({
        success: true,
        message: "Roblox AI Fit Worker is running!"
      }, corsHeaders);
    }

    if (url.pathname === "/roblox/user") {
      const username = url.searchParams.get("username");

      if (!username) {
        return json({
          error: "Username is required"
        }, corsHeaders, 400);
      }

      try {
        const robloxURL =
          "https://users.roblox.com/v1/users/search?keyword=" +
          encodeURIComponent(username) +
          "&limit=10";

        const response = await fetch(robloxURL, {
          headers: {
            "User-Agent": "Roblox-AI-Fit"
          }
        });

        const text = await response.text();

        if (!response.ok) {
          return json({
            error: "Roblox user API returned HTTP " + response.status,
            details: text
          }, corsHeaders, response.status);
        }

        let data;

        try {
          data = JSON.parse(text);
        } catch {
          return json({
            error: "Roblox returned invalid JSON",
            details: text
          }, corsHeaders, 502);
        }

        const user = data.data?.find(
          u => u.name.toLowerCase() === username.toLowerCase()
        );

        return json({
          found: !!user,
          user: user || null
        }, corsHeaders);

      } catch (error) {
        return json({
          error: "User request failed",
          details: error.message
        }, corsHeaders, 500);
      }
    }

    if (url.pathname === "/roblox/avatar") {
      const userId = url.searchParams.get("userId");

      if (!userId) {
        return json({
          error: "userId is required"
        }, corsHeaders, 400);
      }

      try {
        const robloxURL =
          "https://avatar.roblox.com/v1/users/" +
          encodeURIComponent(userId) +
          "/avatar";

        const response = await fetch(robloxURL, {
          headers: {
            "User-Agent": "Roblox-AI-Fit"
          }
        });

        const text = await response.text();

        if (!response.ok) {
          return json({
            error: "Roblox avatar API returned HTTP " + response.status,
            details: text
          }, corsHeaders, response.status);
        }

        let data;

        try {
          data = JSON.parse(text);
        } catch {
          return json({
            error: "Roblox returned invalid JSON",
            details: text
          }, corsHeaders, 502);
        }

        return json({
          success: true,
          avatar: data
        }, corsHeaders);

      } catch (error) {
        return json({
          error: "Avatar request failed",
          details: error.message
        }, corsHeaders, 500);
      }
    }

    return json({
      error: "Route not found"
    }, corsHeaders, 404);
  }
};

function json(data, headers, status = 200) {
  return new Response(JSON.stringify(data), {
    status: status,
    headers: headers
  });
}
