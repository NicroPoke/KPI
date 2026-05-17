importScripts("core/dataContract.js");
importScripts("core/metaData.js");
importScripts("core/generator.js");
importScripts("core/memoization.js");
importScripts("core/priorityQueue.js");
importScripts("core/asyncUtils.js");
importScripts("core/streamProcessor.js");
importScripts("core/events.js");
importScripts("core/authProxy.js");
importScripts("core/logger.js");
importScripts("core/scoringEngine.js");
importScripts("core/index.js");

chrome.runtime.onInstalled.addListener(() => {
  console.log("DecisionDex installed");
});

function queryTabs(queryInfo) {
  return new Promise((resolve) => {
    chrome.tabs.query(queryInfo, (tabs) => {
      resolve(tabs || []);
    });
  });
}

function getActiveTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs[0]);
    });
  });
}

async function findBattleTab() {
  const activeTab = await getActiveTab();
  const activeUrl = activeTab?.url || "";

  if (activeTab?.id && /pokemonshowdown\.com/i.test(activeUrl)) {
    return activeTab;
  }

  const showdownPatterns = ["*://play.pokemonshowdown.com/*", "*://pokemonshowdown.com/*"];
  const currentWindowShowdownTabs = await queryTabs({ currentWindow: true, url: showdownPatterns });
  const activeShowdownInCurrentWindow = currentWindowShowdownTabs.find((tab) => tab.active);

  if (activeShowdownInCurrentWindow) {
    return activeShowdownInCurrentWindow;
  }

  if (currentWindowShowdownTabs.length > 0) {
    return currentWindowShowdownTabs[0];
  }

  const allShowdownTabs = await queryTabs({ url: showdownPatterns });
  return allShowdownTabs[0];
}

function pingContent(tabId) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, { type: DecisionDexContract.MESSAGE_TYPES.PING_CONTENT }, (response) => {
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
        files: ["core/dataContract.js", "content.js"],
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

function sendMessageToTab(tabId, type) {
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

async function getBattleTeams() {
  const tab = await findBattleTab();

  if (!tab?.id) {
    return {
      ok: false,
      error: "No Pokemon Showdown tab was found.",
    };
  }

  await ensureContentConnected(tab.id);
  const response = await sendMessageToTab(tab.id, DecisionDexContract.MESSAGE_TYPES.GET_BATTLE_TEAMS);

  if (response?.payload?.metadata) {
    response.payload.metadata.sourceTabId = tab.id;
  }

  return response;
}

async function setAutoBattleWatch(enabled) {
  const tab = await findBattleTab();

  if (!tab?.id) {
    return {
      ok: false,
      error: "No Pokemon Showdown tab was found.",
    };
  }

  await ensureContentConnected(tab.id);
  return sendMessageToTab(
    tab.id,
    enabled ? DecisionDexContract.MESSAGE_TYPES.ENABLE_AUTO_BATTLE_WATCH : DecisionDexContract.MESSAGE_TYPES.DISABLE_AUTO_BATTLE_WATCH
  );
}

async function getLeadRecommendation() {
  var battleResponse = await getBattleTeams();

  if (!battleResponse || !battleResponse.ok || !battleResponse.payload) {
    return {
      ok: false,
      error: battleResponse && battleResponse.error ? battleResponse.error : "Could not read battle state for recommendation.",
    };
  }

  var recommendation = ScoringEngine.recommendLead(battleResponse.payload);
  if (!recommendation.ok) {
    return recommendation;
  }

  return {
    ok: true,
    battleState: battleResponse.payload,
    recommendation: recommendation,
  };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "PING") {
    sendResponse({ ok: true, source: "background" });
    return true;
  }

  if (message?.type === DecisionDexContract.MESSAGE_TYPES.GET_BATTLE_TEAMS) {
    getBattleTeams()
      .then((response) => sendResponse(response))
      .catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message?.type === DecisionDexContract.MESSAGE_TYPES.GET_LEAD_RECOMMENDATION) {
    getLeadRecommendation()
      .then((response) => sendResponse(response))
      .catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message?.type === DecisionDexContract.MESSAGE_TYPES.ENABLE_AUTO_BATTLE_WATCH) {
    setAutoBattleWatch(true)
      .then((response) => sendResponse(response))
      .catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message?.type === DecisionDexContract.MESSAGE_TYPES.DISABLE_AUTO_BATTLE_WATCH) {
    setAutoBattleWatch(false)
      .then((response) => sendResponse(response))
      .catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message?.type === DecisionDexContract.MESSAGE_TYPES.LIVE_BATTLE_TEAMS_UPDATE) {
    const payload = {
      ...message,
      sourceTabId: sender?.tab?.id ?? null,
    };

    chrome.runtime.sendMessage(payload);
    sendResponse({ ok: true });
    return true;
  }
});
