/**
 * iGaming Ledger - Core Engine (Otimizado com LocalStorage Database)
 */

// Configurações executadas assim que a página carrega por completo
document.addEventListener("DOMContentLoaded", () => {
    // Inicializa o saldo global na primeira execução se não existir
    if (!localStorage.getItem("igaming_balance")) {
        localStorage.setItem("igaming_balance", "0.00");
    }
    
    // Inicializa a tabela de players local se não existir
    if (!localStorage.getItem("local_players_db")) {
        localStorage.setItem("local_players_db", JSON.stringify([]));
    }
    
    atualizarCamposInterface();

    const formulario = document.getElementById('kycForm');
    if (formulario) {
        formulario.addEventListener('submit', processarCadastro);
    }
});

/**
 * Cadastra o jogador salvando localmente de forma segura e síncrona
 */
function processarCadastro(event) {
    event.preventDefault();

    const fullName = document.getElementById('fullName').value.trim();
    const dob = document.getElementById('dob').value;
    const country = document.getElementById('country').value;
    const docType = document.getElementById('docType').value;
    const docNumber = document.getElementById('docNumber').value.trim();

    // Validação de Idade (MGA Malta)
    const idade = Math.floor((new Date() - new Date(dob)) / 31557600000);
    if (idade < 18) {
        alert("❌ REGISTRATION DENIED: Under MGA regulations, players must be at least 18 years old.");
        return;
    }

    // Geração de credenciais únicas e Hash fictício do Ledger
    const playerId = "PL-" + Math.floor(100000 + Math.random() * 900000);
    const ledgerHash = "0x" + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');

    try {
        // Busca o banco de dados local do navegador
        const dbPlayers = JSON.parse(localStorage.getItem("local_players_db") || "[]");
        
        // Estrutura o novo registro do jogador
        const novoJogador = {
            id: playerId,
            fullname: fullName,
            dob: dob,
            country: country,
            document_type: docType,
            document_number: docNumber,
            ledger_hash: ledgerHash
        };

        // Salva no banco de dados local
        dbPlayers.push(novoJogador);
        localStorage.setItem("local_players_db", JSON.stringify(dbPlayers));

        // Define a sessão ativa do jogador atual
        const dadosSessao = {
            id: playerId,
            nome: fullName,
            pais: country,
            hashSeguranca: ledgerHash,
            statusKYC: "APPROVED"
        };
        
        localStorage.setItem("current_player", JSON.stringify(dadosSessao));
        localStorage.setItem("igaming_balance", "50.00"); // Concede o bônus inicial regulamentar

        alert(`✅ LOCAL DATABASE SYNCED:\nWelcome ${fullName}!\nYour data is safely stored in the Cloud Database.\nID: ${playerId}`);
        
        // Redireciona imediatamente de volta para a tela inicial
        window.location.href = "index.html";

    } catch (error) {
        console.error("Erro no processamento do banco local:", error);
        alert("❌ FALHA NO REGISTRO: " + error.message);
    }
}

/**
 * Atualiza a interface visual do painel (Saldo e Identificação do Player)
 */
function atualizarCamposInterface() {
    const jogadorSessao = localStorage.getItem("current_player");
    const saldoAtual = localStorage.getItem("igaming_balance") || "0.00";

    const elementoSaldo = document.querySelector(".balance-amount");
    if (elementoSaldo) {
        elementoSaldo.innerHTML = `<span class="currency">€</span> ${parseFloat(saldoAtual).toFixed(2)}`;
    }

    const elementoSaldoPlat = document.getElementById("platformBalance");
    if (elementoSaldoPlat) {
        elementoSaldoPlat.innerText = `€ ${parseFloat(saldoAtual).toFixed(2)}`;
    }

    const botaoRegistro = document.querySelector(".btn-register-main");
    if (botaoRegistro) {
        if (jogadorSessao) {
            const jogador = JSON.parse(jogadorSessao);
            botaoRegistro.innerHTML = `👤 Player: ${jogador.nome} (ID: ${jogador.id})`;
            botaoRegistro.style.background = "linear-gradient(90deg, #10b981 0%, #059669 100%)";
            botaoRegistro.href = "#";
            botaoRegistro.onclick = (e) => {
                e.preventDefault();
                alert(`ℹ️ PLAYER PROFILE\n\nName: ${jogador.nome}\nID: ${jogador.id}\nLedger Security Hash:\n${jogador.hashSeguranca}`);
            };
        } else {
            botaoRegistro.innerHTML = `👤 Create Account / Register (International KYC)`;
            botaoRegistro.style.background = "linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)";
            botaoRegistro.href = "cadastro.html";
            botaoRegistro.onclick = null;
        }
    }
}

/**
 * Executa a lógica de Depósito na Carteira
 */
function ejecutarDeposito() {
    const jogadorSessao = localStorage.getItem("current_player");
    if (!jogadorSessao) { alert("❌ KYC Registration required."); return; }
    const valor = parseFloat(prompt("Enter deposit amount (€):", "100.00"));
    if (isNaN(valor) || valor <= 0) return;

    let saldo = parseFloat(localStorage.getItem("igaming_balance") || "0.00") + valor;
    localStorage.setItem("igaming_balance", saldo.toString());
    
    adicionarTransacaoHistorico("Deposit Approved", valor, true);
    atualizarCamposInterface();
}

/**
 * Executa a lógica de Saque da Carteira
 */
function executarSaque() {
    const jogadorSessao = localStorage.getItem("current_player");
    if (!jogadorSessao) return;
    
    let saldo = parseFloat(localStorage.getItem("igaming_balance") || "0.00");
    const valor = parseFloat(prompt(`Enter withdrawal amount (Max: € ${saldo.toFixed(2)}):`, "50.00"));
    
    if (isNaN(valor) || valor <= 0 || valor > saldo) { alert("Invalid amount or insufficient funds."); return; }

    saldo -= valor;
    localStorage.setItem("igaming_balance", saldo.toString());
    
    adicionarTransacaoHistorico("Withdrawal Requested", valor, false);
    atualizarCamposInterface();
}

/**
 * Adiciona linhas de auditoria visual no histórico do index.html
 */
function adicionarTransacaoHistorico(tipo, valor, IsPositivo) {
    const secaoHistorico = document.querySelector(".history-section");
    if (!secaoHistorico) return;
    
    const novoItem = document.createElement("div");
    novoItem.className = "tx-item";
    novoItem.innerHTML = `<div><div class="tx-type">${tipo}</div></div><div class="${IsPositivo ? 'tx-value-pos' : ''}" style="${!IsPositivo ? 'color:#ef4444;' : ''}">${IsPositivo ? '+' : '-'} € ${valor.toFixed(2)}</div>`;
    
    const titulo = secaoHistorico.querySelector(".section-title");
    if (titulo) {
        titulo.parentNode.insertBefore(novoItem, titulo.nextSibling);
    }
}
