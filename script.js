async function generateOutfit() {
    const username = document.getElementById("username").value.trim();
    const message = document.getElementById("message");

    if (!username) {
        message.textContent = "Enter a Roblox username first!";
        return;
    }

    message.textContent = "Finding Roblox user...";

    try {
        const workerURL =
            "https://roblox-ai-fit-creator.6-lilsaggy-6.workers.dev/roblox/user?username=" +
            encodeURIComponent(username);

        const response = await fetch(workerURL);

        if (!response.ok) {
            throw new Error("Worker returned HTTP " + response.status);
        }

        const result = await response.json();

        if (!result.found) {
            message.textContent = "Roblox user not found.";
            return;
        }

        const user = result.user;

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
