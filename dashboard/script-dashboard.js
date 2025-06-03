document.addEventListener("DOMContentLoaded", () => {
  preencherAnoAtual();
  atualizarIndicadores();
  atualizarGraficos();

  // Corrige valor do mês (0-11) para o seletor
  document.getElementById("filtro-mes").value = new Date().getMonth();
  document.getElementById("filtro-ano").addEventListener("change", atualizarGraficos);
  document.getElementById("filtro-mes").addEventListener("change", atualizarGraficos);
});

const graficos = {}; // Guarda os gráficos para destruição segura antes de recriar

function preencherAnoAtual() {
  const anos = new Set();
  const clientesAtivos = JSON.parse(localStorage.getItem("clientesAtivos") || "[]");
  const clientesCancelados = JSON.parse(localStorage.getItem("clientesCancelados") || "[]");
  const sinistros = JSON.parse(localStorage.getItem("sinistros") || "[]");

  [...clientesAtivos, ...clientesCancelados, ...sinistros].forEach(item => {
    const data = new Date(item.data || item.dataCancelamento || item.dataSinistro);
    if (!isNaN(data)) anos.add(data.getFullYear());
  });

  const filtroAno = document.getElementById("filtro-ano");
  filtroAno.innerHTML = "";
  const anosOrdenados = Array.from(anos).sort((a, b) => b - a);

  anosOrdenados.forEach(ano => {
    const option = document.createElement("option");
    option.value = ano;
    option.textContent = ano;
    filtroAno.appendChild(option);
  });

  // Seleciona o ano atual, se existir
  const anoAtual = new Date().getFullYear();
  if (anos.has(anoAtual)) {
    filtroAno.value = anoAtual;
  } else if (anosOrdenados.length > 0) {
    filtroAno.value = anosOrdenados[0];
  }
}

function atualizarIndicadores() {
  const ativos = JSON.parse(localStorage.getItem("clientesAtivos") || "[]");
  const cancelados = JSON.parse(localStorage.getItem("clientesCancelados") || "[]");
  const equipamentosPerdidos = JSON.parse(localStorage.getItem("equipamentosPerdidos") || "[]");
  const estoqueNovos = JSON.parse(localStorage.getItem("estoqueNovos") || "[]");
  const estoqueUsados = JSON.parse(localStorage.getItem("estoqueUsados") || "[]");
  const chips = JSON.parse(localStorage.getItem("estoqueChips") || "[]");
  const sinistros = JSON.parse(localStorage.getItem("sinistros") || "[]");

  const mesAtual = new Date().getMonth();
  const anoAtual = new Date().getFullYear();

  const instalacoesNoMes = ativos.filter(c => {
    const data = new Date(c.data);
    return !isNaN(data) && data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
  }).length;

  const cancelamentosNoMes = cancelados.filter(c => {
    const data = new Date(c.dataCancelamento);
    return !isNaN(data) && data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
  }).length;

  const sinistrosAno = sinistros.filter(s => {
    const data = new Date(s.dataSinistro);
    return !isNaN(data) && data.getFullYear() === anoAtual;
  }).length;

  const linhasDisponiveis = chips.filter(c => c.status === "disponível").length;
  const equipamentosDisponiveis = [...estoqueNovos, ...estoqueUsados].filter(e => e.status === "novo" || e.status === "usado").length;

  document.getElementById("clientes-ativos").textContent = ativos.length;
  document.getElementById("instalacoes-mes").textContent = instalacoesNoMes;
  document.getElementById("cancelamentos-mes").textContent = cancelamentosNoMes;
  document.getElementById("equipamentos-perdidos").textContent = equipamentosPerdidos.length;
  document.getElementById("equipamentos-estoque").textContent = equipamentosDisponiveis;
  document.getElementById("linhas-estoque").textContent = linhasDisponiveis;

  const indicadorSinistrosAno = document.getElementById("sinistros-ano");
  if (indicadorSinistrosAno) {
    indicadorSinistrosAno.textContent = sinistrosAno;
  }
}

function atualizarGraficos() {
  const mes = parseInt(document.getElementById("filtro-mes").value);
  const ano = parseInt(document.getElementById("filtro-ano").value);

  const ativos = JSON.parse(localStorage.getItem("clientesAtivos") || "[]");
  const cancelados = JSON.parse(localStorage.getItem("clientesCancelados") || "[]");
  const sinistros = JSON.parse(localStorage.getItem("sinistros") || "[]");

  // --- Gráfico 1: Distribuição de planos ---
  const planos = { BASIC: 0, ELITE: 0, MASTER: 0 };
  ativos.forEach(cliente => {
    if (cliente.plano && planos[cliente.plano] !== undefined) {
      planos[cliente.plano]++;
    }
  });

  const ctxDistribuicao = document.getElementById("chart-distribuicao").getContext("2d");
  if (graficos.distribuicao) graficos.distribuicao.destroy();
  graficos.distribuicao = new Chart(ctxDistribuicao, {
    type: 'pie',
    data: {
      labels: Object.keys(planos),
      datasets: [{
        data: Object.values(planos),
        backgroundColor: ['#e67e22', '#91e622', '#2922e6'],
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Distribuição de Planos'
        }
      }
    }
  });

  // --- Gráfico 2: Instalações e Cancelamentos por mês ---
  const meses = Array(12).fill(0);
  const cancelamentos = Array(12).fill(0);

  ativos.forEach(c => {
    const data = new Date(c.data);
    if (!isNaN(data) && data.getFullYear() === ano) {
      meses[data.getMonth()]++;
    }
  });

  cancelados.forEach(c => {
    const data = new Date(c.dataCancelamento);
    if (!isNaN(data) && data.getFullYear() === ano) {
      cancelamentos[data.getMonth()]++;
    }
  });

  const ctxInstalacoes = document.getElementById("chart-instalacoes").getContext("2d");
  if (graficos.instalacoes) graficos.instalacoes.destroy();
  graficos.instalacoes = new Chart(ctxInstalacoes, {
    type: 'bar',
    data: {
      labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
      datasets: [
        {
          label: 'Instalações',
          backgroundColor: '#e67e22',
          data: meses
        },
        {
          label: 'Cancelamentos',
          backgroundColor: '#333',
          data: cancelamentos
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Instalações e Cancelamentos'
        }
      }
    }
  });

  // --- Gráfico 3: Sinistros por ano ---
  const anos = {};
  sinistros.forEach(s => {
    const data = new Date(s.dataSinistro);
    if (!isNaN(data)) {
      const y = data.getFullYear();
      anos[y] = (anos[y] || 0) + 1;
    }
  });

  const anosOrdenados = Object.keys(anos).sort((a, b) => a - b);
  const dadosSinistros = anosOrdenados.map(ano => anos[ano]);

  const ctxSinistros = document.getElementById("chart-sinistros").getContext("2d");
  if (graficos.sinistros) graficos.sinistros.destroy();
  graficos.sinistros = new Chart(ctxSinistros, {
    type: 'line',
    data: {
      labels: anosOrdenados,
      datasets: [{
        label: 'Sinistros',
        borderColor: '#2196f3',
        fill: false,
        data: dadosSinistros
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Sinistros por Ano'
        }
      }
    }
  });
}
