var ScoringEngine = (function () {
  var typeChart = {
    normal: { rock: 0.5, ghost: 0, steel: 0.5 },
    fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
    water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
    electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
    grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
    ice: { fire: 0.5, water: 0.5, grass: 2, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
    fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
    poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
    ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
    flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
    psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
    bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
    rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
    ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
    dragon: { dragon: 2, steel: 0.5, fairy: 0 },
    dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
    steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, fairy: 2, steel: 0.5 },
    fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
  };

  var dex = {
    garchomp: { types: ["dragon", "ground"], speed: 102, hp: 108, def: 95, spd: 85, roles: ["hazard", "breaker"], moves: ["stealthrock", "earthquake", "dragontail"] },
    dragapult: { types: ["dragon", "ghost"], speed: 142, hp: 88, def: 75, spd: 75, roles: ["pivot", "fast"], moves: ["uturn", "shadowball", "dracometeor"] },
    landorustherian: { types: ["ground", "flying"], speed: 91, hp: 89, def: 90, spd: 80, roles: ["hazard", "pivot"], moves: ["stealthrock", "uturn", "earthquake"] },
    greattusk: { types: ["ground", "fighting"], speed: 87, hp: 115, def: 131, spd: 53, roles: ["hazard", "removal"], moves: ["rapidspin", "stealthrock", "earthquake"] },
    kingambit: { types: ["dark", "steel"], speed: 50, hp: 100, def: 120, spd: 85, roles: ["sweeper"], moves: ["suckerpunch", "kowtowcleave"] },
    gliscor: { types: ["ground", "flying"], speed: 95, hp: 75, def: 125, spd: 75, roles: ["hazard", "utility"], moves: ["stealthrock", "taunt", "toxic"] },
    corviknight: { types: ["flying", "steel"], speed: 67, hp: 98, def: 105, spd: 85, roles: ["removal", "pivot"], moves: ["defog", "uturn", "roost"] },
    rotomwash: { types: ["electric", "water"], speed: 86, hp: 50, def: 107, spd: 107, roles: ["pivot", "utility"], moves: ["voltswitch", "hydropump", "willowisp"] },
    ironvaliant: { types: ["fairy", "fighting"], speed: 116, hp: 74, def: 90, spd: 60, roles: ["breaker", "fast"], moves: ["moonblast", "closecombat"] },
    samurotthisui: { types: ["water", "dark"], speed: 85, hp: 90, def: 80, spd: 65, roles: ["hazard"], moves: ["ceaselessedge", "aquajet"] },
    tinglu: { types: ["dark", "ground"], speed: 45, hp: 155, def: 125, spd: 80, roles: ["hazard", "tank"], moves: ["stealthrock", "spikes", "ruination"] },
    clefable: { types: ["fairy"], speed: 60, hp: 95, def: 73, spd: 90, roles: ["utility"], moves: ["thunderwave", "moonblast", "softboiled"] },
    unknown: { types: ["normal"], speed: 80, hp: 80, def: 80, spd: 80, roles: [], moves: [] },
  };

  function normalizeId(pokemon) {
    var base = pokemon && pokemon.id ? pokemon.id : pokemon && pokemon.name ? pokemon.name : "unknown";
    return String(base)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "");
  }

  function getMonData(pokemon) {
    var id = normalizeId(pokemon);
    return dex[id] || dex.unknown;
  }

  function getTypeEffectiveness(attackingType, defendingTypes) {
    var row = typeChart[attackingType] || {};
    var multiplier = 1;
    var i;
    for (i = 0; i < defendingTypes.length; i++) {
      var t = defendingTypes[i];
      multiplier *= row[t] == null ? 1 : row[t];
    }
    return multiplier;
  }

  function bestOffensiveEffect(attackerTypes, defenderTypes) {
    var best = 0;
    var i;
    for (i = 0; i < attackerTypes.length; i++) {
      var current = getTypeEffectiveness(attackerTypes[i], defenderTypes);
      if (current > best) {
        best = current;
      }
    }
    return best || 1;
  }

  function bestIncomingEffect(attackerTypes, defenderTypes) {
    var best = 0;
    var i;
    for (i = 0; i < attackerTypes.length; i++) {
      var current = getTypeEffectiveness(attackerTypes[i], defenderTypes);
      if (current > best) {
        best = current;
      }
    }
    return best || 1;
  }

  function hasMove(mon, list) {
    var i;
    var j;
    for (i = 0; i < mon.moves.length; i++) {
      for (j = 0; j < list.length; j++) {
        if (mon.moves[i] === list[j]) {
          return true;
        }
      }
    }
    return false;
  }

  function hasRole(mon, role) {
    return mon.roles.indexOf(role) !== -1;
  }

  function predictOpponentLeads(opponentTeam) {
    var scored = opponentTeam.map(function (pokemon) {
      var mon = getMonData(pokemon);
      var leadScore = 0;
      if (hasRole(mon, "hazard")) {
        leadScore += 25;
      }
      if (hasRole(mon, "fast")) {
        leadScore += 12;
      }
      if (hasRole(mon, "pivot")) {
        leadScore += 8;
      }
      if (hasRole(mon, "utility")) {
        leadScore += 5;
      }
      leadScore += mon.speed / 12;
      if (hasMove(mon, ["taunt", "thunderwave", "willowisp", "spikes", "stealthrock"])) {
        leadScore += 6;
      }
      return {
        pokemon: pokemon,
        data: mon,
        leadScore: leadScore,
      };
    });

    scored.sort(function (a, b) {
      return b.leadScore - a.leadScore;
    });

    return scored.slice(0, 3);
  }

  function scoreVsOpponent(candidatePokemon, opponentLead) {
    var candidate = getMonData(candidatePokemon);
    var opponent = opponentLead.data;

    var offensive = bestOffensiveEffect(candidate.types, opponent.types);
    var incoming = bestIncomingEffect(opponent.types, candidate.types);

    var typeAdvantageScore = (offensive - 1) * 20 - (incoming - 1) * 15;

    var speedControlScore = 0;
    if (candidate.speed > opponent.speed) {
      speedControlScore += 10;
    } else if (candidate.speed === opponent.speed) {
      speedControlScore += 3;
    } else {
      speedControlScore -= 6;
    }
    if (hasMove(candidate, ["suckerpunch", "aquajet", "iceshard", "shadowsneak", "extremespeed"])) {
      speedControlScore += 4;
    }

    var hazardScore = 0;
    if (hasMove(candidate, ["stealthrock", "spikes", "ceaselessedge"])) {
      hazardScore += 8;
    }
    if (hasMove(candidate, ["defog", "rapidspin"])) {
      hazardScore += 6;
    }
    if (hasRole(opponent, "hazard") && hasMove(candidate, ["taunt"])) {
      hazardScore += 4;
    }

    var antiLeadScore = 0;
    if (hasMove(candidate, ["taunt"])) {
      antiLeadScore += 6;
    }
    if (hasMove(candidate, ["fakeout"])) {
      antiLeadScore += 3;
    }
    if (hasMove(candidate, ["thunderwave", "willowisp", "toxic", "spore"])) {
      antiLeadScore += 3;
    }

    var bulk = (candidate.hp + candidate.def + candidate.spd) / 3;
    var bulkSurvivabilityScore = (bulk - 80) / 4;
    if (incoming <= 0.5) {
      bulkSurvivabilityScore += 4;
    }

    var utilityScore = 0;
    if (hasMove(candidate, ["uturn", "voltswitch"])) {
      utilityScore += 3;
    }
    if (hasMove(candidate, ["roost", "softboiled", "recover"])) {
      utilityScore += 2;
    }
    if (hasRole(candidate, "pivot")) {
      utilityScore += 2;
    }

    return {
      typeAdvantageScore: typeAdvantageScore,
      speedControlScore: speedControlScore,
      hazardScore: hazardScore,
      antiLeadScore: antiLeadScore,
      bulkSurvivabilityScore: bulkSurvivabilityScore,
      utilityScore: utilityScore,
      total:
        typeAdvantageScore +
        speedControlScore +
        hazardScore +
        antiLeadScore +
        bulkSurvivabilityScore +
        utilityScore,
      offensiveMultiplier: offensive,
      incomingMultiplier: incoming,
    };
  }

  function summarizeReasons(aggregate) {
    var reasons = [];
    if (aggregate.typeAdvantageScore > 6) {
      reasons.push("Strong type pressure into likely opposing leads");
    }
    if (aggregate.speedControlScore > 4) {
      reasons.push("Good speed control in opening turns");
    }
    if (aggregate.hazardScore > 6) {
      reasons.push("Reliable hazard setup or hazard control value");
    }
    if (aggregate.antiLeadScore > 4) {
      reasons.push("Useful anti-lead tools against disruptive openings");
    }
    if (aggregate.bulkSurvivabilityScore > 2) {
      reasons.push("Can absorb early-game pressure consistently");
    }
    if (aggregate.utilityScore > 2) {
      reasons.push("Provides extra utility for momentum and flexibility");
    }
    if (reasons.length === 0) {
      reasons.push("Most stable neutral opener for current preview state");
    }
    return reasons;
  }

  function evaluateCandidate(candidatePokemon, predictedOpponentLeads) {
    var weighted = {
      typeAdvantageScore: 0,
      speedControlScore: 0,
      hazardScore: 0,
      antiLeadScore: 0,
      bulkSurvivabilityScore: 0,
      utilityScore: 0,
      total: 0,
    };

    var weights = [1, 0.8, 0.6];
    var totalWeight = 0;
    var i;

    for (i = 0; i < predictedOpponentLeads.length; i++) {
      var opponentLead = predictedOpponentLeads[i];
      var w = weights[i] || 0.5;
      var partial = scoreVsOpponent(candidatePokemon, opponentLead);

      weighted.typeAdvantageScore += partial.typeAdvantageScore * w;
      weighted.speedControlScore += partial.speedControlScore * w;
      weighted.hazardScore += partial.hazardScore * w;
      weighted.antiLeadScore += partial.antiLeadScore * w;
      weighted.bulkSurvivabilityScore += partial.bulkSurvivabilityScore * w;
      weighted.utilityScore += partial.utilityScore * w;
      weighted.total += partial.total * w;
      totalWeight += w;
    }

    if (totalWeight > 0) {
      weighted.typeAdvantageScore /= totalWeight;
      weighted.speedControlScore /= totalWeight;
      weighted.hazardScore /= totalWeight;
      weighted.antiLeadScore /= totalWeight;
      weighted.bulkSurvivabilityScore /= totalWeight;
      weighted.utilityScore /= totalWeight;
      weighted.total /= totalWeight;
    }

    return {
      pokemon: candidatePokemon,
      score: Number(weighted.total.toFixed(2)),
      breakdown: {
        typeAdvantageScore: Number(weighted.typeAdvantageScore.toFixed(2)),
        speedControlScore: Number(weighted.speedControlScore.toFixed(2)),
        hazardScore: Number(weighted.hazardScore.toFixed(2)),
        antiLeadScore: Number(weighted.antiLeadScore.toFixed(2)),
        bulkSurvivabilityScore: Number(weighted.bulkSurvivabilityScore.toFixed(2)),
        utilityScore: Number(weighted.utilityScore.toFixed(2)),
      },
      reasoning: summarizeReasons(weighted),
    };
  }

  function recommendLead(battlePayload) {
    var playerTeam = ((battlePayload || {}).state || {}).side ? battlePayload.state.side.player || [] : [];
    var opponentTeam = ((battlePayload || {}).state || {}).side ? battlePayload.state.side.opponent || [] : [];

    var filteredPlayerTeam = playerTeam.filter(function (p) {
      return p && p.id !== "unknown";
    });
    var filteredOpponentTeam = opponentTeam.filter(function (p) {
      return p && p.id !== "unknown";
    });

    if (filteredPlayerTeam.length === 0 || filteredOpponentTeam.length === 0) {
      return {
        ok: false,
        error: "Not enough team data to compute a lead recommendation.",
      };
    }

    var predictedOpponentLeads = predictOpponentLeads(filteredOpponentTeam);
    var ranking = filteredPlayerTeam.map(function (candidate) {
      return evaluateCandidate(candidate, predictedOpponentLeads);
    });

    ranking.sort(function (a, b) {
      return b.score - a.score;
    });

    var best = ranking[0];

    return {
      ok: true,
      generatedAt: new Date().toISOString(),
      recommendedLead: {
        name: best.pokemon.name,
        id: best.pokemon.id,
        sprite: best.pokemon.sprite,
        score: best.score,
        reasoning: best.reasoning,
      },
      ranking: ranking.map(function (row) {
        return {
          name: row.pokemon.name,
          id: row.pokemon.id,
          sprite: row.pokemon.sprite,
          score: row.score,
          breakdown: row.breakdown,
          reasoning: row.reasoning,
        };
      }),
      predictedOpponentLeads: predictedOpponentLeads.map(function (entry) {
        return {
          name: entry.pokemon.name,
          id: entry.pokemon.id,
          score: Number(entry.leadScore.toFixed(2)),
        };
      }),
    };
  }

  return {
    recommendLead: recommendLead,
  };
})();