const WORKER_URL =
    "https://roblox-ai-fit-creator.6-lilsaggy-6.workers.dev";

async function generateOutfit() {
    const username = document.getElementById("username").value.trim();
    const message = document.getElementById("message");

    if (!username) {
        message.textContent = "Enter a Roblox username first!";
        return;
    }

    message.textContent = "Finding Roblox user...";

    try {
        // Find the Roblox user
        const userResponse = await fetch(
            WORKER_URL + "/roblox/user?username=" +
            encodeURIComponent(username)
        );

        const userResult = await userResponse.json();

        if (!userResponse.ok) {
            throw new Error(
                "User lookup failed: HTTP " + userResponse.status
            );
        }

        if (!userResult.found) {
            message.textContent = "Roblox user not found.";
            return;
        }

        const user = userResult.user;

        message.textContent = "Loading avatar...";

        // Get the avatar
        const avatarResponse = await fetch(
            WORKER_URL + "/roblox/avatar?userId=" +
            encodeURIComponent(user.id)
        );

        const avatarResult = await avatarResponse.json();

        if (!avatarResponse.ok) {
            throw new Error(
                "Avatar lookup failed: HTTP " + avatarResponse.status
            );
        }

        if (!avatarResult.success) {
            throw new Error("Avatar data could not be loaded.");
        }

        const avatar = avatarResult.avatar;

        // Create the item list
        let items = "";

        if (avatar.assets && avatar.assets.length > 0) {
            for (const asset of avatar.assets) {
                items += `
                    <div>
                        <strong>${escapeHTML(asset.name)}</strong>
                        <br>
                        Type: ${escapeHTML(asset.assetType.name)}
                        <br>
                        ID: ${asset.id}
                    </div>
                    <br>
                `;
            }
        } else {
            items = "No avatar items found.";
        }

        message.innerHTML = `
            <h2>🔥 ${escapeHTML(user.displayName)}</h2>

            <p>
                <strong>Username:</strong>
                ${escapeHTML(user.name)}
            </p>

            <p>
                <strong>User ID:</strong>
                ${user.id}
            </p>

            <h3>👕 Current Avatar Items</h3>

            ${items}
        `;

    } catch (error) {
        console.error(error);
        message.textContent = "ERROR: " + error.message;
    }
}

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
