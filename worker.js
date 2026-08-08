export default {
  async fetch() {
    try {
      const response = await fetch("https://users.roblox.com/");

      return new Response(
        JSON.stringify({
          success: true,
          status: response.status
        }),
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }
  }
};
