const WORKER_URL =
    "https://roblox-ai-fit-creator.6-lilsaggy-6.workers.dev";

async function generateOutfit() {
    const username = document.getElementById("username").value.trim();
    const message = document.getElementById("message");

    if (!username) {
        message.textContent = "Enter a Roblox username first!";
        return;
    }

    try {
        message.textContent = "1/2 Finding Roblox user...";

        const userURL =
            WORKER_URL +
            "/roblox/user?username=" +
            encodeURIComponent(username);

        const userResponse = await fetch(userURL);

        const userText = await userResponse.text();

        if (!userResponse.ok) {
            throw new Error(
                "USER REQUEST: HTTP " +
                userResponse.status +
                " — " +
                userText
            );
        }

        const userResult = JSON.parse(userText);

        if (!userResult.found || !userResult.user) {
            message.textContent = "Roblox user not found.";
            return;
        }

        const user = userResult.user;

        message.textContent =
            "2/2 Loading " + user.name + "'s avatar...";

        const avatarURL =
            WORKER_URL +
            "/roblox/avatar?userId=" +
            encodeURIComponent(user.id);

        const avatarResponse = await fetch(avatarURL);

        const avatarText = await avatarResponse.text();

        if (!avatarResponse.ok) {
            throw new Error(
                "AVATAR REQUEST: HTTP " +
                avatarResponse.status +
                " — " +
                avatarText
            );
        }

        const avatarResult = JSON.parse(avatarText);

        if (!avatarResult.success || !avatarResult.avatar) {
            throw new Error("Avatar data was empty.");
        }

        const avatar = avatarResult.avatar;

        let itemsHTML = "";

        if (avatar.assets && avatar.assets.length > 0) {
            itemsHTML = avatar.assets.map(asset => `
                <div>
                    <strong>${escapeHTML(asset.name)}</strong>
                    <br>
                    Type: ${escapeHTML(asset.assetType.name)}
                    <br>
                    Asset ID: ${asset.id}
                </div>
                <br>
            `).join("");
        } else {
            itemsHTML = "No avatar items found.";
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

            ${itemsHTML}
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
