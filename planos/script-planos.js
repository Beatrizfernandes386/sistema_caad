document.addEventListener("DOMContentLoaded", () => {
    const filtro = document.getElementById("filtro");
    const basicBody = document.getElementById("basic-tbody");
    const eliteBody = document.getElementById("elite-tbody");
    const masterBody = document.getElementById("master-tbody");
  
    const basicCount = document.getElementById("basic-count");
    const eliteCount = document.getElementById("elite-count");
    const masterCount = document.getElementById("master-count");
  
    function carregarClientes() {
      const clientes = JSON.parse(localStorage.getItem("clientesAtivos") || "[]");
  
      const basic = [];
      const elite = [];
      const master = [];
  
      clientes.forEach(cliente => {
        if (cliente.plano === "BASIC") basic.push(cliente);
        else if (cliente.plano === "ELITE") elite.push(cliente);
        else if (cliente.plano === "MASTER") master.push(cliente);
      });
  
      basicCount.textContent = basic.length;
      eliteCount.textContent = elite.length;
      masterCount.textContent = master.length;
  
      preencherTabela(basic, basicBody);
      preencherTabela(elite, eliteBody);
      preencherTabelaMaster(master);
    }
  
    function preencherTabela(lista, tbody) {
      tbody.innerHTML = "";
      lista.forEach(cliente => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${cliente.nome}</td>
          <td>${cliente.dataCadastro}</td>
        `;
        tbody.appendChild(tr);
      });
    }
  
    function preencherTabelaMaster(lista) {
      masterBody.innerHTML = "";
      lista.forEach((cliente, index) => {
        const tr = document.createElement("tr");
  
        const bateria = cliente.beneficios?.bateria || 1;
        const paneSeca = cliente.beneficios?.paneSeca || 2;
        const reboque = cliente.beneficios?.reboque || 2;
  
        tr.innerHTML = `
          <td>${cliente.nome}</td>
          <td>${cliente.dataCadastro}</td>
          <td><button class="benefit-btn" data-tipo="bateria" data-index="${index}">${1 - bateria}/1</button></td>
          <td><button class="benefit-btn" data-tipo="paneSeca" data-index="${index}">${2 - paneSeca}/2</button></td>
          <td><button class="benefit-btn" data-tipo="reboque" data-index="${index}">${2 - reboque}/2</button></td>
        `;
        masterBody.appendChild(tr);
      });
  
      adicionarEventosBotoes(lista);
    }
  
    function adicionarEventosBotoes(lista) {
      document.querySelectorAll(".benefit-btn").forEach(botao => {
        botao.addEventListener("click", () => {
          const tipo = botao.dataset.tipo;
          const index = parseInt(botao.dataset.index);
          const cliente = lista[index];
  
          if (!cliente.beneficios) {
            cliente.beneficios = { bateria: 1, paneSeca: 2, reboque: 2 };
          }
  
          if (cliente.beneficios[tipo] > 0) {
            cliente.beneficios[tipo] -= 1;
            salvarBeneficio(cliente.nome, cliente.beneficios);
            carregarClientes();
          } else {
            alert("Limite de benefício atingido.");
          }
        });
      });
    }
  
    function salvarBeneficio(nomeCliente, beneficiosAtualizados) {
      const clientes = JSON.parse(localStorage.getItem("clientesAtivos") || "[]");
      const cliente = clientes.find(c => c.nome === nomeCliente);
      if (cliente) {
        cliente.beneficios = beneficiosAtualizados;
        localStorage.setItem("clientesAtivos", JSON.stringify(clientes));
      }
    }
  
    filtro.addEventListener("input", () => {
      const termo = filtro.value.toLowerCase();
      document.querySelectorAll("tbody tr").forEach(tr => {
        tr.style.display = tr.textContent.toLowerCase().includes(termo) ? "" : "none";
      });
    });
  
    carregarClientes();
  });
  