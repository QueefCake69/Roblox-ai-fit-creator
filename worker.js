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

    // Worker health check
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

    // Find Roblox user
    if (url.pathname === "/roblox/user") {
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
        const response = await fetch(
          "https://users.roblox.com/v1/users/search?keyword=" +
          encodeURIComponent(username) +
          "&limit=10"
        );

        const data = await response.json();

        if (!response.ok) {
          return new Response(
            JSON.stringify({
              error: "Roblox returned HTTP " + response.status
            }),
            {
              status: response.status,
              headers: corsHeaders
            }
          );
        }

        const user = data.data?.find(
          u => u.name.toLowerCase() === username.toLowerCase()
        );

        if (!user) {
          return new Response(
            JSON.stringify({
              found: false,
              user: null
            }),
            {
              status: 200,
              headers: corsHeaders
            }
          );
        }

        return new Response(
          JSON.stringify({
            found: true,
            user: user
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

    // Get user's avatar
    if (url.pathname === "/roblox/avatar") {
      const userId = url.searchParams.get("userId");

      if (!userId) {
        return new Response(
          JSON.stringify({
            error: "userId is required"
          }),
          {
            status: 400,
            headers: corsHeaders
          }
        );
      }

      try {
        const avatarResponse = await fetch(
          "https://avatar.roblox.com/v1/users/" +
          encodeURIComponent(userId) +
          "/avatar"
        );

        const avatarData = await avatarResponse.json();

        if (!avatarResponse.ok) {
          return new Response(
            JSON.stringify({
              error: "Roblox avatar API returned HTTP " +
                avatarResponse.status,
              details: avatarData
            }),
            {
              status: avatarResponse.status,
              headers: corsHeaders
            }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            avatar: avatarData
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
};
