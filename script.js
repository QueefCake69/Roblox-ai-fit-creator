async function generateOutfit() {
    const username = document.getElementById("username").value.trim();
    const message = document.getElementById("message");

    if (!username) {
        message.textContent = "Enter a Roblox username first!";
        return;
    }

    message.textContent = "Finding Roblox user...";

    try {
        const response = await fetch("https://users.roblox.com/v1/usernames/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                usernames: [username],
                excludeBannedUsers: true
            })
        });

        if (!response.ok) {
            throw new Error("Roblox returned HTTP " + response.status);
        }

        const result = await response.json();

        if (!result.data || result.data.length === 0) {
            message.textContent = "Roblox user not found.";
            return;
        }

        const user = result.data[0];

        message.innerHTML = `
            <strong>Found them! 🔥</strong><br><br>
            Username: ${user.name}<br>
            Display Name: ${user.displayName}<br>
            User ID: ${user.id}
        `;

    } catch (error) {
        console.error(error);
        message.textContent = "ERROR: " + error.message;
    }
}
