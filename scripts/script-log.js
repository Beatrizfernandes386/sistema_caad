document.addEventListener("DOMContentLoaded", async function () {
  const tabelaLogs = document.querySelector("#tabela-logs tbody");

  try {
    const response = await apiRequest(`${API_CONFIG.API_URL}/api/logs?limit=100`);
    if (!response.ok) {
      console.error('Erro ao carregar logs');
      tabelaLogs.innerHTML = `<tr><td colspan="4">Erro ao carregar logs.</td></tr>`;
      return;
    }

    const logs = await response.json();

    if (logs.length === 0) {
      tabelaLogs.innerHTML = `<tr><td colspan="4">Nenhum log encontrado.</td></tr>`;
      return;
    }

    logs.forEach(log => {
      const tr = document.createElement("tr");
      const dataFormatada = new Date(log.timestamp).toLocaleString('pt-BR');
      tr.innerHTML = `
        <td>${log.action || '-'}</td>
        <td>${dataFormatada}</td>
        <td>${log.details || '-'}</td>
        <td>${log.user_email || '-'}</td>
      `;
      tabelaLogs.appendChild(tr);
    });
  } catch (error) {
    console.error('Erro ao carregar logs:', error);
    tabelaLogs.innerHTML = `<tr><td colspan="4">Erro ao carregar logs.</td></tr>`;
  }
});
