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

    // Test
    if (url.pathname === "/") {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Roblox AI Fit Worker is running!"
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    // USER LOOKUP
    if (url.pathname === "/roblox/user") {
      const username = url.searchParams.get("username");

      if (!username) {
        return new Response(
          JSON.stringify({ error: "Username is required" }),
          { status: 400, headers: corsHeaders }
        );
      }

      try {
        const response = await fetch(
          "https://users.roblox.com/v1/users/search?keyword=" +
          encodeURIComponent(username) +
          "&limit=10"
        );

        const data = await response.json();

        if (!response.ok) {
          return new Response(
            JSON.stringify({
              error: "Roblox user API error",
              status: response.status,
              details: data
            }),
            { status: response.status, headers: corsHeaders }
          );
        }

        const user = data.data?.find(
          u => u.name.toLowerCase() === username.toLowerCase()
        );

        return new Response(
          JSON.stringify({
            found: !!user,
            user: user || null
          }),
          { status: 200, headers: corsHeaders }
        );

      } catch (error) {
        return new Response(
          JSON.stringify({
            error: "User request failed",
            details: error.message
          }),
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // AVATAR LOOKUP
    if (url.pathname === "/roblox/avatar") {
      const userId = url.searchParams.get("userId");

      if (!userId) {
        return new Response(
          JSON.stringify({ error: "userId is required" }),
          { status: 400, headers: corsHeaders }
        );
      }

      try {
        const avatarURL =
          "https://avatar.roblox.com/v1/users/" +
          encodeURIComponent(userId) +
          "/avatar";

        const response = await fetch(avatarURL);

        const text = await response.text();

        let data;

        try {
          data = JSON.parse(text);
        } catch {
          data = { rawResponse: text };
        }

        if (!response.ok) {
          return new Response(
            JSON.stringify({
              error: "Roblox avatar API error",
              status: response.status,
              details: data
            }),
            { status: response.status, headers: corsHeaders }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            avatar: data
          }),
          { status: 200, headers: corsHeaders }
        );

      } catch (error) {
        return new Response(
          JSON.stringify({
            error: "Avatar request failed",
            details: error.message
          }),
          { status: 500, headers: corsHeaders }
        );
      }
    }

    return new Response(
      JSON.stringify({
        error: "Route not found",
        path: url.pathname
      }),
      { status: 404, headers: corsHeaders }
    );
  }
};
