const WORKER_URL =
    "https://roblox-ai-fit-creator.6-lilsaggy-6.workers.dev";

async function generateOutfit() {
    const usernameInput = document.getElementById("username");
    const message = document.getElementById("message");

    const username = usernameInput.value.trim();

    if (!username) {
        message.textContent = "Enter a Roblox username first!";
        return;
    }

    message.textContent = "Finding Roblox user...";

    try {
        // 1. Find the Roblox user
        const userResponse = await fetch(
            WORKER_URL +
            "/roblox/user?username=" +
            encodeURIComponent(username)
        );

        if (!userResponse.ok) {
            throw new Error(
                "User lookup failed: HTTP " + userResponse.status
            );
        }

        const userResult = await userResponse.json();

        if (!userResult.found || !userResult.user) {
            message.textContent = "Roblox user not found.";
            return;
        }

        const user = userResult.user;

        // 2. Get the user's avatar
        message.textContent = "Loading their avatar...";

        const avatarResponse = await fetch(
            WORKER_URL +
            "/roblox/avatar?userId=" +
            encodeURIComponent(user.id)
        );

        if (!avatarResponse.ok) {
            throw new Error(
                "Avatar lookup failed: HTTP " + avatarResponse.status
            );
        }

        const avatarResult = await avatarResponse.json();

        if (!avatarResult.success || !avatarResult.avatar) {
            throw new Error("Could not get avatar information.");
        }

        const avatar = avatarResult.avatar;

        // 3. Display the user and their avatar items
        let itemsHTML = "";

        if (avatar.assets && avatar.assets.length > 0) {
            itemsHTML = avatar.assets
                .map(asset => {
                    return `
                        <div class="avatar-item">
                            <strong>${escapeHTML(asset.name)}</strong><br>
                            Type: ${escapeHTML(asset.assetType.name)}<br>
                            Asset ID: ${asset.id}
                        </div>
                    `;
                })
                .join("");
        } else {
            itemsHTML = "<p>No avatar items found.</p>";
        }

        message.innerHTML = `
            <div class="avatar-result">
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

                <div class="avatar-items">
                    ${itemsHTML}
                </div>
            </div>
        `;

    } catch (error) {
        console.error(error);
        message.textContent = "ERROR: " + error.message;
    }
}


// Prevent usernames or item names from injecting HTML
function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
                }
