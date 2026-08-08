const WORKER_URL =
    "https://roblox-ai-fit-creator.6-lilsaggy-6.workers.dev";

async function generateOutfit() {
    const usernameElement = document.getElementById("username");
    const messageElement = document.getElementById("message");

    if (!usernameElement || !messageElement) {
        alert("Website setup error: username or message element is missing.");
        return;
    }

    const username = usernameElement.value.trim();

    if (!username) {
        messageElement.textContent = "Enter a Roblox username first!";
        return;
    }

    messageElement.textContent = "🔎 Finding Roblox user...";

    try {
        // STEP 1: Find Roblox user
        const userURL =
            WORKER_URL +
            "/roblox/user?username=" +
            encodeURIComponent(username);

        const userResponse = await fetch(userURL, {
            method: "GET",
            cache: "no-store"
        });

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

        // STEP 2: Get avatar
        messageElement.textContent =
            "🧍 Loading " + user.name + "'s avatar...";

        const avatarURL =
            WORKER_URL +
            "/roblox/avatar?userId=" +
            encodeURIComponent(user.id);

        const avatarResponse = await fetch(avatarURL, {
            method: "GET",
            cache: "no-store"
        });

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
            throw new Error("Roblox returned no avatar data.");
        }

        const avatar = avatarData.avatar;

        // STEP 3: Build item list
        let itemsHTML = "";

        if (avatar.assets && avatar.assets.length > 0) {
            itemsHTML = avatar.assets.map(function(asset) {
                const assetType =
                    asset.assetType && asset.assetType.name
                        ? asset.assetType.name
                        : "Unknown";

                return `
                    <div class="avatar-item">
                        <strong>${escapeHTML(asset.name)}</strong>
                        <br>
                        <span>Type: ${escapeHTML(assetType)}</span>
                        <br>
                        <span>Asset ID: ${asset.id}</span>
                    </div>
                `;
            }).join("");
        } else {
            itemsHTML = "<p>No avatar items found.</p>";
        }

        // STEP 4: Display result
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

                <div class="avatar-items">
                    ${itemsHTML}
                </div>

            </div>
        `;

    } catch (error) {
        console.error("Roblox AI Fit Error:", error);

        messageElement.innerHTML = `
            <strong>❌ ERROR</strong>
            <br><br>
            ${escapeHTML(error.message)}
        `;
    }
}


// Keeps usernames/item names from being interpreted as HTML
function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
