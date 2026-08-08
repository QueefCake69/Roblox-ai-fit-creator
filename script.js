const WORKER_URL =
    "https://roblox-ai-fit-creator.6-lilsaggy-6.workers.dev";

async function generateOutfit() {
    const usernameElement = document.getElementById("username");
    const messageElement = document.getElementById("message");

    if (!usernameElement || !messageElement) {
        return;
    }

    const username = usernameElement.value.trim();

    if (!username) {
        messageElement.textContent = "Enter a Roblox username first!";
        return;
    }

    try {
        messageElement.textContent = "🔎 Finding Roblox user...";

        const userResponse = await fetch(
            WORKER_URL +
            "/roblox/user?username=" +
            encodeURIComponent(username),
            {
                cache: "no-store"
            }
        );

        const userText = await userResponse.text();

        if (!userResponse.ok) {
            throw new Error(
                "User lookup failed: HTTP " +
                userResponse.status
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

        const avatarResponse = await fetch(
            WORKER_URL +
            "/roblox/avatar?userId=" +
            encodeURIComponent(user.id),
            {
                cache: "no-store"
            }
        );

        const avatarText = await avatarResponse.text();

        if (!avatarResponse.ok) {
            throw new Error(
                "Avatar lookup failed: HTTP " +
                avatarResponse.status
            );
        }

        const avatarData = JSON.parse(avatarText);

        if (!avatarData.success || !avatarData.avatar) {
            throw new Error("Avatar data was not returned.");
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
            `).join("");
        } else {
            itemsHTML = "<p>No avatar items found.</p>";
        }

        /*
         * Roblox thumbnail service.
         * This displays the user's current Roblox avatar.
         */
        const avatarImage =
            "https://tr.rbxcdn.com/avatar-thumbnail/image" +
            "?userId=" + encodeURIComponent(user.id) +
            "&width=420" +
            "&height=420" +
            "&format=png";

        messageElement.innerHTML = `
            <div class="avatar-result">

                <h2>🔥 ${escapeHTML(user.displayName)}</h2>

                <img
                    src="${avatarImage}"
                    alt="Roblox avatar"
                    style="
                        width:300px;
                        height:300px;
                        object-fit:contain;
                        display:block;
                        margin:20px auto;
                        border-radius:16px;
                    "
                >

                <p>
                    <strong>Username:</strong>
                    ${escapeHTML(user.name)}
                </p>

                <p>
                    <strong>Roblox ID:</strong>
                    ${user.id}
                </p>

                <h3>👕 Current Avatar</h3>

                <div class="avatar-items">
                    ${itemsHTML}
                </div>

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
