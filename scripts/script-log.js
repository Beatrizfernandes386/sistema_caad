document.addEventListener("DOMContentLoaded", function () {
  const tabelaLogs = document.querySelector("#tabela-logs tbody");
  const logs = JSON.parse(localStorage.getItem("logsSistema")) || [];

  if (logs.length === 0) {
    tabelaLogs.innerHTML = `<tr><td colspan="4">Nenhum log encontrado.</td></tr>`;
    return;
  }

  logs.forEach(log => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${log.acao || '-'}</td>
       <td>${log.dataHora}</td>
      <td>${log.detalhes || '-'} (${log.tipo || "-"})</td>
      <td>${log.usuario || '-'}</td>
    `;
    tabelaLogs.appendChild(tr);
  });
});
