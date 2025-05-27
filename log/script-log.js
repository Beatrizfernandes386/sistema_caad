window.addEventListener("DOMContentLoaded", () => {
  const tabela = document.querySelector("#tabela-logs tbody");
  const logs = JSON.parse(localStorage.getItem("logsSistema")) || [];

  logs.reverse().forEach(log => {
    const tr = document.createElement("tr");

    const data = new Date(log.timestamp);
    const dataFormatada = data.toLocaleDateString();
    const horaFormatada = data.toLocaleTimeString();

    tr.innerHTML = `
      <td>${dataFormatada}</td>
      <td>${horaFormatada}</td>
      <td>${log.acao}</td>
    `;
    tabela.appendChild(tr);
  });
});
