export default {
  async fetch(request) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*"
    };

    // Allow browser CORS requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    const url = new URL(request.url);

    // Test page
    if (url.pathname === "/") {
      return new Response("Roblox AI Fit Worker is running!", {
        status: 200,
        headers: corsHeaders
      });
    }

    // Roblox username lookup
    if (url.pathname === "/roblox/user") {
      const username = url.searchParams.get("username");

      if (!username) {
        return new Response(
          JSON.stringify({
            error: "Username is required"
          }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json"
            }
          }
        );
      }

      try {
        const robloxResponse = await fetch(
          "https://users.roblox.com/v1/users/search?keyword=" +
          encodeURIComponent(username) +
          "&limit=10"
        );

        if (!robloxResponse.ok) {
          return new Response(
            JSON.stringify({
              error: "Roblox returned HTTP " + robloxResponse.status
            }),
            {
              status: robloxResponse.status,
              headers: {
                ...corsHeaders,
                "Content-Type": "application/json"
              }
            }
          );
        }

        const data = await robloxResponse.json();

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
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json"
            }
          }
        );

      } catch (error) {
        return new Response(
          JSON.stringify({
            error: error.message
          }),
          {
            status: 500,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json"
            }
          }
        );
      }
    }

    // Anything else
    return new Response("Not found", {
      status: 404,
      headers: corsHeaders
    });
  }
};
