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
async function preencherSelectClientesExclusao() {
  try {
    const response = await apiRequest('${API_CONFIG.API_URL}/api/clients/active');
    if (!response.ok) {
      console.error('Erro ao carregar clientes para exclusão');
      return;
    }

    const clientes = await response.json();
    clienteExclusao.innerHTML = `<option value="">Selecione o cliente</option>`;
    clientes.forEach(cliente => {
      const option = document.createElement("option");
      option.value = cliente.id;
      option.textContent = cliente.name;
      clienteExclusao.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao preencher select de exclusão:', error);
  }
}

// Evento de submit do formulário de exclusão
document.getElementById("form-exclusao-element").addEventListener("submit", function (e) {
  e.preventDefault();

  const clientId = clienteExclusao.value;
  const motivo = motivoExclusao.value;
  const data = dataExclusao.value;

  if (!clientId || !motivo || !data) {
    mostrarPopup("Por favor, preencha todos os campos para excluir o cliente.", false);
    return;
  }

  // Obter nome do cliente selecionado
  const selectedOption = clienteExclusao.options[clienteExclusao.selectedIndex];
  const clientName = selectedOption ? selectedOption.text : "cliente";

  // Mostrar popup de confirmação
  mostrarPopup(`Tem certeza que deseja excluir o cliente "${clientName}"?`, true, confirmarExclusao);
});

// Função para confirmar exclusão
async function confirmarExclusao() {
  const clientId = clienteExclusao.value;
  const motivo = motivoExclusao.value;
  const data = dataExclusao.value;

  if (!clientId || !motivo || !data) {
    mostrarPopup("Por favor, preencha todos os campos para excluir o cliente.", false);
    return;
  }

  try {
    const response = await apiRequest(`${API_CONFIG.API_URL}/api/clients/${clientId}`, {
      method: 'DELETE',
      body: JSON.stringify({
        reason: motivo,
        cancelDate: data
      })
    });

    if (response.ok) {
      modalExclusao.classList.add("hidden");
      document.getElementById("form-exclusao-element").reset();

      // Recarregar tabela
      if (window.carregarClientesAtivos) {
        window.carregarClientesAtivos();
      }

      mostrarPopup("Cliente excluído com sucesso.", false);
    } else {
      const error = await response.json();
      mostrarPopup(error.message || "Erro ao excluir cliente!", false);
    }
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    mostrarPopup("Erro ao excluir cliente!", false);
  }
}

// // Registrar log de exclusão
//     const logs = JSON.parse(localStorage.getItem("logsSistema")) || [];
//     const usuarioLogado = localStorage.getItem("usuarioLogado") || "desconhecido";

//     const log = {
//       dataHora: new Date().toLocaleString(),
//       acao: "Exclusão de cliente",
//       detalhes: `Cliente ${cliente.nome} excluído. IMEI: ${cliente.imei}, linha: ${cliente.linha}, motivo: ${motivo}`,
//       usuario: usuarioLogado
//     };

//     logs.push(log);
//     localStorage.setItem("logsSistema", JSON.stringify(logs));

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
      if (window.carregarClientesAtivos) {
        window.carregarClientesAtivos();
      }
    };
  }

  function limparEventos() {
    btnSim.onclick = null;
    btnCancelar.onclick = null;
  }
}
