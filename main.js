const WORKER_URL =
    "https://roblox-ai-fit-creator.6-lilsaggy-6.workers.dev";

async function generateOutfit() {
    const userId = document.getElementById("userId").value.trim();
    const message = document.getElementById("message");

    if (!userId) {
        message.textContent = "Enter a Roblox User ID first!";
        return;
    }

    message.textContent = "🧍 Loading avatar...";

    try {
        const response = await fetch(
            WORKER_URL +
            "/roblox/avatar?userId=" +
            encodeURIComponent(userId) +
            "&v=" +
            Date.now(),
            {
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

        const data = JSON.parse(text);

        if (!data.success || !data.avatar) {
            throw new Error("Avatar data was not returned.");
        }

        const avatar = data.avatar;
        const assets = avatar.assets || [];

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
            <h2>🔥 Avatar Loaded!</h2>

            <p>
                <strong>Roblox User ID:</strong>
                ${escapeHTML(userId)}
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
