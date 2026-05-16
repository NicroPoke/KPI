const statusNode = document.getElementById("status");
const myTeamNode = document.getElementById("myTeam");
const enemyTeamNode = document.getElementById("enemyTeam");
let activeTabId = null;

const contract = window.DecisionDexContract;

if (!contract) {
  throw new Error("DecisionDexContract is not available in the popup.");
}

function setStatus(message, isError = false) {
  statusNode.textContent = message;
  statusNode.classList.toggle("is-error", isError);
}

function renderTeam(teamNode, teamData) {
  teamNode.innerHTML = "";

  teamData.forEach((pokemon) => {
    const card = document.createElement("article");
    card.className = "pokemon-card";

    const name = document.createElement("h3");
    name.textContent = pokemon.name;

    const image = document.createElement("img");
    image.src = pokemon.sprite;
    image.alt = pokemon.name;
    image.loading = "lazy";
    image.decoding = "async";
    image.onerror = () => {
      image.src = "https://play.pokemonshowdown.com/sprites/misc/pokeball.png";
    };

    card.appendChild(name);
    card.appendChild(image);
    teamNode.appendChild(card);
  });
}

function requestBackground(message) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        resolve(null);
        return;
      }

      resolve(response);
    });
  });
}

function handleLiveUpdate(message, sender) {
  if (message?.type !== contract.MESSAGE_TYPES.LIVE_BATTLE_TEAMS_UPDATE) {
    return;
  }

  if (!activeTabId || message?.sourceTabId !== activeTabId) {
    return;
  }

  const payload = message.payload;

  if (!payload?.ok) {
    setStatus(payload?.error || "Could not read battle data.", true);
    return;
  }

  const battleState = payload.payload;
  const playerTeam = battleState?.state?.side?.player || [];
  const opponentTeam = battleState?.state?.side?.opponent || [];

  renderTeam(myTeamNode, playerTeam);
  renderTeam(enemyTeamNode, opponentTeam);
  setStatus(`Live sync on · ${battleState?.schemaVersion || contract.SCHEMA_VERSION}`);
}

chrome.runtime.onMessage.addListener(handleLiveUpdate);

function captureTabIdFromPayload(payload) {
  const sourceTabId = payload?.metadata?.sourceTabId;
  if (typeof sourceTabId === "number") {
    activeTabId = sourceTabId;
  }
}

async function scanBattle() {
  setStatus("Requesting battle state...");

  try {
    const response = await requestBackground({ type: contract.MESSAGE_TYPES.GET_BATTLE_TEAMS });

    if (!response?.ok) {
      setStatus(response?.error || "Waiting for battle", true);
      return;
    }

    const payload = response.payload;
    captureTabIdFromPayload(payload);
    const playerTeam = payload?.state?.side?.player || [];
    const opponentTeam = payload?.state?.side?.opponent || [];

    renderTeam(myTeamNode, playerTeam);
    renderTeam(enemyTeamNode, opponentTeam);
    setStatus(`Ready · ${payload?.schemaVersion || contract.SCHEMA_VERSION}`);

    await requestBackground({ type: contract.MESSAGE_TYPES.ENABLE_AUTO_BATTLE_WATCH });
  } catch (error) {
    setStatus("Showdown tab required", true);
  }
}

async function disableAutoWatchOnClose() {
  try {
    await requestBackground({ type: contract.MESSAGE_TYPES.DISABLE_AUTO_BATTLE_WATCH });
  } catch (error) {
  }
}

window.addEventListener("beforeunload", () => {
  disableAutoWatchOnClose();
});

scanBattle();
