const WORKER_URL = "https://roblox-ai-fit-creator.6-lilsaggy-6.workers.dev";

async function generateOutfit() {
    const username = document.getElementById("username").value.trim();
    const message = document.getElementById("message");

    if (!username) {
        message.textContent = "Enter a Roblox username first!";
        return;
    }

    message.textContent = "Finding " + username + "...";

    try {
        const userResponse = await fetch(
            WORKER_URL + "/roblox/user?username=" + encodeURIComponent(username),
            {
                method: "GET",
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
            message.textContent = "Roblox user not found.";
            return;
        }

        const user = userData.user;

        message.textContent =
            "Loading " + user.name + "'s avatar...";

        const avatarResponse = await fetch(
            WORKER_URL +
            "/roblox/avatar?userId=" +
            encodeURIComponent(user.id),
            {
                method: "GET",
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
            throw new Error("Avatar data was not returned.");
        }

        const assets = avatarData.avatar.assets || [];

        let items = "";

        assets.forEach(function(asset) {
            items += `
                <div class="avatar-item">
                    <strong>${escapeHTML(asset.name)}</strong><br>
                    Type: ${escapeHTML(asset.assetType.name)}<br>
                    Asset ID: ${asset.id}
                </div>
                <br>
            `;
        });

        message.innerHTML = `
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

            ${items || "<p>No avatar items found.</p>"}
        `;

    } catch (error) {
        console.error(error);

        message.innerHTML =
            "<strong>❌ ERROR</strong><br><br>" +
            escapeHTML(error.message);
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
