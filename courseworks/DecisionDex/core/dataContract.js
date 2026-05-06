var DecisionDexContract = {
  SCHEMA_VERSION: "1.0.0",
  SHOWDOWN_SPRITES_BASE: "https://play.pokemonshowdown.com/sprites/dex",
  FALLBACK_SPRITE: "https://play.pokemonshowdown.com/sprites/misc/pokeball.png",
  MESSAGE_TYPES: {
    PING_CONTENT: "PING_CONTENT",
    GET_BATTLE_TEAMS: "GET_BATTLE_TEAMS",
    ENABLE_AUTO_BATTLE_WATCH: "ENABLE_AUTO_BATTLE_WATCH",
    DISABLE_AUTO_BATTLE_WATCH: "DISABLE_AUTO_BATTLE_WATCH",
    LIVE_BATTLE_TEAMS_UPDATE: "LIVE_BATTLE_TEAMS_UPDATE",
  },
  cleanName: function (rawName) {
    if (!rawName) {
      return "Unknown";
    }

    return String(rawName)
      .replace(/\(.*?\)/g, "")
      .replace(/(fainted|active|statused)/gi, "")
      .replace(/\s+/g, " ")
      .trim() || "Unknown";
  },
  makeId: function (name) {
    return String(name || "")
      .toLowerCase()
      .replace(/\b(m|f)\b/g, "")
      .replace(/[^a-z0-9]+/g, "");
  },
  makePokemon: function (name, slotIndex, source) {
    var cleanName = DecisionDexContract.cleanName(name);
    var id = DecisionDexContract.makeId(cleanName);

    return {
      name: cleanName,
      id: id || "unknown",
      sprite: id ? DecisionDexContract.SHOWDOWN_SPRITES_BASE + "/" + id + ".png" : DecisionDexContract.FALLBACK_SPRITE,
      slotIndex: slotIndex,
      source: source,
    };
  },
  fillTeam: function (team, source) {
    var normalized = [];
    var i;

    for (i = 0; i < 6; i++) {
      if (team && team[i]) {
        normalized.push(team[i]);
      } else {
        normalized.push(DecisionDexContract.makePokemon("Unknown", i, source));
      }
    }

    return normalized;
  },
  normalizeTeam: function (entries, source) {
    var normalized = [];
    var i;
    var entry;
    var pokemon;

    for (i = 0; i < 6; i++) {
      entry = entries && entries[i];

      if (!entry) {
        normalized.push(DecisionDexContract.makePokemon("Unknown", i, source));
        continue;
      }

      if (typeof entry === "string") {
        normalized.push(DecisionDexContract.makePokemon(entry, i, source));
        continue;
      }

      pokemon = DecisionDexContract.makePokemon(entry.name || entry.rawName || entry.label || entry.text || "", i, source);
      normalized.push({
        name: entry.name || pokemon.name,
        id: entry.id || pokemon.id,
        sprite: entry.sprite || pokemon.sprite,
        slotIndex: i,
        source: source,
      });
    }

    return normalized;
  },
  buildBattlePayload: function (input) {
    input = input || {};

    return {
      schemaVersion: DecisionDexContract.SCHEMA_VERSION,
      kind: "battle-state",
      format: input.format || "unknown",
      source: input.source || "unknown",
      capturedAt: input.capturedAt || new Date().toISOString(),
      state: {
        side: {
          player: DecisionDexContract.normalizeTeam(input.myTeam || [], "player"),
          opponent: DecisionDexContract.normalizeTeam(input.enemyTeam || [], "opponent"),
        },
        flags: {
          live: Boolean(input.live),
          battleActive: Boolean(input.battleActive),
        },
      },
      metadata: {
        roomId: input.roomId || null,
        battleId: input.battleId || null,
        sourceTabId: typeof input.sourceTabId === "number" ? input.sourceTabId : null,
      },
    };
  },
};
