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
      return response({
        success: true,
        message: "Roblox AI Fit Worker is running!"
      }, corsHeaders);
    }

    if (url.pathname === "/roblox/user") {
      const username = url.searchParams.get("username");

      if (!username) {
        return response({
          error: "Username is required"
        }, corsHeaders, 400);
      }

      // Try Roblox user search up to 3 times.
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const robloxResponse = await fetch(
            "https://users.roblox.com/v1/users/search?keyword=" +
            encodeURIComponent(username) +
            "&limit=10",
            {
              method: "GET",
              headers: {
                "User-Agent": "Mozilla/5.0"
              }
            }
          );

          const text = await robloxResponse.text();

          // Roblox/Cloudflare returned a temporary 522.
          if (robloxResponse.status === 522) {
            if (attempt < 3) {
              await new Promise(resolve => setTimeout(resolve, 1000));
              continue;
            }

            return response({
              error: "Roblox is temporarily unreachable.",
              details: "HTTP 522 after 3 attempts"
            }, corsHeaders, 503);
          }

          let data;

          try {
            data = JSON.parse(text);
          } catch {
            return response({
              error: "Roblox returned invalid data.",
              details: text
            }, corsHeaders, 502);
          }

          if (!robloxResponse.ok) {
            return response({
              error: "Roblox user API returned HTTP " +
                robloxResponse.status,
              details: data
            }, corsHeaders, robloxResponse.status);
          }

          const user = data.data?.find(
            u => u.name.toLowerCase() === username.toLowerCase()
          );

          return response({
            found: !!user,
            user: user || null
          }, corsHeaders);

        } catch (error) {
          if (attempt === 3) {
            return response({
              error: "User request failed",
              details: error.message
            }, corsHeaders, 503);
          }

          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    if (url.pathname === "/roblox/avatar") {
      const userId = url.searchParams.get("userId");

      if (!userId) {
        return response({
          error: "userId is required"
        }, corsHeaders, 400);
      }

      try {
        const robloxResponse = await fetch(
          "https://avatar.roblox.com/v1/users/" +
          encodeURIComponent(userId) +
          "/avatar",
          {
            headers: {
              "User-Agent": "Mozilla/5.0"
            }
          }
        );

        const text = await robloxResponse.text();

        let data;

        try {
          data = JSON.parse(text);
        } catch {
          return response({
            error: "Roblox returned invalid avatar data.",
            details: text
          }, corsHeaders, 502);
        }

        if (!robloxResponse.ok) {
          return response({
            error: "Roblox avatar API returned HTTP " +
              robloxResponse.status,
            details: data
          }, corsHeaders, robloxResponse.status);
        }

        return response({
          success: true,
          avatar: data
        }, corsHeaders);

      } catch (error) {
        return response({
          error: "Avatar request failed",
          details: error.message
        }, corsHeaders, 503);
      }
    }

    return response({
      error: "Route not found"
    }, corsHeaders, 404);
  }
};

function response(data, headers, status = 200) {
  return new Response(JSON.stringify(data), {
    status: status,
    headers: headers
  });
}
