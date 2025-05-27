function verificarAcesso() {
  const logado = localStorage.getItem("usuarioLogado") === "true";
  const tipo = localStorage.getItem("tipoUsuario");

  // Redireciona para o login se não estiver logado
  if (!logado) {
    window.location.href = "../index.html";
    return;
  }

  // Se for visualizador, desativa elementos interativos
  if (tipo === "visualizador") {
    const botoes = document.querySelectorAll("button:not(#logout)");
    botoes.forEach(btn => btn.disabled = true);

    const campos = document.querySelectorAll("input, select, textarea");
    campos.forEach(el => el.disabled = true);

    // Opcional: desativar links de navegação
    // document.querySelectorAll("a").forEach(link => link.classList.add("disabled"));
  }
}

verificarAcesso();
