document.addEventListener("DOMContentLoaded", async () => {
    const modal = document.getElementById("modal-cadastro");
    const abrirModalBtn = document.getElementById("abrir-modal");
    const fecharModalBtn = document.getElementById("fechar-modal");
    const formSinistro = document.getElementById("form-sinistro");
    const tabela = document.getElementById("tabela-sinistros");
    const filtroInput = document.getElementById("filtro-sinistros");
    const importarInput = document.getElementById("importar-sinistros");

    let sinistros = [];
  
    // Abrir e fechar modal
    abrirModalBtn.addEventListener("click", () => modal.style.display = "block");
    fecharModalBtn.addEventListener("click", () => modal.style.display = "none");
  
    // Fechar modal ao clicar fora dele
    window.addEventListener("click", (e) => {
      if (e.target === modal) modal.style.display = "none";
    });
  
    // Salvar sinistro
    formSinistro.addEventListener("submit", async (e) => {
      e.preventDefault();

      const novoSinistro = {
        client: document.getElementById("cliente").value,
        vehicle_model: document.getElementById("modelo").value,
        incident_location: document.getElementById("localSinistro").value,
        incident_date: document.getElementById("data").value,
        report_time: document.getElementById("horaInforme").value,
        operation_hours: parseInt(document.getElementById("horas").value) || 0,
        operation_minutes: parseInt(document.getElementById("minutos").value) || 0,
        recovery_location: document.getElementById("localRecuperacao").value,
        report: document.getElementById("relatorio").value,
      };

      try {
        const response = await apiRequest(`${API_CONFIG.API_URL}/api/claims`, {
          method: 'POST',
          body: JSON.stringify(novoSinistro)
        });

        if (response.ok) {
          formSinistro.reset();
          modal.style.display = "none";
          await carregarSinistros();
        } else {
          const error = await response.json();
          alert(error.message || 'Erro ao salvar sinistro');
        }
      } catch (error) {
        console.error('Erro ao salvar sinistro:', error);
        alert('Erro ao salvar sinistro');
      }
    });
  
    // Carregar sinistros da API
    async function carregarSinistros() {
      try {
        const response = await apiRequest(`${API_CONFIG.API_URL}/api/claims`);
        if (!response.ok) {
          console.error('Erro ao carregar sinistros');
          return;
        }

        sinistros = await response.json();
        renderizarTabela(sinistros);
      } catch (error) {
        console.error('Erro ao carregar sinistros:', error);
      }
    }

    // Renderizar tabela
    function renderizarTabela(lista) {
      tabela.innerHTML = "";
      lista.forEach((sinistro, index) => {
        // Formatar a data no padrão pt-BR
        let dataFormatada = sinistro.incident_date;
        if (sinistro.incident_date) {
          const dataObj = new Date(sinistro.incident_date);
          if (!isNaN(dataObj)) {
            dataFormatada = dataObj.toLocaleDateString('pt-BR');
          }
        }

        const tempoOperacao = sinistro.operation_hours && sinistro.operation_minutes
          ? `${sinistro.operation_hours}h ${sinistro.operation_minutes}min`
          : '-';

        const tr = document.createElement("tr");

        tr.innerHTML = `
          <td>${sinistro.client}</td>
          <td>${sinistro.vehicle_model}</td>
          <td>${sinistro.incident_location}</td>
          <td>${dataFormatada}</td>
          <td>${sinistro.report_time || '-'}</td>
          <td>${tempoOperacao}</td>
          <td>${sinistro.recovery_location}</td>
          <td><button onclick="mostrarRelatorio(${index})">Ver</button></td>
        `;

        tabela.appendChild(tr);
      });
    }
  
    // Mostrar relatório
    window.mostrarRelatorio = (index) => {
      const relatorio = sinistros[index].relatorio;
      document.getElementById("texto-relatorio").textContent = relatorio;
      document.getElementById("modal-relatorio").style.display = "block";
      document.getElementById("overlay").style.display = "block";
    };
  
    // Fechar relatório
    window.fecharRelatorio = () => {
      document.getElementById("modal-relatorio").style.display = "none";
      document.getElementById("overlay").style.display = "none";
    };
  
    // Filtro de pesquisa
    filtroInput.addEventListener("input", async () => {
      const termo = filtroInput.value.toLowerCase();

      if (termo.trim() === "") {
        await carregarSinistros();
        return;
      }

      try {
        const response = await apiRequest(`${API_CONFIG.API_URL}/api/claims/search/${encodeURIComponent(termo)}`);
        if (!response.ok) {
          console.error('Erro ao filtrar sinistros');
          return;
        }

        const filtrados = await response.json();
        renderizarTabela(filtrados);
      } catch (error) {
        console.error('Erro ao filtrar sinistros:', error);
      }
    });
  
    // Importar JSON (desabilitado pois sinistros são gerados automaticamente)
    importarInput.addEventListener("change", (e) => {
      alert("Importação de sinistros não suportada.\nSinistros são registrados individualmente.");
    });

    // Inicializar
    await carregarSinistros();
  });
  
