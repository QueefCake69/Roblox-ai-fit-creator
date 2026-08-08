export default {
  async fetch(request) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*"
    };

    // Handle browser CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    const url = new URL(request.url);

    if (url.pathname !== "/roblox/user") {
      return new Response("Worker is running!", {
        status: 200,
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
      const robloxResponse = await fetch(
        "https://users.roblox.com/v1/users/search?keyword=" +
        encodeURIComponent(username) +
        "&limit=10"
      );

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
};
