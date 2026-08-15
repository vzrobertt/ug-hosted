// ============================================================
// PLACAR AO VIVO - VERSÃO INICIAL
// Os jogos abaixo são de demonstração.
// Na próxima etapa podemos trocar este bloco por uma API de
// futebol e atualizar os resultados automaticamente.
// ============================================================

const games = [
  {
    home: "Flamengo",
    homeShort: "FLA",
    away: "Palmeiras",
    awayShort: "PAL",
    homeScore: 2,
    awayScore: 0,
    minute: "72:15",
    status: "live"
  },
  {
    home: "Corinthians",
    homeShort: "COR",
    away: "Santos",
    awayShort: "SAN",
    homeScore: 0,
    awayScore: 0,
    minute: "Intervalo",
    status: "ht"
  },
  {
    home: "São Paulo",
    homeShort: "SAO",
    away: "Grêmio",
    awayShort: "GRE",
    homeScore: 1,
    awayScore: 1,
    minute: "58:42",
    status: "live"
  },
  {
    home: "Bahia",
    homeShort: "BAH",
    away: "Cruzeiro",
    awayShort: "CRU",
    homeScore: 0,
    awayScore: 0,
    minute: "35:08",
    status: "live"
  },
  {
    home: "Fluminense",
    homeShort: "FLU",
    away: "Botafogo",
    awayShort: "BOT",
    homeScore: 1,
    awayScore: 0,
    minute: "Encerrado",
    status: "ft"
  },
  {
    home: "Vasco",
    homeShort: "VAS",
    away: "Internacional",
    awayShort: "INT",
    homeScore: 0,
    awayScore: 0,
    minute: "12:31",
    status: "live"
  }
];

function initials(name) {
  return name
    .split(" ")
    .map(part => part[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

function stateText(game) {
  if (game.status === "ht") return "Intervalo";
  if (game.status === "ft") return "Encerrado";
  return game.minute;
}

function renderGames() {
  const container = document.getElementById("games");

  container.innerHTML = games.map(game => `
    <article class="game">
      <div class="team home">
        <div>
          <div class="team-name">${game.home}</div>
          <span class="team-short">${game.homeShort}</span>
        </div>
        <div class="badge">${initials(game.home)}</div>
      </div>

      <div class="score">
        <div class="scoreline">${game.homeScore} - ${game.awayScore}</div>
        <div class="state ${game.status}">${stateText(game)}</div>
      </div>

      <div class="team away">
        <div class="badge">${initials(game.away)}</div>
        <div>
          <div class="team-name">${game.away}</div>
          <span class="team-short">${game.awayShort}</span>
        </div>
      </div>
    </article>
  `).join("");
}

function updateClock() {
  const now = new Date();
  document.getElementById("clock").textContent =
    now.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });

  document.getElementById("lastUpdate").textContent =
    "Última atualização: " + now.toLocaleTimeString("pt-BR");
}

renderGames();
updateClock();
setInterval(updateClock, 1000);

// Simulação: atualiza o relógio de um jogo ao vivo.
// Isso é apenas para testar o visual antes de conectar uma API.
setInterval(() => {
  games.forEach(game => {
    if (game.status !== "live") return;

    const parts = game.minute.split(":");
    let seconds = Number(parts[0]) * 60 + Number(parts[1]);
    seconds += 1;

    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;

    game.minute =
      String(min).padStart(2, "0") + ":" +
      String(sec).padStart(2, "0");
  });

  renderGames();
}, 1000);
