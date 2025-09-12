document.addEventListener("DOMContentLoaded", async () => {
  await preencherAnoAtual();
  await atualizarIndicadores();
  await atualizarGraficos();

  // Corrige valor do mês (0-11) para o seletor
  document.getElementById("filtro-mes").value = new Date().getMonth();
  document.getElementById("filtro-ano").addEventListener("change", atualizarGraficos);
  document.getElementById("filtro-mes").addEventListener("change", atualizarGraficos);
});

const graficos = {}; // Guarda os gráficos para destruição segura antes de recriar

async function preencherAnoAtual() {
  try {
    const anos = new Set();

    // Fetch data from APIs
    const [activeResponse, canceledResponse, claimsResponse] = await Promise.all([
      apiRequest('http://192.168.0.18:8282/api/clients/active'),
      apiRequest('http://192.168.0.18:8282/api/clients/canceled'),
      apiRequest('http://192.168.0.18:8282/api/claims')
    ]);

    if (!activeResponse.ok || !canceledResponse.ok || !claimsResponse.ok) {
      console.error('Failed to fetch data for years');
      return;
    }

    const clientesAtivos = await activeResponse.json();
    const clientesCancelados = await canceledResponse.json();
    const sinistros = await claimsResponse.json();

    [...clientesAtivos, ...clientesCancelados, ...sinistros].forEach(item => {
      const data = new Date(item.date || item.incident_date);
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
  } catch (error) {
    console.error('Error in preencherAnoAtual:', error);
  }
}

async function atualizarIndicadores() {
  try {
    const mesAtual = new Date().getMonth();
    const anoAtual = new Date().getFullYear();

    // Fetch all data from APIs
    const [
      activeResponse,
      canceledResponse,
      lostResponse,
      newResponse,
      usedResponse,
      simResponse,
      claimsResponse
    ] = await Promise.all([
      apiRequest(`${API_BASE_URL}/clients/active`),
      apiRequest(`${API_CONFIG.API_URL}/api/clients/canceled`),
      apiRequest('http://192.168.0.18:8282/api/inventory/lost'),
      apiRequest('http://192.168.0.18:8282/api/inventory/new'),
      apiRequest('http://192.168.0.18:8282/api/inventory/used'),
      apiRequest('http://192.168.0.18:8282/api/inventory/sim-cards'),
      apiRequest('http://192.168.0.18:8282/api/claims')
    ]);

    if (!activeResponse.ok || !canceledResponse.ok || !lostResponse.ok ||
        !newResponse.ok || !usedResponse.ok || !simResponse.ok || !claimsResponse.ok) {
      console.error('Failed to fetch indicator data');
      return;
    }

    const ativos = await activeResponse.json();
    const cancelados = await canceledResponse.json();
    const equipamentosPerdidos = await lostResponse.json();
    const estoqueNovos = await newResponse.json();
    const estoqueUsados = await usedResponse.json();
    const chips = await simResponse.json();
    const sinistros = await claimsResponse.json();

    const instalacoesNoMes = ativos.filter(c => {
      const data = new Date(c.date);
      return !isNaN(data) && data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
    }).length;

    const cancelamentosNoMes = cancelados.filter(c => {
      const data = new Date(c.date);
      return !isNaN(data) && data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
    }).length;

    const sinistrosAno = sinistros.filter(s => {
      const data = new Date(s.incident_date);
      return !isNaN(data) && data.getFullYear() === anoAtual;
    }).length;

    const estoqueChips = chips.filter(c => c.status === "available").length;
    const equipamentosDisponiveis = [...estoqueNovos, ...estoqueUsados].length;

    document.getElementById("clientes-ativos").textContent = ativos.length;
    document.getElementById("instalacoes-mes").textContent = instalacoesNoMes;
    document.getElementById("cancelamentos-mes").textContent = cancelamentosNoMes;
    document.getElementById("equipamentos-perdidos").textContent = equipamentosPerdidos.length;
    document.getElementById("equipamentos-estoque").textContent = equipamentosDisponiveis;
    document.getElementById("estoqueChips").textContent = estoqueChips;

    const indicadorSinistrosAno = document.getElementById("sinistros-ano");
    if (indicadorSinistrosAno) {
      indicadorSinistrosAno.textContent = sinistrosAno;
    }
  } catch (error) {
    console.error('Error in atualizarIndicadores:', error);
  }
}

async function atualizarGraficos() {
  try {
    const mes = parseInt(document.getElementById("filtro-mes").value);
    const ano = parseInt(document.getElementById("filtro-ano").value);

    // Fetch data from APIs
    const [activeResponse, canceledResponse, claimsResponse] = await Promise.all([
      apiRequest('http://192.168.0.18:8282/api/clients/active'),
      apiRequest('http://192.168.0.18:8282/api/clients/canceled'),
      apiRequest('http://192.168.0.18:8282/api/claims')
    ]);

    if (!activeResponse.ok || !canceledResponse.ok || !claimsResponse.ok) {
      console.error('Failed to fetch chart data');
      return;
    }

    const ativos = await activeResponse.json();
    const cancelados = await canceledResponse.json();
    const sinistros = await claimsResponse.json();

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
  } catch (error) {
    console.error('Error in atualizarGraficos:', error);
  }
}
