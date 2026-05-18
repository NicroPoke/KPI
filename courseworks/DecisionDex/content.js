if (!window.__decisionDexContentLoaded) {
	window.__decisionDexContentLoaded = true;

	const contract = window.DecisionDexContract;
	const LIVE_UPDATE_DEBOUNCE_MS = 180;

	if (!contract) {
		throw new Error("DecisionDexContract is not available in the content script.");
	}

	let battlePresenceObserver = null;
	let liveObserver = null;
	let liveTimer = null;

	function getPokemonNameFromIcon(iconNode) {
		const tooltip =
			iconNode.getAttribute("data-tooltip") ||
			iconNode.getAttribute("data-original-title") ||
			iconNode.getAttribute("data-tip") ||
			"";
		const tooltipName = tooltip
			.split("|")
			.map((part) => contract.cleanName(part))
			.find((part) => part && part !== "Unknown");

		const directAlt = iconNode.tagName === "IMG" ? iconNode.getAttribute("alt") : null;
		const label =
			iconNode.getAttribute("aria-label") ||
			iconNode.getAttribute("title") ||
			iconNode.getAttribute("data-name") ||
			tooltipName ||
			directAlt ||
			iconNode.querySelector("img")?.getAttribute("alt") ||
			iconNode.textContent ||
			"";

		return contract.cleanName(label);
	}

	function extractTeam(selectorOrContainer) {
		let iconNodes = [];
		const seen = new Set();
		const team = [];

		if (typeof selectorOrContainer === "string") {
			iconNodes = Array.from(document.querySelectorAll(selectorOrContainer));
		} else if (selectorOrContainer instanceof Element) {
			iconNodes = Array.from(
				selectorOrContainer.querySelectorAll(
					".teamicons .picon, .teamicons .pokemonicon, .teamicons [data-tooltip], .has-tooltip[data-tooltip], .switchmenu button .picon, .switchmenu button [data-tooltip], img[alt], [data-name]"
				)
			);
		} else {
			iconNodes = Array.from(document.querySelectorAll(".picon, .pokemonicon, [data-tooltip], img[alt], [data-name]"));
		}

		for (const iconNode of iconNodes) {
			const name = getPokemonNameFromIcon(iconNode);
			const id = contract.makeId(name);

			if (!id || seen.has(id)) {
				continue;
			}

			seen.add(id);
			team.push({
				name,
				sprite: `${contract.SHOWDOWN_SPRITES_BASE}/${id}.png`,
			});

			if (team.length === 6) {
				break;
			}
		}

		while (team.length < 6) {
			team.push({ name: "Unknown", sprite: contract.FALLBACK_SPRITE });
		}

		return contract.normalizeTeam(team, "unknown");
	}

	function getBattleRoot() {
		const candidates = [
			".battle",
			".battle-log",
			".ps-room-opaque",
			"#battle",
			".room.battle",
			"[data-roomid]",
		];

		for (const sel of candidates) {
			const node = document.querySelector(sel);
			if (node) return node;
		}

		const heuristic = document.querySelector(".teamicons, .picon, .pokemonicon");
		if (heuristic) return heuristic.closest(".battle") || heuristic.closest(".room") || document.body;

		return null;
	}

	function getBattleTeams() {
		const root = getBattleRoot();
		if (!root) {
			return {
				ok: false,
				error: "Waiting for a Pokemon Showdown battle to start.",
			};
		}

		const myContainer = root.querySelector('.trainer-near') || root.querySelector('.p1') || root;
		const enemyContainer = root.querySelector('.trainer-far') || root.querySelector('.p2') || root;

		const myTeam = extractTeam(myContainer);
		const enemyTeam = extractTeam(enemyContainer);

		function isUnknownTeam(team) {
			return !team || !team.length || team.every((p) => !p || !p.id || p.id === "unknown");
		}

		function parseTeamsFromText() {
			const text = [
				root?.textContent || "",
				document.querySelector(".battle-log")?.textContent || "",
				document.body?.textContent || "",
			]
				.join(" ")
				.replace(/\s+/g, " ");
			const teamRegex = /(?:^|\s)([^:]{1,40})'s team:\s*([^\n\r]+?)(?=(?:\s[^:]{1,40}'s team:|$))/gi;
			const parsedTeams = [];

			let match;
			while ((match = teamRegex.exec(text)) && parsedTeams.length < 2) {
				const rawList = String(match[2] || "")
					.split("/")
					.map((s) => contract.cleanName(s))
					.filter(Boolean)
					.slice(0, 6)
					.map((name) => ({
						name,
						sprite: `${contract.SHOWDOWN_SPRITES_BASE}/${contract.makeId(name)}.png`,
					}));

				if (rawList.length > 0) {
					parsedTeams.push(contract.normalizeTeam(rawList, "unknown"));
				}
			}

			if (parsedTeams.length >= 2) {
				return {
					my: parsedTeams[0],
					enemy: parsedTeams[1],
				};
			}

			return null;
		}

		let finalMyTeam = myTeam;
		let finalEnemyTeam = enemyTeam;

		if (isUnknownTeam(myTeam) || isUnknownTeam(enemyTeam)) {
			const parsed = parseTeamsFromText();
			if (parsed) {
				finalMyTeam = parsed.my;
				finalEnemyTeam = parsed.enemy;
			}
		}

		return {
			ok: true,
			payload: contract.buildBattlePayload({
				myTeam: finalMyTeam,
				enemyTeam: finalEnemyTeam,
				format: "unknown",
				source: "content-script",
				live: Boolean(liveObserver),
				battleActive: Boolean(finalMyTeam && finalMyTeam.length && finalEnemyTeam && finalEnemyTeam.length),
				capturedAt: new Date().toISOString(),
			}),
		};
	}

	function broadcastBattleTeamsUpdate() {
		chrome.runtime.sendMessage({
			type: contract.MESSAGE_TYPES.LIVE_BATTLE_TEAMS_UPDATE,
			payload: getBattleTeams(),
		}, () => {
			void chrome.runtime.lastError;
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

		if (message?.type === contract.MESSAGE_TYPES.GET_BATTLE_TEAMS) {
			sendResponse(getBattleTeams());
			return;
		}

		if (message?.type === contract.MESSAGE_TYPES.ENABLE_AUTO_BATTLE_WATCH) {
			enableAutoBattleWatch();
			sendResponse({ ok: true });
			return;
		}

		if (message?.type === contract.MESSAGE_TYPES.DISABLE_AUTO_BATTLE_WATCH) {
			disableAutoBattleWatch();
			sendResponse({ ok: true });
		}
	});

	enableAutoBattleWatch();
}
