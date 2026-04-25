const statusNode = document.getElementById("status");
const myTeamNode = document.getElementById("myTeam");
const enemyTeamNode = document.getElementById("enemyTeam");
let activeTabId = null;
const SHOWDOWN_URL_PATTERNS = [
  "*://play.pokemonshowdown.com/*",
  "*://pokemonshowdown.com/*",
];

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

function getActiveTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs[0]);
    });
  });
}

function queryTabs(queryInfo) {
  return new Promise((resolve) => {
    chrome.tabs.query(queryInfo, (tabs) => {
      resolve(tabs || []);
    });
  });
}

async function findBattleTab() {
  const activeTab = await getActiveTab();
  const activeUrl = activeTab?.url || "";
  if (activeTab?.id && /pokemonshowdown\.com/i.test(activeUrl)) {
    return activeTab;
  }

  const currentWindowShowdownTabs = await queryTabs({
    currentWindow: true,
    url: SHOWDOWN_URL_PATTERNS,
  });
  const activeShowdownInCurrentWindow = currentWindowShowdownTabs.find((tab) => tab.active);
  if (activeShowdownInCurrentWindow) {
    return activeShowdownInCurrentWindow;
  }

  if (currentWindowShowdownTabs.length > 0) {
    return currentWindowShowdownTabs[0];
  }

  const allShowdownTabs = await queryTabs({ url: SHOWDOWN_URL_PATTERNS });
  return allShowdownTabs[0];
}

function pingContent(tabId) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, { type: "PING_CONTENT" }, (response) => {
      if (chrome.runtime.lastError) {
        resolve(false);
        return;
      }

      resolve(Boolean(response?.ok));
    });
  });
}

function injectContent(tabId) {
  return new Promise((resolve, reject) => {
    chrome.scripting.executeScript(
      {
        target: { tabId },
        files: ["content.js"],
      },
      () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        resolve();
      }
    );
  });
}

async function ensureContentConnected(tabId) {
  const alive = await pingContent(tabId);
  if (alive) {
    return;
  }

  await injectContent(tabId);
}

function requestTeamsFromTab(tabId) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, { type: "GET_BATTLE_TEAMS" }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      resolve(response);
    });
  });
}

function sendSimpleMessageToTab(tabId, type) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, { type }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      resolve(response);
    });
  });
}

function handleLiveUpdate(message, sender) {
  if (message?.type !== "LIVE_BATTLE_TEAMS_UPDATE") {
    return;
  }

  if (!activeTabId || sender?.tab?.id !== activeTabId) {
    return;
  }

  const payload = message.payload;

  if (!payload?.ok) {
    setStatus(payload?.error || "Could not read battle data.", true);
    return;
  }

  renderTeam(myTeamNode, payload.myTeam || []);
  renderTeam(enemyTeamNode, payload.enemyTeam || []);
  setStatus("Live battle sync is on.");
}

chrome.runtime.onMessage.addListener(handleLiveUpdate);

async function scanBattle() {
  setStatus("Auto mode...");

  try {
    const tab = await findBattleTab();

    if (!tab?.id) {
      setStatus("No Showdown tab", true);
      return;
    }

    await ensureContentConnected(tab.id);
    activeTabId = tab.id;
    await sendSimpleMessageToTab(tab.id, "ENABLE_AUTO_BATTLE_WATCH");

    const response = await requestTeamsFromTab(tab.id);

    if (!response?.ok) {
      setStatus(response?.error || "Waiting for battle", true);
      return;
    }

    renderTeam(myTeamNode, response.myTeam || []);
    renderTeam(enemyTeamNode, response.enemyTeam || []);
    setStatus("Live");
  } catch (error) {
    setStatus("Showdown tab required", true);
  }
}

async function disableAutoWatchOnClose() {
  if (!activeTabId) {
    return;
  }

  try {
    await sendSimpleMessageToTab(activeTabId, "DISABLE_AUTO_BATTLE_WATCH");
  } catch (error) {
    // Ignore cleanup errors when popup closes.
  }
}

window.addEventListener("beforeunload", () => {
  disableAutoWatchOnClose();
});

scanBattle();
