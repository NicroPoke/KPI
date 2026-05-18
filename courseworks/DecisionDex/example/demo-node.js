const { DecisionDexContract, ScoringEngine, Generator } = require("decisiondex-core");

const payload = DecisionDexContract.buildBattlePayload({
  format: "gen9ou",
  source: "example",
  live: true,
  battleActive: true,
  myTeam: ["Garchomp", "Dragapult", "Landorus-Therian", "Great Tusk", "Kingambit", "Corviknight"],
  enemyTeam: ["Samurott-Hisui", "Ting-Lu", "Iron Valiant", "Rotom-Wash", "Clefable", "Garchomp"],
});

const recommendation = ScoringEngine.recommendLead(payload);
const cycle = Generator.roundRobin(["Garchomp", "Dragapult", "Great Tusk"]);

console.log("DecisionDex local dependency demo");
console.log(`Recommended lead: ${recommendation.recommendedLead.name}`);
console.log(`Score: ${recommendation.recommendedLead.score}`);
console.log("Top 3 ranking:");
recommendation.ranking.slice(0, 3).forEach((row, index) => {
  console.log(`${index + 1}. ${row.name} (${row.score})`);
});
console.log(`Round robin sample: ${cycle.next().value}, ${cycle.next().value}, ${cycle.next().value}`);