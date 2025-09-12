    const filtro = document.getElementById("filtro");
    const basicBody = document.getElementById("basic-tbody");
    const eliteBody = document.getElementById("elite-tbody");
    const masterBody = document.getElementById("master-tbody");
  
    const basicCount = document.getElementById("basic-count");
    const eliteCount = document.getElementById("elite-count");
    const masterCount = document.getElementById("master-count");
  
    async function carregarClientes() {
      try {
        const response = await apiRequest(`${API_CONFIG.API_URL}/api/clients/active`);
        if (!response.ok) {
          console.error('Erro ao carregar clientes para planos');
          return;
        }

        const clientes = await response.json();

        const basic = [];
        const elite = [];
        const master = [];

        clientes.forEach(cliente => {
          if (cliente.plan === "BASIC") basic.push(cliente);
          else if (cliente.plan === "ELITE") elite.push(cliente);
          else if (cliente.plan === "MASTER") master.push(cliente);
        });

        basicCount.textContent = basic.length;
        eliteCount.textContent = elite.length;
        masterCount.textContent = master.length;

        preencherTabela(basic, basicBody);
        preencherTabela(elite, eliteBody);
        preencherTabelaMaster(master);
      } catch (error) {
        console.error('Erro ao carregar clientes:', error);
      }
    }
  
    function preencherTabela(lista, tbody) {
      tbody.innerHTML = "";
      lista.forEach(cliente => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${cliente.name}</td>
          <td>${cliente.date}</td>
        `;
        tbody.appendChild(tr);
      });
    }
  
    function preencherTabelaMaster(lista) {
      masterBody.innerHTML = "";
      lista.forEach((cliente, index) => {
        const beneficios = cliente.beneficios || {
          bateria: { restante: 1, ultimosUsos: [] },
          paneSeca: { restante: 2, ultimosUsos: [] },
          reboque: { restante: 2, ultimosUsos: [] }
        };
    
        // Ajusta estrutura antiga, se houver
        ["bateria", "paneSeca", "reboque"].forEach(tipo => {
          if (typeof beneficios[tipo] === "number") {
            beneficios[tipo] = { restante: beneficios[tipo], ultimosUsos: [] };
          }
        });
    
        cliente.beneficios = beneficios;
    
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${cliente.name}</td>
          <td>${cliente.date}</td>
          <td>${gerarBotao("bateria", beneficios.bateria, index)}</td>
          <td>${mostrarInfoUso("bateria", beneficios.bateria)}</td>
          <td>${gerarBotao("paneSeca", beneficios.paneSeca, index)}</td>
          <td>${mostrarInfoUso("paneSeca", beneficios.paneSeca)}</td>
          <td>${gerarBotao("reboque", beneficios.reboque, index)}</td>
          <td>${mostrarInfoUso("reboque", beneficios.reboque)}</td>
        `;
        masterBody.appendChild(tr);
      });
    
      adicionarEventosBotoes(lista);
    }
    
    function gerarBotao(tipo, beneficio, index) {
      return beneficio.restante > 0
        ? `<button class="benefit-btn" data-tipo="${tipo}" data-index="${index}">
             ${tipo === "bateria" ? 1 - beneficio.restante : 2 - beneficio.restante}/${tipo === "bateria" ? 1 : 2}
           </button>`
        : `<button class="benefit-btn" data-tipo="${tipo}" data-index="${index}" disabled>
             Bloqueado
           </button>`;
    }
    
    function mostrarInfoUso(tipo, beneficio) {
      if (beneficio.ultimosUsos.length === 0) {
        return "-";
      }
    
      const ultimaData = new Date(beneficio.ultimosUsos.at(-1));
      const dataFormatada = ultimaData.toLocaleDateString("pt-BR");
    
      if (beneficio.restante === 0) {
        const proxima = new Date(ultimaData);
        proxima.setFullYear(proxima.getFullYear() + 1);
        return `Usado: ${dataFormatada}<br><small>Disponível: ${proxima.toLocaleDateString("pt-BR")}</small>`;
      } else {
        return `Usado: ${dataFormatada}`;
      }
    }
    
    function adicionarEventosBotoes(lista) {
      document.querySelectorAll(".benefit-btn").forEach(botao => {
        botao.addEventListener("click", () => {
          const tipo = botao.dataset.tipo;
          const index = parseInt(botao.dataset.index);
          const cliente = lista[index];
          const beneficio = cliente.benefits[tipo];

          if (beneficio.restante > 0) {
            beneficio.restante -= 1;
            beneficio.ultimosUsos.push(new Date().toISOString().split("T")[0]);
            salvarBeneficio(cliente.id, cliente.benefits);
            carregarClientes(); // Recarrega a tabela
          } else {
            alert("Limite atingido.");
          }
        });
      });
    }
    
    async function salvarBeneficio(clientId, beneficiosAtualizados) {
      try {
        const response = await apiRequest(`${API_CONFIG.API_URL}/api/clients/${clientId}`, {
          method: 'PUT',
          body: JSON.stringify({
            benefits: beneficiosAtualizados
          })
        });

        if (!response.ok) {
          console.error('Erro ao salvar benefícios');
        }
      } catch (error) {
        console.error('Erro ao salvar benefícios:', error);
      }
    }
    
    filtro.addEventListener("input", () => {
      const termo = filtro.value.toLowerCase();
      document.querySelectorAll("tbody tr").forEach(tr => {
        tr.style.display = tr.textContent.toLowerCase().includes(termo) ? "" : "none";
      });
    });
  
    // Inicialização
    window.addEventListener("load", async () => {
      await carregarClientes();
    });

  
