const btnExcluir = document.getElementById("excluir-btn");
const modalExclusao = document.getElementById("form-exclusao");
const fecharExclusao = document.getElementById("fechar-exclusao");

const clienteExclusao = document.getElementById("cliente-exclusao");
const motivoExclusao = document.getElementById("motivo-exclusao-element");
const dataExclusao = document.getElementById("data-exclusao");

// Abrir e fechar modal de exclusão
btnExcluir.addEventListener("click", () => {
  preencherSelectClientesExclusao();
  abrirModal(modalExclusao);
});
fecharExclusao.addEventListener("click", () => modalExclusao.classList.add("hidden"));

function abrirModal(modal) {
  modal.classList.remove("hidden");
}

// Preencher select com clientes ativos
function preencherSelectClientesExclusao() {
  const clientes = JSON.parse(localStorage.getItem("clientesAtivos")) || [];
  clienteExclusao.innerHTML = `<option value="">Selecione o cliente</option>`;
  clientes.forEach(cliente => {
    const option = document.createElement("option");
    option.value = cliente.nome;
    option.textContent = cliente.nome;
    clienteExclusao.appendChild(option);
  });
}

// Evento de submit do formulário de exclusão
document.getElementById("form-exclusao-element").addEventListener("submit", function (e) {
  e.preventDefault();

  const nomeCliente = clienteExclusao.value;
  const motivo = motivoExclusao.value;
  const data = dataExclusao.value;

  if (!nomeCliente || !motivo || !data) {
    mostrarPopup("Por favor, preencha todos os campos para excluir o cliente.", false);
    return;
  }

  // Mostrar popup de confirmação
  mostrarPopup(`Tem certeza que deseja excluir o cliente "${nomeCliente}"?`, true, confirmarExclusao);
});

// Função para confirmar exclusão
function confirmarExclusao() {
  let clientesAtivos = JSON.parse(localStorage.getItem("clientesAtivos")) || [];
  let estoqueUsados = JSON.parse(localStorage.getItem("estoqueUsados")) || [];
  let clientesCancelados = JSON.parse(localStorage.getItem("clientesCancelados")) || [];

  const nomeCliente = clienteExclusao.value;
  const motivo = motivoExclusao.value;
  const data = dataExclusao.value;

  const clienteIndex = clientesAtivos.findIndex(cliente =>
    cliente.nome.trim().toLowerCase() === nomeCliente.trim().toLowerCase()
  );

  if (clienteIndex !== -1) {
    const cliente = clientesAtivos[clienteIndex];

    // Enviar cliente para a lista de cancelados
    clientesCancelados.push({
      nome: cliente.nome,
      dataInstalacao: cliente.data,
      motivo: motivo,
      dataCancelamento: data,
    });
    localStorage.setItem('clientesCancelados', JSON.stringify(clientesCancelados));

    // Retornar equipamento ao estoque de usados
    if (cliente.modelo && cliente.imei && cliente.linha) {
      estoqueUsados.push({
        modelo: cliente.modelo,
        imei: cliente.imei,
        linha: cliente.linha
      });
      localStorage.setItem("estoqueUsados", JSON.stringify(estoqueUsados));
    }

    // Remover da lista de ativos
    clientesAtivos.splice(clienteIndex, 1);
    localStorage.setItem("clientesAtivos", JSON.stringify(clientesAtivos));

    // Atualizar tabela
    const atualizarTabela = window.atualizarTabelaClientesAtivos || window.preencherTabelaClientesAtivos;
    if (atualizarTabela) atualizarTabela(clientesAtivos);

    modalExclusao.classList.add("hidden");
    document.getElementById("form-exclusao-element").reset();

    mostrarPopup("Cliente excluído com sucesso.", false);
  } else {
    mostrarPopup("Cliente não encontrado!", false);
  }
}

// Registrar log de exclusão
    const logs = JSON.parse(localStorage.getItem("logsSistema")) || [];
    const usuarioLogado = localStorage.getItem("usuarioLogado") || "desconhecido";

    const log = {
      dataHora: new Date().toLocaleString(),
      acao: "Exclusão de cliente",
      detalhes: `Cliente ${cliente.nome} excluído. IMEI: ${cliente.imei}, linha: ${cliente.linha}, motivo: ${motivo}`,
      usuario: usuarioLogado
    };

    logs.push(log);
    localStorage.setItem("logsSistema", JSON.stringify(logs));

// Função genérica do pop-up
function mostrarPopup(mensagem, mostrarBotoes, callbackConfirmar) {
  const popupOverlay = document.getElementById("popup-confirmacao");
  const popupMensagem = document.getElementById("popup-mensagem");
  const btnSim = document.getElementById("popup-sim");
  const btnCancelar = document.getElementById("popup-cancelar");

  // Exibe a mensagem e mostra o pop-up
  popupMensagem.textContent = mensagem;
  popupOverlay.style.display = "flex";

  // Remove eventos anteriores
  limparEventos();

  if (mostrarBotoes) {
    btnSim.style.display = "inline-block";
    btnCancelar.textContent = "Cancelar";

    btnSim.onclick = () => {
      popupOverlay.style.display = "none";
      limparEventos();
      if (typeof callbackConfirmar === "function") {
        callbackConfirmar();
      }
    };

    btnCancelar.onclick = () => {
      popupOverlay.style.display = "none";
      limparEventos();
    };
  } else {
    btnSim.style.display = "none";
    btnCancelar.textContent = "OK";

    btnCancelar.onclick = () => {
      popupOverlay.style.display = "none";
      limparEventos();

      // ✅ Garante atualização da tabela
      const clientesAtivos = JSON.parse(localStorage.getItem("clientesAtivos")) || [];
      const atualizarTabela = window.atualizarTabelaClientesAtivos || window.preencherTabelaClientesAtivos;
      if (typeof atualizarTabela === "function") {
        atualizarTabela(clientesAtivos);
      }
    };
  }

  function limparEventos() {
    btnSim.onclick = null;
    btnCancelar.onclick = null;
  }
}
