const WORKER_URL =
    "https://roblox-ai-fit-creator.6-lilsaggy-6.workers.dev";

async function generateOutfit() {
    const message = document.getElementById("message");

    if (!message) {
        alert("The message element was not found.");
        return;
    }

    // Temporary test ID: Streety
    const userId = 275021;

    message.textContent = "🧍 Loading avatar...";

    try {
        const response = await fetch(
            WORKER_URL + "/roblox/avatar?userId=" + userId + "&v=3",
            {
                method: "GET",
                cache: "no-store"
            }
        );

        const text = await response.text();

        if (!response.ok) {
            throw new Error(
                "Avatar request failed: HTTP " +
                response.status +
                " — " +
                text
            );
        }

        const result = JSON.parse(text);

        if (!result.success || !result.avatar) {
            throw new Error("No avatar data returned.");
        }

        const avatar = result.avatar;

        let itemsHTML = "";

        if (avatar.assets && avatar.assets.length) {
            itemsHTML = avatar.assets.map(function(asset) {
                return `
                    <div class="avatar-item">
                        <strong>${escapeHTML(asset.name)}</strong><br>
                        Type: ${escapeHTML(asset.assetType.name)}<br>
                        Asset ID: ${asset.id}
                    </div>
                    <br>
                `;
            }).join("");
        } else {
            itemsHTML = "<p>No avatar items found.</p>";
        }

        message.innerHTML = `
            <h2>🔥 Avatar Loaded!</h2>

            <p>
                <strong>Roblox User ID:</strong> ${userId}
            </p>

            <h3>Current Avatar</h3>

            ${itemsHTML}
        `;

    } catch (error) {
        console.error(error);

        message.innerHTML = `
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
