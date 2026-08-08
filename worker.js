export default {
  async fetch(request) {
    const url = new URL(request.url);

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders
      });
    }

    if (url.pathname !== "/roblox/user") {
      return new Response("Not found", {
        status: 404,
        headers: corsHeaders
      });
    }

    const username = url.searchParams.get("username");

    if (!username) {
      return new Response(
        JSON.stringify({ error: "Username is required" }),
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
      const robloxURL =
        "https://users.roblox.com/v1/users/search?keyword=" +
        encodeURIComponent(username) +
        "&limit=10";

      const response = await fetch(robloxURL);

      if (!response.ok) {
        return new Response(
          JSON.stringify({
            error: "Roblox returned HTTP " + response.status
          }),
          {
            status: response.status,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json"
            }
          }
        );
      }

      const data = await response.json();

      const user = data.data?.find(
        u => u.name.toLowerCase() === username.toLowerCase()
      );

      return new Response(
        JSON.stringify({
          found: !!user,
          user: user || null
        }),
        {
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
};
