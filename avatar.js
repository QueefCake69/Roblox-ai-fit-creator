const WORKER_URL =
    "https://roblox-ai-fit-creator.6-lilsaggy-6.workers.dev";

async function generateOutfit() {
    const usernameElement = document.getElementById("username");
    const messageElement = document.getElementById("message");

    const username = usernameElement.value.trim();

    if (!username) {
        messageElement.textContent = "Enter a Roblox username first!";
        return;
    }

    messageElement.textContent = "🔎 Finding " + username + "...";

    try {
        // Find the Roblox user
        const userResponse = await fetch(
            WORKER_URL +
            "/roblox/user?username=" +
            encodeURIComponent(username) +
            "&v=" + Date.now(),
            {
                cache: "no-store"
            }
        );

        const userText = await userResponse.text();

        if (!userResponse.ok) {
            throw new Error(
                "User lookup failed: HTTP " +
                userResponse.status +
                " — " +
                userText
            );
        }

        const userData = JSON.parse(userText);

        if (!userData.found || !userData.user) {
            messageElement.textContent =
                "❌ Roblox user not found.";
            return;
        }

        const user = userData.user;

        messageElement.textContent =
            "🧍 Loading " + user.name + "'s avatar...";

        // Get the avatar using the ID we just found
        const avatarResponse = await fetch(
            WORKER_URL +
            "/roblox/avatar?userId=" +
            encodeURIComponent(user.id) +
            "&v=" + Date.now(),
            {
                cache: "no-store"
            }
        );

        const avatarText = await avatarResponse.text();

        if (!avatarResponse.ok) {
            throw new Error(
                "Avatar lookup failed: HTTP " +
                avatarResponse.status +
                " — " +
                avatarText
            );
        }

        const avatarData = JSON.parse(avatarText);

        if (!avatarData.success || !avatarData.avatar) {
            throw new Error("No avatar data was returned.");
        }

        const avatar = avatarData.avatar;

        let itemsHTML = "";

        if (avatar.assets && avatar.assets.length > 0) {
            itemsHTML = avatar.assets.map(asset => `
                <div class="avatar-item">
                    <strong>${escapeHTML(asset.name)}</strong>
                    <br>
                    Type: ${escapeHTML(asset.assetType.name)}
                    <br>
                    Asset ID: ${asset.id}
                </div>
                <br>
            `).join("");
        } else {
            itemsHTML = "<p>No avatar items found.</p>";
        }

        messageElement.innerHTML = `
            <div class="avatar-result">

                <h2>🔥 ${escapeHTML(user.displayName)}</h2>

                <p>
                    <strong>Username:</strong>
                    ${escapeHTML(user.name)}
                </p>

                <p>
                    <strong>Roblox ID:</strong>
                    ${user.id}
                </p>

                <h3>👕 Current Avatar</h3>

                ${itemsHTML}

            </div>
        `;

    } catch (error) {
        console.error(error);

        messageElement.innerHTML = `
            <strong>❌ ERROR</strong>
            <br><br>
            ${escapeHTML(error.message)}
        `;
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
