/**
 * iGaming Ledger - Core Core Engine (Malta Compliance Standard)
 * Gerenciamento de Jogadores, KYC Global e Sessão
 */

// Executa automaticamente ao carregar qualquer página para sincronizar dados
document.addEventListener("DOMContentLoaded", () => {
    inicializarSistemaSimulado();
    atualizarCamposInterface();
});

/**
 * Inicializa dados básicos caso o navegador ainda não tenha registros
 */
function inicializarSistemaSimulado() {
    if (!localStorage.getItem("igaming_balance")) {
        localStorage.setItem("igaming_balance", "0.00"); // Começa zerado até o KYC
    }
}

/**
 * Processa o Formulário de Cadastro Internacional (KYC) da página cadastro.html
 */
function processarCadastro(event) {
    event.preventDefault();

    // Captura os dados informados pelo jogador
    const fullName = document.getElementById('fullName').value.trim();
    const dob = document.getElementById('dob').value;
    const country = document.getElementById('country').value;
    const docType = document.getElementById('docType').value;
    const docNumber = document.getElementById('docNumber').value.trim();

    // 1. Regra de Compliance MGA: Validação básica de maioridade (18 anos)
    const dataNascimento = new Date(dob);
    const hoje = new Date();
    let idade = hoje.getFullYear() - dataNascimento.getFullYear();
    const mes = hoje.getMonth() - dataNascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < dataNascimento.getDate())) {
        idade--;
    }

    if (idade < 18) {
        alert("❌ REGISTRATION DENIED: Under MGA regulations, players must be at least 18 years old.");
        return;
    }

    // 2. Simulação de Criação de Chave Criptográfica única para o Ledger
    const playerId = "PL-" + Math.floor(100000 + Math.random() * 900000);
    const ledgerHash = "0x" + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');

    // 3. Salva a sessão do jogador no localStorage do navegador
    const dadosJogador = {
        id: playerId,
        nome: fullName,
        pais: country,
        documentoTipo: docType,
        documentoNum: docNumber,
        hashSeguranca: ledgerHash,
        statusKYC: "APPROVED"
    };

    localStorage.setItem("current_player", JSON.stringify(dadosJogador));
    
    // Concede um bônus inicial de boas-vindas regulamentado (€ 50.00) após KYC aprovado
    localStorage.setItem("igaming_balance", "50.00");

    // Alerta de sucesso internacional
    alert(`✅ KYC STATUS: APPROVED\n\nWelcome ${fullName}!\nYour account has been verified under Malta Standards.\nPlayer ID: ${playerId}\nLedger Node Hash: ${ledgerHash.substring(0, 15)}...`);

    // Redireciona o usuário para o portal principal atualizado
    window.location.href = "index.html";
}

/**
 * Atualiza dinamicamente os valores de saldo e nome nas páginas internas
 */
function atualizarCamposInterface() {
    const jogadorSessao = localStorage.getItem("current_player");
    const saldoAtual = localStorage.getItem("igaming_balance") || "0.00";

    // Se estiver na página da Carteira (wallet.html), atualiza o saldo na tela
    const elementoSaldo = document.querySelector(".balance-amount");
    if (elementoSaldo) {
        elementoSaldo.innerHTML = `<span class="currency">€</span> ${parseFloat(saldoAtual).toFixed(2)}`;
    }

    // Se houver jogador logado, altera dinamicamente o botão de registro para o nome dele no index.html
    const botaoRegistro = document.querySelector(".btn-register-main");
    if (botaoRegistro && jogadorSessao) {
        const jogador = JSON.parse(jogadorSessao);
        botaoRegistro.innerHTML = `👤 Player: ${jogador.nome} (ID: ${jogador.id})`;
        botaoRegistro.style.background = "linear-gradient(90deg, #10b981 0%, #059669 100%)"; // Muda para verde ativo
        botaoRegistro.style.borderColor = "rgba(16, 185, 129, 0.4)";
        botaoRegistro.href = "#"; // Desativa o clique de ir para o cadastro novamente
        botaoRegistro.onclick = (e) => {
            e.preventDefault();
            alert(`ℹ️ PLAYER PROFILE\n\nName: ${jogador.nome}\nRegion: ${jogador.pais}\nLedger Security Hash:\n${jogador.hashSeguranca}`);
        };
    }
}

/**
 * Funções Financeiras Dinâmicas para a página wallet.html
 */
function executarDeposito() {
    const jogadorSessao = localStorage.getItem("current_player");
    if (!jogadorSessao) {
        alert("❌ TRANSACTION REFUSED: You must complete your KYC Registration first!");
        window.location.href = "cadastro.html";
        return;
    }

    const valorStr = prompt("Enter deposit amount in Euros (€):", "100.00");
    const valor = parseFloat(valorStr);

    if (isNaN(valor) || valor <= 0) {
        alert("❌ Invalid Amount.");
        return;
    }

    let saldoAtual = parseFloat(localStorage.getItem("igaming_balance") || "0.00");
    saldoAtual += valor;
    localStorage.setItem("igaming_balance", saldoAtual.toString());

    // Adiciona no histórico dinamicamente se a tabela existir
    adicionarTransacaoHistorico("Deposit Approved (Gateway)", valor, true);
    atualizarCamposInterface();
    alert(`👍 Success! € ${valor.toFixed(2)} added to your Ledger Wallet.`);
}

function executarSaque() {
    const jogadorSessao = localStorage.getItem("current_player");
    if (!jogadorSessao) {
        alert("❌ TRANSACTION REFUSED: Account verification required.");
        return;
    }

    let saldoAtual = parseFloat(localStorage.getItem("igaming_balance") || "0.00");
    const valorStr = prompt(`Enter withdrawal amount (Max: € ${saldoAtual.toFixed(2)}):`, "50.00");
    const valor = parseFloat(valorStr);

    if (isNaN(valor) || valor <= 0) {
        alert("❌ Invalid Amount.");
        return;
    }

    if (valor > saldoAtual) {
        alert("❌ INSUFFICIENT FUNDS: Withdrawal amount higher than current Ledger balance.");
        return;
    }

    saldoAtual -= valor;
    localStorage.setItem("igaming_balance", saldoAtual.toString());

    adicionarTransacaoHistorico("Withdrawal Requested", valor, false);
    atualizarCamposInterface();
    alert(`💸 Withdrawal requested! The funds are being routed to your bank account after MGA clearance.`);
}

/**
 * Auxiliar para criar linhas na tabela de extrato da Carteira
 */
function adicionarTransacaoHistorico(tipo, valor, IsPositivo) {
    const secaoHistorico = document.querySelector(".history-section");
    if (!secaoHistorico) return;

    const novoItem = document.createElement("div");
    novoItem.className = "tx-item";
    
    const dataHoje = new Date();
    const horaFormatada = dataHoje.getHours().toString().padStart(2, '0') + ":" + dataHoje.getMinutes().toString().padStart(2, '0');

    novoItem.innerHTML = `
        <div>
            <div class="tx-type">${tipo}</div>
            <div class="tx-date">Today, ${horaFormatada}</div>
        </div>
        <div class="${IsPositivo ? 'tx-value-pos' : ''}" style="${!IsPositivo ? 'color: #ef4444; font-weight: 600;' : ''}">
            ${IsPositivo ? '+' : '-'} € ${valor.toFixed(2)}
        </div>
    `;

    // Insere logo abaixo do título da seção
    const titulo = secaoHistorico.querySelector(".section-title");
    titulo.parentNode.insertBefore(novoItem, titulo.nextSibling);
}
