// ---------- FUNÇÃO PARA PREENCHER A TABELA ----------
function preencherTabelaClientesAtivos(novosClientes) {
  const tbody = document.getElementById('tbody-clientes-ativos');
  tbody.innerHTML = ''; // Limpa o corpo da tabela

  novosClientes.forEach((cliente, index) => {
    let dataFormatada = cliente.data;
    if (dataFormatada.includes('/')) {
      const dataConvertida = converterDataBrParaIso(dataFormatada);
      if (dataConvertida) {
        dataFormatada = new Date(dataConvertida).toLocaleDateString('pt-BR');
      }
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${cliente.nome}</td>
      <td>${cliente.plano}</td>
      <td>${cliente.veiculo}</td>
      <td>${cliente.modelo}</td>
      <td>${cliente.imei}</td>
      <td>${cliente.linha}</td>
      <td>${cliente.servico}</td>
      <td>${dataFormatada}</td>
    `;
    tr.dataset.index = index;
    tbody.appendChild(tr);
  });
}

function aplicarFiltroClientesAtivos(event) {
  const termo = event.target.value.toLowerCase();
  const clientes = JSON.parse(localStorage.getItem("clientesAtivos")) || [];

  const filtrados = clientes.filter(cliente => {
    return (
      (cliente.nome || "").toLowerCase().includes(termo) ||
(cliente.plano || "").toLowerCase().includes(termo) ||
(cliente.veiculo || "").toLowerCase().includes(termo) ||
(cliente.modelo || "").toLowerCase().includes(termo) ||
(cliente.imei || "").toLowerCase().includes(termo) ||
(cliente.linha || "").toLowerCase().includes(termo) ||
(cliente.servico || "").toLowerCase().includes(termo) ||
(cliente.data || "").toLowerCase().includes(termo)

    );
  });

  preencherTabelaClientesAtivos(filtrados);
}

// ---------- CONVERTER DATA BR PARA ISO ----------
function converterDataBrParaIso(dataBr) {
  const [dia, mes, ano] = dataBr.split('/');
  if (!dia || !mes || !ano) return null;
  return `${ano}-${mes}-${dia}`;
}

// ---------- FUNÇÃO DE PREENCHIMENTO DE SELECTS ----------
function preencherSelectsDeEstoque(modeloSelect, imeiSelect, linhaSelect) {
  modeloSelect.addEventListener("change", () => {
    const modeloSelecionado = modeloSelect.value;
    const imeisDisponiveis = [
      ...estoqueNovos.filter(e => e.modelo === modeloSelecionado).map(e => ({ ...e, tipo: "#tabela-equipamentos-novos" })),
      ...estoqueUsados.filter(e => e.modelo === modeloSelecionado).map(e => ({ ...e, tipo: "#tabela-equipamentos-usados" }))
    ];

    imeiSelect.innerHTML = `<option value="">IMEI</option>`;
    imeisDisponiveis.forEach(equip => {
      const option = document.createElement("option");
      option.value = equip.imei;
      option.textContent = equip.imei;
      option.dataset.tipo = equip.tipo;
      imeiSelect.appendChild(option);
    });

    linhaSelect.innerHTML = `<option value="">Linha</option>`;
  });

  
  imeiSelect.addEventListener("change", () => {
    const imeiSelecionado = imeiSelect.value;
    const tipo = imeiSelect.options[imeiSelect.selectedIndex].dataset.tipo;

    linhaSelect.innerHTML = `<option value="">Linha</option>`;

    if (tipo === "#tabela-equipamentos-novos") {
      const chipsDisponiveis = estoqueChips.filter(c => c.status === "ATIVO");
      chipsDisponiveis.forEach(chip => {
        const option = document.createElement("option");
        option.value = chip.linha;
        option.textContent = chip.linha;
        linhaSelect.appendChild(option);
      });
    } else if (tipo === "#tabela-equipamentos-usados") {
      const equipamento = estoqueUsados.find(e => e.imei === imeiSelecionado);
      if (equipamento && equipamento.linha) {
        const option = document.createElement("option");
        option.value = equipamento.linha;
        option.textContent = equipamento.linha;
        linhaSelect.appendChild(option);
      }
    }
  });
}

document.getElementById('importar-json').addEventListener('change', function(event) {
  const file = event.target.files[0];

  if (file && file.type === "application/json") {
      const reader = new FileReader();

      reader.onload = function(e) {
          try {
              const dadosImportados = JSON.parse(e.target.result);

              if (Array.isArray(dadosImportados)) {
                  // Apagar dados antigos
                  localStorage.removeItem('clientesAtivos');

                  // Salvar novos dados
                  localStorage.setItem('clientesAtivos', JSON.stringify(dadosImportados));

                  // Atualizar tabela
                  preencherTabelaClientesAtivos();
                  alert("Dados importados com sucesso!");
              } else {
                  alert("Formato inválido. O arquivo deve conter um array de objetos.");
              }
          } catch (erro) {
              console.error("Erro ao importar JSON:", erro);
              alert("Erro ao importar o arquivo. Verifique se o conteúdo está correto.");
          }
      };

      reader.readAsText(file);
  } else {
      alert("Por favor, selecione um arquivo .json válido.");
  }
});

// ---------- DOM PRINCIPAL ----------
  document.getElementById("filtro-input").addEventListener("input", aplicarFiltroClientesAtivos);

  // Botões e modais
  const btnCadastrar = document.getElementById("cadastrar-btn");
  const btnEditar = document.getElementById("editar-btn");
  const btnExcluir = document.getElementById("excluir-btn");
  const btnImportar = document.getElementById("importar-btn");

  const modalCadastro = document.getElementById("form-cadastro");
  const modalEdicao = document.getElementById("form-edicao");
  const modalExclusao = document.getElementById("form-exclusao");

  const fecharCadastro = document.getElementById("fechar-cadastro");
  const fecharEdicao = document.getElementById("fechar-edicao");
  const fecharExclusao = document.getElementById("fechar-exclusao");

  // Campos do cadastro
  const imeiCadastro = document.getElementById("imei");
  const modeloCadastro = document.getElementById("modelo");
  const linhaCadastro = document.getElementById("linha");

  // Campos da edição
 const imeiEdicao = document.getElementById("imei-edicao");
  const modeloEdicao = document.getElementById("modelo-edicao");
  const linhaEdicao = document.getElementById("linha-edicao");


  // Abrir e fechar modais
  const abrirModal = (modal) => modal.classList.remove("hidden");
  const fecharModal = (modal) => modal.classList.add("hidden");

  btnCadastrar.addEventListener("click", () => abrirModal(modalCadastro));
  btnEditar.addEventListener("click", () => abrirModal(modalEdicao));
  btnExcluir.addEventListener("click", () => abrirModal(modalExclusao));
  fecharCadastro.addEventListener("click", () => fecharModal(modalCadastro));
  fecharEdicao.addEventListener("click", () => fecharModal(modalEdicao));
  fecharExclusao.addEventListener("click", () => fecharModal(modalExclusao));

  // Função para preencher os campos do modal de edição e exclusão
function preencherModalEdicaoExclusao(cliente) {
  // Preencher os campos do modal de edição
  document.getElementById("cliente-edicao").value = cliente.nome;
  document.getElementById("modelo-edicao").value = cliente.modelo;
  document.getElementById("imei-edicao").value = cliente.imei;
  document.getElementById("linha-edicao").value = cliente.linha;

  // Preencher os campos do modal de exclusão
  document.getElementById("cliente-exclusao").value = cliente.nome;
  document.getElementById("motivo-exclusao").value = ''; // Resetando o campo de motivo
  document.getElementById("data-exclusao").value = ''; // Resetando o campo de data
}
const clientesCancelados = JSON.parse(localStorage.getItem("clientesCancelados")) || [];


// 1. Recupera os dados do localStorage ou inicializa como array vazio
let estoqueNovos = JSON.parse(localStorage.getItem("estoqueNovos")) || [];
let estoqueUsados = JSON.parse(localStorage.getItem("estoqueUsados")) || [];

// 2. Função para preencher chips disponíveis
function preencherChips(selectLinha) {
  const estoqueChips = JSON.parse(localStorage.getItem('estoqueChips')) || [];
  selectLinha.innerHTML = `<option value="">Linha</option>`;

  estoqueChips
    .filter(chip => chip.status === "ATIVO")
    .forEach(chip => {
      const option = document.createElement("option");
      option.value = chip.linha;
      option.textContent = chip.linha;
      selectLinha.appendChild(option);
    });
}

// 3. Função para configurar os selects
function configurarSelects(selectImei, selectModelo, selectLinha, isEdicao = false) {
  selectImei.addEventListener("change", () => {
    const imeiSelecionado = selectImei.value;

    // Buscar o equipamento nos estoques
    const equipamentoNovo = estoqueNovos.find(eq => eq.imei === imeiSelecionado);  // Equipamento novo
    const equipamentoUsado = estoqueUsados.find(eq => eq.imei === imeiSelecionado);  // Equipamento usado

    // Se encontrou o equipamento novo
    if (equipamentoNovo) {
      selectModelo.value = equipamentoNovo.modelo;
      preencherChips(selectLinha);  // Preenche as opções de chips
      selectLinha.disabled = false;  // Habilita o select de linha
    } 
    // Se encontrou o equipamento usado
    else if (equipamentoUsado) {
      selectModelo.value = equipamentoUsado.modelo;
      selectLinha.innerHTML = `<option value="${equipamentoUsado.linha}">${equipamentoUsado.linha}</option>`;  // Preenche a linha com o valor do usado
      selectLinha.disabled = true;  // Desabilita o select de linha
    } 
    // Se não encontrou, limpa os campos
    else {
      selectModelo.value = "";
      selectLinha.innerHTML = `<option value="">Linha</option>`;
      selectLinha.disabled = true;
    }
  });
}

// 4. Evento para abrir o modal e preencher o IMEI
document.getElementById('cadastrar-btn').addEventListener('click', () => {
  preencherIMEI();  // Chama a função que preenche o IMEI
  abrirModal(modalCadastro);  // Abre o modal
configurarSelects(imeiCadastro, modeloCadastro, linhaCadastro);
configurarSelects(imeiEdicao, modeloEdicao, linhaEdicao, true);

});

function preencherIMEI() {
  const selectImei = document.getElementById('imei');
  const imeisDisponiveis = [...estoqueNovos, ...estoqueUsados];

  selectImei.innerHTML = `<option value="">IMEI</option>`;

  imeisDisponiveis.forEach(item => {
    const option = document.createElement("option");
    option.value = item.imei;
    option.textContent = item.imei;
    selectImei.appendChild(option);
  });

  linhaCadastro.innerHTML = `<option value="">Linha</option>`;
  linhaCadastro.disabled = true;
}


// Função para preencher os chips disponíveis
function preencherChips(selectLinha) {
  const estoqueChips = JSON.parse(localStorage.getItem('estoqueChips')) || [];

  selectLinha.innerHTML = `<option value="">Linha</option>`;  // Limpa o select e adiciona a opção padrão
  estoqueChips
    .filter(chip => chip.status === "ATIVO")  // Só chips com status ATIVO
    .forEach(chip => {
      const option = document.createElement("option");
      option.value = chip.linha;
      option.textContent = chip.linha;
      selectLinha.appendChild(option);
    });
}

// Função para configurar os selects com base no IMEI selecionado
function configurarSelects(selectImei, selectModelo, selectLinha, isEdicao = false) {
  // Carregar os dados de estoque sempre que a função for chamada
  const estoqueNovos = JSON.parse(localStorage.getItem('estoqueNovos')) || [];
  const estoqueUsados = JSON.parse(localStorage.getItem('estoqueUsados')) || [];

  selectImei.addEventListener("change", () => {
    const imeiSelecionado = selectImei.value;
    console.log("IMEI Selecionado:", imeiSelecionado);

    // Buscar o equipamento nos estoques
    const equipamentoNovo = estoqueNovos.find(eq => eq.imei === imeiSelecionado);  // Equipamento novo
    const equipamentoUsado = estoqueUsados.find(eq => eq.imei === imeiSelecionado);  // Equipamento usado

    // Lógica para preencher os campos baseados no tipo de equipamento
    if (equipamentoNovo) {
      selectModelo.value = equipamentoNovo.modelo;  // Preenche o modelo para equipamentos novos
      preencherChips(selectLinha);  // Preenche as opções de chips
      selectLinha.disabled = false;  // Habilita o select de linha
    } else if (equipamentoUsado) {
      selectModelo.value = equipamentoUsado.modelo;  // Preenche o modelo para equipamentos usados
      selectLinha.innerHTML = `<option value="${equipamentoUsado.linha}">${equipamentoUsado.linha}</option>`;  // Preenche a linha com o valor do usado
      selectLinha.disabled = true;  // Desabilita o select de linha
    } else {
      selectModelo.value = "";  // Se não encontrar, limpa o modelo
      selectLinha.innerHTML = `<option value="">Linha</option>`;  // Limpa a linha
      selectLinha.disabled = true;  // Desabilita o select de linha
    }
  });
}


// Função para selecionar um cliente ao clicar na tabela
function selecionarClienteParaEdicaoExclusao(event) {
  const linhaSelecionada = event.target.closest("tr"); // Encontrar a linha clicada
  if (linhaSelecionada) {
    const index = linhaSelecionada.dataset.index;
    const clientesAtivos = JSON.parse(localStorage.getItem("clientesAtivos")) || [];
    const clienteSelecionado = clientesAtivos[index];

    // Passar os dados do cliente para os modais
    preencherModalEdicaoExclusao(clienteSelecionado);
  }
}

// Adicionando o evento de clique nas linhas da tabela
document.getElementById("tbody-clientes-ativos").addEventListener("click", selecionarClienteParaEdicaoExclusao);

  // Preencher selects com dados do estoque
  preencherSelectsDeEstoque(modelo, imei, linha);
  preencherSelectsDeEstoque(modelo, imei, linha);

  // Importação de dados JSON
  btnImportar.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedData = JSON.parse(e.target.result);
            if (!Array.isArray(importedData)) {
              alert('Formato inválido. O JSON deve ser um array de objetos.');
              return;
            }

            const dadosValidos = importedData.every(cliente => {
              return cliente.nome && cliente.plano && cliente.veiculo && cliente.modelo &&
                cliente.imei && cliente.linha && cliente.serviço && cliente.data &&
                isValidDate(cliente.data);  // Função extra para validar a data
            });
            
            // Função para verificar se a data está no formato DD/MM/YYYY
            function isValidDate(dateString) {
              const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
              return regex.test(dateString);
            }
            
            localStorage.setItem('clientesAtivos', JSON.stringify(importedData));
            preencherTabelaClientesAtivos(importedData);

            alert(`${importedData.length} clientes importados com sucesso!`);
          } catch (error) {
            console.error(error);
            alert('Erro ao importar dados. Verifique o arquivo JSON.');
          }
        };

        reader.readAsText(file);
      }
    });

    input.click();
  });

// ---------- PREENCHER SELECTS DE CLIENTES ----------

function preencherSelectClientes() {
  const clientes = JSON.parse(localStorage.getItem("clientesAtivos")) || [];
  const selectEdicao = document.getElementById("cliente-edicao");
  selectEdicao.innerHTML = `<option value="">Selecione um cliente</option>`;
  
  clientes.forEach((cliente, index) => {
    const optionEdicao = document.createElement("option");
    optionEdicao.value = index;
    optionEdicao.textContent = cliente.nome;
    selectEdicao.appendChild(optionEdicao);
  });
}

function preencherSelectClientes() {
  const clientes = JSON.parse(localStorage.getItem("clientesAtivos")) || [];
  const selectExclusao = document.getElementById("cliente-exclusao");

  // Limpa opções antigas
  selectExclusao.innerHTML = '<option value="">Selecione o cliente</option>';

  clientes.forEach((cliente) => {
    const option = document.createElement("option");
    option.value = cliente.nome;
    option.textContent = cliente.nome;
    selectExclusao.appendChild(option);
  });
}

  const formExclusao = document.getElementById("form-exclusao");
  formExclusao.addEventListener("submit", function (e) {
    e.preventDefault();

    const nomeCliente = document.getElementById("cliente-exclusao").value;
    const motivo = document.getElementById("motivo-exclusao-element").value;
    const data = document.getElementById("data-exclusao").value;
  
    let clientesAtivos = JSON.parse(localStorage.getItem("clientesAtivos")) || [];
    let estoqueUsados = JSON.parse(localStorage.getItem("estoqueUsados")) || [];
    let clientesCancelados = JSON.parse(localStorage.getItem("clientesCancelados")) || [];
  
    const clienteIndex = clientesAtivos.findIndex(cliente =>
      cliente.nome.trim().toLowerCase() === nomeCliente.trim().toLowerCase()
    );
    
  
    if (clienteIndex !== -1) {
      const cliente = clientesAtivos[clienteIndex];
  
      // Adiciona o cliente à lista de cancelados
      const cancelado = {

        nome: cliente.nome,
        dataInstalacao: cliente.data,
        motivo: motivo,
        dataCancelamento: data
      };
  
      clientesCancelados.push(cancelado);
      localStorage.setItem('clientesCancelados', JSON.stringify(clientesCancelados));

      // Adiciona equipamento ao estoque de usados
      if (cliente.modelo && cliente.imei && cliente.linha) {
        estoqueUsados.push({
          modelo: cliente.modelo,
          imei: cliente.imei,
          linha: cliente.linha
        });
        localStorage.setItem("estoqueUsados", JSON.stringify(estoqueUsados));
      }
  
  // 3. Remove cliente da lista de ativos
  clientesAtivos.splice(clienteIndex, 1);
    localStorage.setItem("clientesAtivos", JSON.stringify(clientesAtivos));

   // 4. Atualiza a tabela
   atualizarTabelaClientesAtivos();

     fecharModal("form-exclusao");
    document.getElementById("form-exclusao").reset();
  } else {
    alert("Cliente não encontrado!");
  }
  });

  function atualizarTabelaClientesAtivos() {
    const tabela = document.querySelector("#tabela-clientes-ativos tbody");
    tabela.innerHTML = ""; // Limpa a tabela
  
    const clientesAtivos = JSON.parse(localStorage.getItem("clientesAtivos")) || [];
  
    clientesAtivos.forEach((cliente) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${cliente.nome}</td>
        <td>${cliente.plano}</td>
        <td>${cliente.veiculo}</td>
        <td>${cliente.modelo}</td>
        <td>${cliente.imei}</td>
        <td>${cliente.linha}</td>
        <td>${cliente.servico}</td>
        <td>${cliente.data}</td>
      `;
      tabela.appendChild(row);
    });
  }
  

// ---------- CARREGAR DADOS AO INICIAR ----------

window.addEventListener("load", () => {
  const clientesSalvos = JSON.parse(localStorage.getItem("clientesAtivos")) || [];
  preencherTabelaClientesAtivos(clientesSalvos);
  preencherSelectClientes(); // <- Preenche os selects de edição e exclusão
});
