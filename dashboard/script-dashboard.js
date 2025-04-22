document.addEventListener("DOMContentLoaded", () => {
    // Função para obter dados do localStorage e preencher os cartões
    function atualizarDashboard() {
      // Obtendo os dados armazenados no localStorage
      const clientesAtivos = JSON.parse(localStorage.getItem("clientesAtivos") || "[]");
      const clientesCancelados = JSON.parse(localStorage.getItem("clientesCancelados") || "[]");
      const equipamentosInstalados = JSON.parse(localStorage.getItem("instalacoesMes") || "[]");
  
      // Preenchendo os cartões com a quantidade de clientes ativos, cancelados e instalações
      document.getElementById("clientes-ativos").textContent = clientesAtivos.length;
      document.getElementById("instalacoes-mes").textContent = equipamentosInstalados.filter(instalacao => {
        const dataInstalacao = new Date(instalacao.data);
        return dataInstalacao.getMonth() === new Date().getMonth(); // Verifica se foi no mês atual
      }).length;
      document.getElementById("cancelamentos-mes").textContent = clientesCancelados.length;
  
      // Atualizando o gráfico de pizza com a distribuição dos planos
      const planosDistribuicao = {
        BASIC: 0,
        ELITE: 0,
        MASTER: 0
      };
  
      clientesAtivos.forEach(cliente => {
        if (cliente.plano === "BASIC") planosDistribuicao.BASIC++;
        if (cliente.plano === "ELITE") planosDistribuicao.ELITE++;
        if (cliente.plano === "MASTER") planosDistribuicao.MASTER++;
      });
  
      // Gerando o gráfico de pizza com a distribuição dos planos
      const ctx = document.getElementById("graficoPlanos").getContext("2d");
      const graficoPlanos = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['BASIC', 'ELITE', 'MASTER'],
          datasets: [{
            data: [planosDistribuicao.BASIC, planosDistribuicao.ELITE, planosDistribuicao.MASTER],
            backgroundColor: ['#e67e22', '#34495e', '#2ecc71'],
            hoverBackgroundColor: ['#d35400', '#2c3e50', '#27ae60'],
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: function (tooltipItem) {
                  const data = tooltipItem.raw;
                  return `${tooltipItem.label}: ${data}`;
                }
              }
            }
          }
        }
      });
    }
  
    // Chama a função para atualizar os dados da dashboard
    atualizarDashboard();
  });
  