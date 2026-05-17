var ScoringEngine = (function () {
  var metaData = typeof DecisionDexMetaData !== "undefined" ? DecisionDexMetaData : {};
  var typeChart = metaData.typeChart || {};
  var dex = metaData.pokemonDex || {
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