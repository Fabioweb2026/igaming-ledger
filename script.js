// Substitua a antiga função 'processarCadastro' no seu script.js por esta que consome a API:
function processarCadastro(event) {
    event.preventDefault();

    const payload = {
        fullName: document.getElementById('fullName').value.trim(),
        dob: document.getElementById('dob').value,
        country: document.getElementById('country').value,
        docType: document.getElementById('docType').value,
        docNumber: document.getElementById('docNumber').value.trim()
    };

    // Envia os dados coletados de KYC diretamente para o servidor backend central
    fetch('http://localhost:3000/api/register', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) throw new Error("Erro na verificação de conformidade de KYC.");
        return response.json();
    })
    .then(data => {
        // Salva a sessão ativa local baseado no retorno validado pelo banco de dados
        localStorage.setItem("current_player", JSON.stringify(data.player));
        localStorage.setItem("igaming_balance", data.player.balance.toString());

        alert(`✅ BANCO DE DADOS SYNCED:\nJogador registrado centralizadamente!\nID: ${data.player.id}`);
        window.location.href = "index.html";
    })
    .catch(error => {
        alert("❌ FALHA NO REGISTRO: " + error.message);
    });
}
