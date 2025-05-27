const btnCadastrar = document.getElementById("cadastrar-btn");
const modalCadastro = document.getElementById("form-cadastro");
const fecharCadastro = document.getElementById("fechar-cadastro");

const imeiCadastro = document.getElementById("imei");
const modeloCadastro = document.getElementById("modelo");
const linhaCadastro = document.getElementById("linha");

// Abrir e fechar modal
btnCadastrar.addEventListener("click", () => {
  preencherIMEICadastro();
  abrirModal(modalCadastro);
});
fecharCadastro.addEventListener("click", () => modalCadastro.classList.add("hidden"));

// Função de abrir modal
function abrirModal(modal) {
  modal.classList.remove("hidden");
}

// Preencher o select de IMEI com base no modelo
function preencherIMEICadastro() {
  const estoqueNovos = JSON.parse(localStorage.getItem("estoqueNovos")) || [];
  const estoqueUsados = JSON.parse(localStorage.getItem("estoqueUsados")) || [];

  imeiCadastro.innerHTML = `<option value="">IMEI</option>`;
  linhaCadastro.innerHTML = `<option value="">Linha</option>`;
  linhaCadastro.disabled = true;

  modeloCadastro.innerHTML = `<option value="">Modelo</option>`;
  const modelosDisponiveis = new Set();
  [...estoqueNovos, ...estoqueUsados].forEach(item => modelosDisponiveis.add(item.modelo));

  modelosDisponiveis.forEach(modelo => {
    const option = document.createElement("option");
    option.value = modelo;
    option.textContent = modelo;
    modeloCadastro.appendChild(option);
  });

  modeloCadastro.addEventListener("change", () => {
    const modeloSelecionado = modeloCadastro.value;
    const equipamentosDisponiveis = [
      ...estoqueNovos.filter(eq => eq.modelo === modeloSelecionado),
      ...estoqueUsados.filter(eq => eq.modelo === modeloSelecionado)
    ];

    imeiCadastro.innerHTML = `<option value="">IMEI</option>`;
    equipamentosDisponiveis.forEach(item => {
      const option = document.createElement("option");
      option.value = item.imei;
      option.textContent = item.imei;
      imeiCadastro.appendChild(option);
    });

    imeiCadastro.addEventListener("change", () => {
      const imeiSelecionado = imeiCadastro.value;
      const equipamentoSelecionado = equipamentosDisponiveis.find(eq => eq.imei === imeiSelecionado);

      if (equipamentoSelecionado) {
        modeloCadastro.value = equipamentoSelecionado.modelo;

        if (estoqueNovos.some(eq => eq.imei === imeiSelecionado)) {
          preencherChipsDisponiveis();
          linhaCadastro.disabled = false;
        } else {
          linhaCadastro.innerHTML = `<option value="${equipamentoSelecionado.linha}">${equipamentoSelecionado.linha}</option>`;
          linhaCadastro.disabled = true;
        }
      }
    });
  });
}

// Chips disponíveis (ativos)
function preencherChipsDisponiveis() {
  const chips = JSON.parse(localStorage.getItem("estoqueChips")) || [];
  const chipsAtivos = chips.filter(chip => chip.status === "ATIVO");

  linhaCadastro.innerHTML = `<option value="">Linha</option>`;

  if (chipsAtivos.length > 0) {
    chipsAtivos.forEach(chip => {
      const option = document.createElement("option");
      option.value = chip.linha;
      option.textContent = chip.linha;
      linhaCadastro.appendChild(option);
    });
  } else {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Nenhum chip disponível";
    linhaCadastro.appendChild(option);
  }
}

// Cadastro
document.getElementById("form-cadastro-element").addEventListener("submit", function (event) {
  event.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const plano = document.getElementById("plano").value.trim();
  const veiculo = document.getElementById("veiculo").value.trim();
  const modelo = modeloCadastro.value.trim();
  const imei = imeiCadastro.value.trim();
  const linha = linhaCadastro.value.trim();
  const servico = document.getElementById("servico").value.trim();
  const dataInput = document.getElementById("data").value;

  if (!nome || !plano || !veiculo || !modelo || !imei || !linha || !servico || !dataInput) {
    alert("Preencha todos os campos!");
    return;
  }

  mostrarPopup("Tem certeza que deseja cadastrar o cliente?",
    () => { cadastrarCliente(); },
    () => { console.log("Cadastro cancelado."); }
  );

  function cadastrarCliente() {
    const [ano, mes, dia] = dataInput.split("-");
    const dataFormatada = `${dia}/${mes}/${ano}`;

    const novoCliente = {
      nome,
      plano,
      veiculo,
      modelo,
      imei,
      linha,
      servico,
      data: dataFormatada,
    };

    const clientesAtivos = JSON.parse(localStorage.getItem("clientesAtivos")) || [];
    clientesAtivos.push(novoCliente);
    localStorage.setItem("clientesAtivos", JSON.stringify(clientesAtivos));

    let estoqueNovos = JSON.parse(localStorage.getItem("estoqueNovos")) || [];
    let estoqueUsados = JSON.parse(localStorage.getItem("estoqueUsados")) || [];

    if (estoqueNovos.some(eq => eq.imei === imei)) {
      estoqueNovos = estoqueNovos.filter(eq => eq.imei !== imei);
      localStorage.setItem("estoqueNovos", JSON.stringify(estoqueNovos));

      let chips = JSON.parse(localStorage.getItem("estoqueChips")) || [];
      chips = chips.filter(chip => chip.linha !== linha);
      localStorage.setItem("estoqueChips", JSON.stringify(chips));
    } else {
      estoqueUsados = estoqueUsados.filter(eq => eq.imei !== imei);
      localStorage.setItem("estoqueUsados", JSON.stringify(estoqueUsados));
    }

    // Salvar log da ação de cadastro
    const logs = JSON.parse(localStorage.getItem("logsSistema")) || [];
    const usuarioLogado = localStorage.getItem("usuarioLogado") || "desconhecido";

    const log = {
      dataHora: new Date().toLocaleString(),
      acao: "Cadastro de cliente",
      detalhes: `Cliente ${nome} cadastrado no plano ${plano}, IMEI: ${imei}, linha: ${linha}`,
      usuario: usuarioLogado
    };

    logs.push(log);
    localStorage.setItem("logsSistema", JSON.stringify(logs));

    const atualizarTabela = window.atualizarTabelaClientesAtivos || window.preencherTabelaClientesAtivos;
    if (atualizarTabela) atualizarTabela(clientesAtivos);

    modalCadastro.classList.add("hidden");
    document.getElementById("form-cadastro-element").reset();
    linhaCadastro.disabled = false;
  }

  function mostrarPopup(mensagem, callbackSim, callbackCancelar) {
    const popup = document.getElementById('popup-confirmacao');
    const mensagemEl = document.getElementById('popup-mensagem');
    const btnSim = document.getElementById('popup-sim');
    const btnCancelar = document.getElementById('popup-cancelar');

    mensagemEl.textContent = mensagem;
    popup.style.display = 'flex';

    btnSim.onclick = () => {
      popup.style.display = 'none';
      if (callbackSim) callbackSim();
    };
    btnCancelar.onclick = () => {
      popup.style.display = 'none';
      if (callbackCancelar) callbackCancelar();
    };
  }

});
