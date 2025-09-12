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
async function preencherIMEICadastro() {
  try {
    imeiCadastro.innerHTML = `<option value="">IMEI</option>`;
    linhaCadastro.innerHTML = `<option value="">Linha</option>`;
    linhaCadastro.disabled = true;

    modeloCadastro.innerHTML = `<option value="">Modelo</option>`;

    // Buscar equipamentos disponíveis da API
    const [newResponse, usedResponse] = await Promise.all([
      apiRequest('http://192.168.0.18:8282/api/inventory/new'),
      apiRequest('http://192.168.0.18:8282/api/inventory/used')
    ]);

    if (!newResponse.ok || !usedResponse.ok) {
      console.error('Erro ao carregar equipamentos');
      return;
    }

    const estoqueNovos = await newResponse.json();
    const estoqueUsados = await usedResponse.json();

    const modelosDisponiveis = new Set();
    [...estoqueNovos, ...estoqueUsados].forEach(item => modelosDisponiveis.add(item.model));

    modelosDisponiveis.forEach(modelo => {
      const option = document.createElement("option");
      option.value = modelo;
      option.textContent = modelo;
      modeloCadastro.appendChild(option);
    });

    modeloCadastro.addEventListener("change", () => {
      const modeloSelecionado = modeloCadastro.value;
      const equipamentosDisponiveis = [
        ...estoqueNovos.filter(eq => eq.model === modeloSelecionado),
        ...estoqueUsados.filter(eq => eq.model === modeloSelecionado)
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
          modeloCadastro.value = equipamentoSelecionado.model;

          if (estoqueNovos.some(eq => eq.imei === imeiSelecionado)) {
            preencherChipsDisponiveis();
            linhaCadastro.disabled = false;
          } else {
            linhaCadastro.innerHTML = `<option value="${equipamentoSelecionado.line}">${equipamentoSelecionado.line}</option>`;
            linhaCadastro.disabled = true;
          }
        }
      });
    });
  } catch (error) {
    console.error('Erro ao preencher IMEI:', error);
  }
}

// Chips disponíveis (ativos)
async function preencherChipsDisponiveis() {
  try {
    const response = await apiRequest('http://192.168.0.18:8282/api/inventory/available-sim-cards');
    if (!response.ok) {
      console.error('Erro ao carregar chips disponíveis');
      return;
    }

    const chipsAtivos = await response.json();

    linhaCadastro.innerHTML = `<option value="">Linha</option>`;

    if (chipsAtivos.length > 0) {
      chipsAtivos.forEach(chip => {
        const option = document.createElement("option");
        option.value = chip.line;
        option.textContent = chip.line;
        linhaCadastro.appendChild(option);
      });
    } else {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "Nenhum chip disponível";
      linhaCadastro.appendChild(option);
    }
  } catch (error) {
    console.error('Erro ao preencher chips:', error);
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

  async function cadastrarCliente() {
    try {
      const novoCliente = {
        name: nome,
        plan: plano,
        vehicle: veiculo,
        model: modelo,
        imei: imei,
        line: linha,
        service: servico,
        date: dataInput,
      };

      // Enviar para API
      const response = await apiRequest('http://192.168.0.18:8282/api/clients', {
        method: 'POST',
        body: JSON.stringify(novoCliente)
      });

      if (response.ok) {
        const result = await response.json();
        alert('Cliente cadastrado com sucesso!');

        // Recarregar tabela
        if (window.carregarClientesAtivos) {
          window.carregarClientesAtivos();
        }

        modalCadastro.classList.add("hidden");
        document.getElementById("form-cadastro-element").reset();
        linhaCadastro.disabled = false;
      } else {
        const error = await response.json();
        alert(error.message || 'Erro ao cadastrar cliente');
      }
    } catch (error) {
      console.error('Erro ao cadastrar cliente:', error);
      alert('Erro ao cadastrar cliente');
    }
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
