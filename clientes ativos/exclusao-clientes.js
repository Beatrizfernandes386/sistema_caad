const btnExcluir = document.getElementById("excluir-btn");
const modalExclusao = document.getElementById("form-exclusao");
const fecharExclusao = document.getElementById("fechar-exclusao");

const clienteExclusao = document.getElementById("cliente-exclusao");
const motivoExclusao = document.getElementById("motivo-exclusao-element");
const dataExclusao = document.getElementById("data-exclusao");

// Abrir e fechar modal
btnExcluir.addEventListener("click", () => {
  preencherSelectClientesExclusao();
  abrirModal(modalExclusao);
});
fecharExclusao.addEventListener("click", () => modalExclusao.classList.add("hidden"));

// Função de abrir modal
function abrirModal(modal) {
  modal.classList.remove("hidden");
}

// Preenche o select de clientes ativos
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

// Função de exclusão com pop-up customizado
document.getElementById("form-exclusao-element").addEventListener("submit", function (e) {
  e.preventDefault();

  const nomeCliente = clienteExclusao.value;
  const motivo = motivoExclusao.value;
  const data = dataExclusao.value;

  if (!nomeCliente || !motivo || !data) {
    mostrarPopup("Por favor, preencha todos os campos para excluir o cliente.", false);
    return;
  }

  // Primeiro popup de confirmação
  mostrarPopup("Tem certeza que deseja excluir o cliente?", true, () => {
    let clientesAtivos = JSON.parse(localStorage.getItem("clientesAtivos")) || [];
    let estoqueUsados = JSON.parse(localStorage.getItem("estoqueUsados")) || [];
    let clientesCancelados = JSON.parse(localStorage.getItem("clientesCancelados")) || [];

    const clienteIndex = clientesAtivos.findIndex(cliente =>
      cliente.nome.trim().toLowerCase() === nomeCliente.trim().toLowerCase()
    );

    if (clienteIndex !== -1) {
      const cliente = clientesAtivos[clienteIndex];

      // Adiciona o cliente cancelado
      const cancelado = {
        nome: cliente.nome,
        dataInstalacao: cliente.data,
        motivo: motivo,
        dataCancelamento: data,
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

      // Remove o cliente da lista de ativos
      clientesAtivos.splice(clienteIndex, 1);
      localStorage.setItem("clientesAtivos", JSON.stringify(clientesAtivos));

      // Atualiza a tabela
      const atualizarTabela = window.atualizarTabelaClientesAtivos || window.preencherTabelaClientesAtivos;
      if (atualizarTabela) atualizarTabela(clientesAtivos);

      modalExclusao.classList.add("hidden");
      document.getElementById("form-exclusao-element").reset();

      // Segundo popup de sucesso
      mostrarPopup("Cliente excluído com sucesso.", false);
    } else {
      mostrarPopup("Cliente não encontrado!", false);
    }
  });
});

// Função popup customizado
function mostrarPopup(mensagem, mostrarBotoes, callbackConfirmar) {
  const popupOverlay = document.getElementById("popup-confirmacao");
  const popupMensagem = document.getElementById("popup-mensagem");
  const btnSim = document.getElementById("popup-sim");
  const btnCancelar = document.getElementById("popup-cancelar");

  popupMensagem.textContent = mensagem;
  popupOverlay.style.display = "flex";

  if (mostrarBotoes) {
    btnSim.style.display = "inline-block";
    btnCancelar.style.display = "inline-block";

    // Remove listeners anteriores
    btnSim.onclick = null;
    btnCancelar.onclick = null;

    btnSim.onclick = () => {
      popupOverlay.style.display = "none";
      if (callbackConfirmar) callbackConfirmar();
    };
    btnCancelar.onclick = () => {
      popupOverlay.style.display = "none";
    };
  } else {
    btnSim.style.display = "none";
    btnCancelar.textContent = "OK";
    btnCancelar.style.display = "inline-block";

    btnCancelar.onclick = () => {
      popupOverlay.style.display = "none";
      // Restaura texto do botão para próximo uso
      btnCancelar.textContent = "Cancelar";
    };
  }
}

