// Simulação de Estado do Sistema de iGaming (Malta Compliance)
const gameState = {
    playerName: "Fabio Web Developer",
    balance: 250.00,
    bonus: 50.00,
    kycStatus: "Verified", // Opções: Pending, Verified, Rejected
    vipLevel: "VIP Bronze",
    serverOnline: true
};

// Executa automaticamente ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
    updateUI();
});

// Função para renderizar os dados na tela se os elementos existirem
function updateUI() {
    if (document.getElementById("player-name")) {
        document.getElementById("player-name").innerText = gameState.playerName;
    }
    if (document.getElementById("wallet-balance")) {
        document.getElementById("wallet-balance").innerText = `€${gameState.balance.toFixed(2)}`;
    }
    if (document.getElementById("bonus-balance")) {
        document.getElementById("bonus-balance").innerText = `€${gameState.bonus.toFixed(2)}`;
    }
    if (document.getElementById("kyc-status")) {
        const kycEl = document.getElementById("kyc-status");
        kycEl.innerText = gameState.kycStatus;
        kycEl.style.color = gameState.kycStatus === "Verified" ? "#4ecca3" : "#ff4a4a";
    }
    if (document.getElementById("kyc-status-text")) {
        document.getElementById("kyc-status-text").innerText = gameState.kycStatus;
        document.getElementById("kyc-status-text").style.color = "#4ecca3";
    }
    if (document.getElementById("vip-level")) {
        document.getElementById("vip-level").innerText = gameState.vipLevel;
    }
}

// Função para simular o depósito de €100 (Disparada pelo botão da Wallet)
function depositMoney() {
    gameState.balance += 100.00;
    // Bônus de depósito de 10% típico de operadoras de Malta
    gameState.bonus += 10.00; 
    
    updateUI();
    alert("Depósito de €100.00 processado com sucesso via Ledger Secundário (Malta MGA Gateway)!");
}


   
