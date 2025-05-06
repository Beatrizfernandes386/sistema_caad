document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modal-cadastro");
    const abrirModalBtn = document.getElementById("abrir-modal");
    const fecharModalBtn = document.getElementById("fechar-modal");
    const formSinistro = document.getElementById("form-sinistro");
    const tabela = document.getElementById("tabela-sinistros");
    const filtroInput = document.getElementById("filtro-sinistros");
    const importarInput = document.getElementById("importar-sinistros");
  
    let sinistros = JSON.parse(localStorage.getItem("sinistros")) || [];
  
    // Abrir e fechar modal
    abrirModalBtn.addEventListener("click", () => modal.style.display = "block");
    fecharModalBtn.addEventListener("click", () => modal.style.display = "none");
  
    // Fechar modal ao clicar fora dele
    window.addEventListener("click", (e) => {
      if (e.target === modal) modal.style.display = "none";
    });
  
    // Salvar sinistro
    formSinistro.addEventListener("submit", (e) => {
      e.preventDefault();
  
      const novoSinistro = {
        cliente: document.getElementById("cliente").value,
        modelo: document.getElementById("modelo").value,
        localSinistro: document.getElementById("localSinistro").value,
        data: document.getElementById("data").value,
        hora: document.getElementById("horaInforme").value,
        tempoOperacao: `${document.getElementById("horas").value}h ${document.getElementById("minutos").value}min`,
        localRecuperacao: document.getElementById("localRecuperacao").value,
        relatorio: document.getElementById("relatorio").value,
      };
  
      sinistros.push(novoSinistro);
      localStorage.setItem("sinistros", JSON.stringify(sinistros));
      formSinistro.reset();
      modal.style.display = "none";
      renderizarTabela(sinistros);
    });
  
    // Renderizar tabela
    function renderizarTabela(lista) {
      tabela.innerHTML = "";
      lista.forEach((sinistro, index) => {
        // Formatar a data no padrão pt-BR
        let dataFormatada = sinistro.data;
        if (sinistro.data) {
          const dataObj = new Date(sinistro.data);
          if (!isNaN(dataObj)) {
            dataFormatada = dataObj.toLocaleDateString('pt-BR');
          }
        }
    
        const tr = document.createElement("tr");
    
        tr.innerHTML = `
          <td>${sinistro.cliente}</td>
          <td>${sinistro.modelo}</td>
          <td>${sinistro.localSinistro}</td>
          <td>${dataFormatada}</td>
          <td>${sinistro.hora}</td>
          <td>${sinistro.tempoOperacao}</td>
          <td>${sinistro.localRecuperacao}</td>
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
    filtroInput.addEventListener("input", () => {
      const termo = filtroInput.value.toLowerCase();
      const filtrados = sinistros.filter(s =>
        s.cliente.toLowerCase().includes(termo) ||
        s.modelo.toLowerCase().includes(termo) ||
        s.localSinistro.toLowerCase().includes(termo) ||
        s.localRecuperacao.toLowerCase().includes(termo)
      );
      renderizarTabela(filtrados);
    });
  
    // Importar JSON
    importarInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
  
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const dados = JSON.parse(reader.result);
          if (Array.isArray(dados)) {
            sinistros = sinistros.concat(dados);
            localStorage.setItem("sinistros", JSON.stringify(sinistros));
            renderizarTabela(sinistros);
          } else {
            alert("Arquivo inválido.");
          }
        } catch (err) {
          alert("Erro ao ler o arquivo.");
        }
      };
      reader.readAsText(file);
    });
  
    renderizarTabela(sinistros);
  });
  