const API_URL = "https://v3.football.api-sports.io/fixtures?live=all";
const $ = id => document.getElementById(id);

let timer = null;
let currentGames = [];
let selectedGameId = localStorage.getItem("selected_game_id") || "";

// ===============================
// CONFIGURAÇÕES
// ===============================

function key() {
  return localStorage.getItem("football_api_key") || "";
}

function interval() {
  return Number(localStorage.getItem("football_interval") || 300) * 1000;
}

function openSetup() {
  $("apiKey").value = key();
  $("interval").value = String(interval() / 1000);
  $("setup").classList.add("show");
}

$("settingsBtn").onclick = openSetup;

$("closeSetup").onclick = () => {
  $("setup").classList.remove("show");
};

$("saveBtn").onclick = async () => {
  const k = $("apiKey").value.trim();

  if (!k) {
    alert("Digite sua API key.");
    return;
  }

  localStorage.setItem("football_api_key", k);
  localStorage.setItem("football_interval", $("interval").value);

  $("setup").classList.remove("show");

  await loadGames();
  startTimer();
};


// ===============================
// STATUS DA PARTIDA
// ===============================

function statusClass(s) {
  if (["1H", "2H", "ET", "P"].includes(s)) {
    return "live";
  }

  if (["HT", "BT"].includes(s)) {
    return "ht";
  }

  return "ft";
}


function statusText(f) {
  const s = f.fixture.status.short;

  if (s === "HT") {
    return "Intervalo";
  }

  if (["FT", "AET", "P"].includes(s)) {
    return "Encerrado";
  }

  if (["1H", "2H", "ET"].includes(s)) {
    return `${f.fixture.status.elapsed || 0}'`;
  }

  return f.fixture.status.long || s;
}


// ===============================
// SEGURANÇA DO HTML
// ===============================

function esc(s) {
  return String(s ?? "").replace(
    /[&<>"']/g,
    m => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[m])
  );
}


// ===============================
// TIMES
// ===============================

function team(t, side) {

  const logo = t.logo
    ? `<img class="badge" src="${esc(t.logo)}" alt="">`
    : `<div class="badge fallback">
        ${esc(t.name).slice(0, 3).toUpperCase()}
      </div>`;

  return `
    <div class="team ${side}">

      ${
        side === "home"
          ? `
            <div>
              <div class="team-name">
                ${esc(t.name)}
              </div>

              <span class="team-short">
                ${esc(t.code || "")}
              </span>
            </div>

            ${logo}
          `
          : `
            ${logo}

            <div>
              <div class="team-name">
                ${esc(t.name)}
              </div>

              <span class="team-short">
                ${esc(t.code || "")}
              </span>
            </div>
          `
      }

    </div>
  `;
}


// ===============================
// RENDERIZAR PARTIDAS
// ===============================

function render(list) {

  currentGames = list;

  const games = list.slice(0, 8);

  $("games").innerHTML = games.map(f => {

    const id = String(f.fixture.id);

    const selected = id === selectedGameId;

    return `
      <article
        class="game ${selected ? "selected" : ""}"
        data-id="${id}"
      >

        ${team(f.teams.home, "home")}

        <div class="score">

          <div class="scoreline">
            ${f.goals.home ?? 0} - ${f.goals.away ?? 0}
          </div>

          <div class="state ${statusClass(f.fixture.status.short)}">
            ${statusText(f)}
          </div>

          <button
            class="select-game"
            onclick="selectGame('${id}')"
          >
            ${
              selected
                ? "✓ Selecionada"
                : "Selecionar"
            }
          </button>

        </div>

        ${team(f.teams.away, "away")}

      </article>
    `;

  }).join("");

  $("gameCount").textContent =
    `${list.length} partida(s) ao vivo • mostrando até 8`;

  $("empty").style.display =
    list.length ? "none" : "block";
}


// ===============================
// SELECIONAR PARTIDA
// ===============================

function selectGame(id) {

  selectedGameId = String(id);

  localStorage.setItem(
    "selected_game_id",
    selectedGameId
  );

  const game = currentGames.find(
    f => String(f.fixture.id) === selectedGameId
  );

  if (game) {

    console.log(
      "Partida selecionada:",
      game.teams.home.name,
      "x",
      game.teams.away.name
    );

  }

  render(currentGames);
}


// ===============================
// PEGAR PARTIDA SELECIONADA
// ===============================

function getSelectedGame() {

  if (!selectedGameId) {
    return null;
  }

  return currentGames.find(
    f => String(f.fixture.id) === selectedGameId
  ) || null;
}


// ===============================
// CARREGAR PARTIDAS
// ===============================

async function loadGames() {

  const k = key();

  if (!k) {

    $("loading").style.display = "none";

    $("empty").style.display = "block";

    $("empty").textContent =
      "Clique em ⚙ e coloque sua API key.";

    return;
  }

  $("loading").style.display = "block";

  try {

    const r = await fetch(
      API_URL,
      {
        headers: {
          "x-apisports-key": k
        }
      }
    );

    if (!r.ok) {
      throw new Error("HTTP " + r.status);
    }

    const data = await r.json();

    render(data.response || []);

    $("status").textContent =
      `API: ${data.results ?? 0} jogos`;

    $("lastUpdate").textContent =
      "Atualizado: " +
      new Date().toLocaleTimeString("pt-BR");

  } catch (e) {

    console.error(e);

    $("games").innerHTML = "";

    $("empty").style.display = "block";

    $("empty").textContent =
      "Erro ao carregar. Verifique a API key.";

    $("status").textContent =
      "Erro na API";

  } finally {

    $("loading").style.display = "none";

  }
}


// ===============================
// ATUALIZAÇÃO AUTOMÁTICA
// ===============================

function startTimer() {

  clearInterval(timer);

  timer = setInterval(
    loadGames,
    interval()
  );
}


// ===============================
// INICIALIZAÇÃO
// ===============================

if (key()) {

  loadGames();

  startTimer();

} else {

  openSetup();

}
