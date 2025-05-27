// Função para buscar dados do localStorage
function getDashboardData() {
  const planos = JSON.parse(localStorage.getItem('planos')) || {}; // Pega os planos do localStorage

  return {
    clientesAtivos: JSON.parse(localStorage.getItem('clientesAtivos'))?.length || 0, 
    instalacoesMes: 15, 
    cancelamentosMes: 5, 
    equipamentosPerdidosMes: JSON.parse(localStorage.getItem('equipamentosPerdidos'))?.length || 0,
    equipamentosEstoque: JSON.parse(localStorage.getItem('estoqueUsados'))?.length + JSON.parse(localStorage.getItem('estoqueNovos'))?.length || 0,
    linhasEstoque: JSON.parse(localStorage.getItem('estoqueChips'))?.length || 0,
    resumoPlanos: planos,

    distribuicaoPlanos: planos, // Agora usa os dados de planos do localStorage
    evolucaoMensal: {
      meses: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
      instalacoes: [5, 8, 12, 15, 10, 20], 
      desinstalacoes: []  // Adicionando desinstalações
    },
    sinistrosAnuais: {
      anos: ['2019', '2020', '2021', '2022', '2023', '2024', '2025'],
      quantidade: [10, 15, 12, 8] 
    }
  };
}

document.getElementById('filtro-mes').addEventListener('change', function() {
  const mesSelecionado = this.value;

  // Apenas atualiza os cards se um mês válido for selecionado
  if (mesSelecionado) {
    atualizarCardsComFiltro(mesSelecionado);
  }
});

function atualizarCardsComFiltro(mes) {
  const dados = obterDadosPorMes(mes);
  console.log('Atualizando cards com dados para o mês:', mes, dados); // Log para depuração
  atualizarCards(dados);
}

function obterDadosPorMes(mes) {
  // Simulação de dados para cada mês
  const dadosMeses = {
    '01': { clientesAtivos: 970, instalacoesMes: 15, cancelamentosMes: 5, equipamentosPerdidos: 3, equipamentosEstoque: 1, linhasEstoque: 1 },
    '02': { clientesAtivos: 950, instalacoesMes: 10, cancelamentosMes: 3, equipamentosPerdidos: 2, equipamentosEstoque: 2, linhasEstoque: 2 },
    // Adicionar os dados de outros meses aqui
    '03': { clientesAtivos: 920, instalacoesMes: 12, cancelamentosMes: 4, equipamentosPerdidos: 5, equipamentosEstoque: 0, linhasEstoque: 3 }
  };
  
  return dadosMeses[mes] || { clientesAtivos: 0, instalacoesMes: 0, cancelamentosMes: 0, equipamentosPerdidos: 0, equipamentosEstoque: 0, linhasEstoque: 0 };
}

function atualizarCards(dados) {
  // Atualizando os cards
  const clientesAtivos = document.getElementById('clientes-ativos');
  const instalacoesMes = document.getElementById('instalacoes-mes');
  const cancelamentosMes = document.getElementById('cancelamentos-mes');
  const equipamentosPerdidos = document.getElementById('equipamentos-perdidos');
  const equipamentosEstoque = document.getElementById('equipamentos-estoque');
  const linhasEstoque = document.getElementById('linhas-estoque');

  // Atualizando os valores
  if (clientesAtivos) {
    clientesAtivos.textContent = dados.clientesAtivos;
  }
  if (instalacoesMes) {
    instalacoesMes.textContent = dados.instalacoesMes;
  }
  if (cancelamentosMes) {
    cancelamentosMes.textContent = dados.cancelamentosMes;
  }
  if (equipamentosPerdidos) {
    equipamentosPerdidos.textContent = dados.equipamentosPerdidos;
  }
  if (equipamentosEstoque) {
    equipamentosEstoque.textContent = dados.equipamentosEstoque;
  }
  if (linhasEstoque) {
    linhasEstoque.textContent = dados.linhasEstoque;
  }
}

const distribuicaoCtx = document.getElementById('chart-distribuicao').getContext('2d');
const instalacoesCtx = document.getElementById('chart-instalacoes').getContext('2d');
const sinistrosCtx = document.getElementById('chart-sinistros').getContext('2d');

// Atualize a referência para a variável distribuicaoPlanos
const distribuicaoPlanos = getDashboardData().distribuicaoPlanos;
const evolucaoMensal = getDashboardData().evolucaoMensal;
const sinistrosAnuais = getDashboardData().sinistrosAnuais;

// Gráfico distribuição de planos
new Chart(distribuicaoCtx, {
  type: 'pie',
  data: {
    labels: Object.keys(distribuicaoPlanos),
    datasets: [{
      data: Object.values(distribuicaoPlanos),
      backgroundColor: ['#e67e22', '#34495e', '#7f8c8d']
    }]
  },
  options: {
    plugins: {
      title: {
        display: true,
        text: 'Distribuição de Planos'
      }
    }
  }
});

// Gráfico evolução mensal de instalações e desinstalações
new Chart(instalacoesCtx, {
  type: 'line',
  data: {
    labels: evolucaoMensal.meses,
    datasets: [
      {
        label: 'Instalações',
        data: evolucaoMensal.instalacoes,
        borderColor: '#e67e22',
        backgroundColor: 'rgba(230,126,34,0.2)',
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Desinstalações',
        data: evolucaoMensal.desinstalacoes,
        borderColor: '#34495e',
        backgroundColor: 'rgba(52,152,219,0.2)',
        tension: 0.3,
        fill: true,
      }
    ]
  },
  options: {
    responsive: true,
    plugins: { 
      legend: { display: true },
      title: {
        display: true,
        text: 'Evolução de Instalações e Desinstalações Mensais'
      }
    },
    scales: {
      y: { beginAtZero: true }
    }
  }
});

// Gráfico sinistros anuais
new Chart(sinistrosCtx, {
  type: 'bar',
  data: {
    labels: sinistrosAnuais.anos,
    datasets: [{
      label: 'Sinistros',
      data: sinistrosAnuais.quantidade,
      backgroundColor: '#34495e',
    }]
  },
  options: {
    responsive: true,
    plugins: { 
      legend: { display: false },
      title: {
        display: true,
        text: 'Sinistros Anuais'
      }
    },
    scales: {
      y: { beginAtZero: true }
    }
  }
});

// Inicializar dashboard
function inicializarDashboard() {
  const dados = getDashboardData();
  atualizarCards(dados);
  criarGraficoPlanos(dados.distribuicaoPlanos);
  criarGraficoEvolucao(dados.evolucaoMensal);
  criarGraficoSinistros(dados.sinistrosAnuais);
}

const filtroMes = document.getElementById("filtro-mes");

filtroMes.addEventListener("change", () => {
  const mesSelecionado = filtroMes.value;
  
  // Chame a função de atualização dos cards
  atualizarCardsComFiltro(mesSelecionado);
});

function atualizarCardsComFiltro(mes) {
  const dados = getDashboardData();

  // Aqui você aplica o filtro de mês apenas nos dados dos cards
  if (mes) {
    const clientesFiltrados = filtrarDadosPorMes(mes);
    dados.clientesAtivos = clientesFiltrados.length;
    dados.instalacoesMes = clientesFiltrados.filter(cliente => new Date(cliente.dataCadastro).getMonth() + 1 === parseInt(mes)).length;
    dados.cancelamentosMes = 5;  // Exemplo, coloque a lógica aqui
    dados.equipamentosPerdidosMes = 5;  // Exemplo, coloque a lógica aqui
  }

  // Atualize apenas os cards
  atualizarCards(dados);
}

function filtrarDadosPorMes(mes) {
  const clientes = JSON.parse(localStorage.getItem("clientesAtivos")) || [];
  
  if (!mes) return clientes;
  
  return clientes.filter(cliente => {
    const mesCadastro = new Date(cliente.dataCadastro).getMonth() + 1; // Mês começa do 0
    return mesCadastro === parseInt(mes);
  });
}
