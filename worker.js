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
      return new Response(
        JSON.stringify({
          success: true,
          message: "Roblox AI Fit Worker is running!"
        }),
        {
          status: 200,
          headers: corsHeaders
        }
      );
    }

    if (url.pathname !== "/roblox/user") {
      return new Response(
        JSON.stringify({
          error: "Route not found"
        }),
        {
          status: 404,
          headers: corsHeaders
        }
      );
    }

    const username = url.searchParams.get("username");

    if (!username) {
      return new Response(
        JSON.stringify({
          error: "Username is required"
        }),
        {
          status: 400,
          headers: corsHeaders
        }
      );
    }

    try {
      const robloxURL =
        "https://users.roblox.com/v1/users/search?keyword=" +
        encodeURIComponent(username) +
        "&limit=10";

      const robloxResponse = await fetch(robloxURL);

      const data = await robloxResponse.json();

      if (!robloxResponse.ok) {
        return new Response(
          JSON.stringify({
            error: "Roblox returned HTTP " + robloxResponse.status,
            details: data
          }),
          {
            status: robloxResponse.status,
            headers: corsHeaders
          }
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
        {
          status: 200,
          headers: corsHeaders
        }
      );

    } catch (error) {
      return new Response(
        JSON.stringify({
          error: error.message
        }),
        {
          status: 500,
          headers: corsHeaders
        }
      );
    }
  }
};
