if (!window.__decisionDexContentLoaded) {
	window.__decisionDexContentLoaded = true;

	const SHOWDOWN_SPRITES_BASE = "https://play.pokemonshowdown.com/sprites/dex";
	const FALLBACK_SPRITE = "https://play.pokemonshowdown.com/sprites/misc/pokeball.png";
	const LIVE_UPDATE_DEBOUNCE_MS = 180;

	let battlePresenceObserver = null;
	let liveObserver = null;
	let liveTimer = null;

	function toPokemonId(name) {
		return String(name || "")
			.toLowerCase()
			.replace(/\b(m|f)\b/g, "")
			.replace(/[^a-z0-9]+/g, "");
	}

	function normalizePokemonName(rawName) {
		if (!rawName) {
			return "Unknown";
		}

		return (
			rawName
				.replace(/\(.*?\)/g, "")
				.replace(/(fainted|active|statused)/gi, "")
				.replace(/\s+/g, " ")
				.trim() || "Unknown"
		);
	}

	function getPokemonNameFromIcon(iconNode) {
		const label =
			iconNode.getAttribute("aria-label") ||
			iconNode.getAttribute("title") ||
			iconNode.getAttribute("data-name") ||
			iconNode.querySelector("img")?.getAttribute("alt") ||
			iconNode.textContent ||
			"";

		return normalizePokemonName(label);
	}

	function extractTeam(selector) {
		const iconNodes = Array.from(document.querySelectorAll(selector));
		const seen = new Set();
		const team = [];

		for (const iconNode of iconNodes) {
			const name = getPokemonNameFromIcon(iconNode);
			const id = toPokemonId(name);

			if (!id || seen.has(id)) {
				continue;
			}

			seen.add(id);
			team.push({
				name,
				sprite: `${SHOWDOWN_SPRITES_BASE}/${id}.png`,
			});

			if (team.length === 6) {
				break;
			}
		}

		while (team.length < 6) {
			team.push({ name: "Unknown", sprite: FALLBACK_SPRITE });
		}

		return team;
	}

	function getBattleRoot() {
		return document.querySelector(".battle, .battle-log, .ps-room-opaque");
	}

	function getBattleTeams() {
		if (!getBattleRoot()) {
			return {
				ok: false,
				error: "Waiting for a Pokemon Showdown battle to start.",
			};
		}

		const myTeam = extractTeam(
			".trainer-near .teamicons .picon, .trainer-near .teamicons .pokemonicon, .trainer-near .teamicons span, .switchmenu button .picon"
		);
		const enemyTeam = extractTeam(
			".trainer-far .teamicons .picon, .trainer-far .teamicons .pokemonicon, .trainer-far .teamicons span"
		);

		return {
			ok: true,
			myTeam,
			enemyTeam,
		};
	}

	function broadcastBattleTeamsUpdate() {
		chrome.runtime.sendMessage({
			type: "LIVE_BATTLE_TEAMS_UPDATE",
			payload: getBattleTeams(),
		});
	}

	function startLiveUpdates() {
		if (liveObserver) {
			return;
		}

		const targetNode = getBattleRoot() || document.body;

		liveObserver = new MutationObserver(() => {
			if (liveTimer) {
				clearTimeout(liveTimer);
			}

			liveTimer = setTimeout(() => {
				broadcastBattleTeamsUpdate();
			}, LIVE_UPDATE_DEBOUNCE_MS);
		});

		liveObserver.observe(targetNode, {
			childList: true,
			subtree: true,
			attributes: true,
			characterData: false,
		});

		broadcastBattleTeamsUpdate();
	}

	function stopLiveUpdates() {
		if (liveObserver) {
			liveObserver.disconnect();
			liveObserver = null;
		}

		if (liveTimer) {
			clearTimeout(liveTimer);
			liveTimer = null;
		}
	}

	function syncAutoWatcherState() {
		if (getBattleRoot()) {
			startLiveUpdates();
			return;
		}

		stopLiveUpdates();
		broadcastBattleTeamsUpdate();
	}

	function enableAutoBattleWatch() {
		if (!battlePresenceObserver) {
			battlePresenceObserver = new MutationObserver(() => {
				syncAutoWatcherState();
			});

			battlePresenceObserver.observe(document.body, {
				childList: true,
				subtree: true,
				attributes: true,
			});
		}

		syncAutoWatcherState();
	}

	function disableAutoBattleWatch() {
		if (battlePresenceObserver) {
			battlePresenceObserver.disconnect();
			battlePresenceObserver = null;
		}

		stopLiveUpdates();
	}

	chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		if (message?.type === "PING_CONTENT") {
			sendResponse({ ok: true });
			return;
		}

		if (message?.type === "GET_BATTLE_TEAMS") {
			sendResponse(getBattleTeams());
			return;
		}

		if (message?.type === "ENABLE_AUTO_BATTLE_WATCH") {
			enableAutoBattleWatch();
			sendResponse({ ok: true });
			return;
		}

		if (message?.type === "DISABLE_AUTO_BATTLE_WATCH") {
			disableAutoBattleWatch();
			sendResponse({ ok: true });
		}
	});

	enableAutoBattleWatch();
}
