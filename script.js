/**
 * iGaming Ledger - Core Engine (Direct Supabase Connection)
 */

const SUPABASE_URL = 'https://supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_k0e7oUjMRbCynrzeK6N2Xw_mjyXVInMb'; 

document.addEventListener("DOMContentLoaded", () => {
    if (!localStorage.getItem("igaming_balance")) {
        localStorage.setItem("igaming_balance", "0.00");
    }
    atualizarCamposInterface();
});

/**
 * Cadastra o jogador direto no PostgreSQL do Supabase via API REST
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

    const playerId = "PL-" + Math.floor(100000 + Math.random() * 900000);
    const ledgerHash = "0x" + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');

    // Dados empacotados para a tabela 'players'
    const payload = {
        id: playerId,
        fullname: fullName,
        dob: dob,
        country: country,
        document_type: docType,
        document_number: docNumber,
        ledger_hash: ledgerHash,
        balance: 50.00
    };

    // Envia direto para a API Rest nativa do seu Supabase
    fetch(`${SUPABASE_URL}/rest/v1/players`, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) throw new Error("Falha na sincronização com o banco PostgreSQL.");
        return response.json();
    })
    .then(() => {
        const dadosJogador = {
            id: playerId,
            nome: fullName,
            pais: country,
            hashSeguranca: ledgerHash,
            statusKYC: "APPROVED"
        };
        localStorage.setItem("current_player", JSON.stringify(dadosJogador));
        localStorage.setItem("igaming_balance", "50.00");

        alert(`✅ BANCO DE DADOS SYNCED:\nWelcome ${fullName}!\nYour data is safely stored in the Cloud Database.\nID: ${playerId}`);
        window.location.href = "index.html";
    })
    .catch(error => {
        alert("❌ FALHA NO REGISTRO: " + error.message);
    });
}

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
    if (botaoRegistro && jogadorSessao) {
        const jogador = JSON.parse(jogadorSessao);
        botaoRegistro.innerHTML = `👤 Player: ${jogador.nome} (ID: ${jogador.id})`;
        botaoRegistro.style.background = "linear-gradient(90deg, #10b981 0%, #059669 100%)";
        botaoRegistro.href = "#";
        botaoRegistro.onclick = (e) => {
            e.preventDefault();
            alert(`ℹ️ PLAYER PROFILE\n\nName: ${jogador.nome}\nID: ${jogador.id}\nLedger Security Hash:\n${jogador.hashSeguranca}`);
        };
    }
}

function executarDeposito() {
    const jogadorSessao = localStorage.getItem("current_player");
    if (!jogadorSessao) { alert("❌ KYC Registration required."); return; }
    const valor = parseFloat(prompt("Enter deposit amount (€):", "100.00"));
    if (isNaN(valor) || valor <= 0) return;

    let saldo = parseFloat(localStorage.getItem("igaming_balance") || "0.00") + valor;
    localStorage.setItem("igaming_balance", saldo.toString());
    adicionarTransacaoHistorico("Deposit Approved", valor, true);
    atualizarCamposInterface();
}

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

function adicionarTransacaoHistorico(tipo, valor, IsPositivo) {
    const secaoHistorico = document.querySelector(".history-section");
    if (!secaoHistorico) return;
    const novoItem = document.createElement("div");
    novoItem.className = "tx-item";
    novoItem.innerHTML = `<div><div class="tx-type">${tipo}</div></div><div class="${IsPositivo ? 'tx-value-pos' : ''}" style="${!IsPositivo ? 'color:#ef4444;' : ''}">${IsPositivo ? '+' : '-'} € ${valor.toFixed(2)}</div>`;
    const titulo = secaoHistorico.querySelector(".section-title");
    titulo.parentNode.insertBefore(novoItem, titulo.nextSibling);
}

