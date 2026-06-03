/**
 * iGaming Ledger - Core Engine (Official Supabase SDK Integration)
 */

const SUPABASE_URL = 'https://supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qZXhud2h5dGpncmNza21hem9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2NTMyOTQsImV4cCI6MjA5NTIyOTI5NH0.Ua0q2qgxqZrWjeTjS_gaSFylS8Y6amcAY5vrmzsCl1o';

// Inicializa o cliente do Supabase de forma segura
const supabaseClient = window.Supabase ? window.Supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

if (!supabaseClient) {
    console.error("ERRO DE INICIALIZAÇÃO: A biblioteca do Supabase não foi detectada.");
}

// Configurações disparadas ao carregar o DOM
document.addEventListener("DOMContentLoaded", () => {
    if (!localStorage.getItem("igaming_balance")) {
        localStorage.setItem("igaming_balance", "0.00");
    }
    
    atualizarCamposInterface();

    const formulario = document.getElementById('kycForm');
    if (formulario) {
        formulario.addEventListener('submit', processarCadastro);
    }
});

/**
 * Cadastra o jogador usando o SDK oficial do Supabase
 */
async function processarCadastro(event) {
    event.preventDefault();

    if (!supabaseClient) {
        alert("❌ ERRO DE REDE: O cliente do Supabase não foi inicializado.");
        return;
    }

    const fullName = document.getElementById('fullName').value.trim();
    const dob = document.getElementById('dob').value;
    const country = document.getElementById('country').value;
    const docType = document.getElementById('docType').value;
    const docNumber = document.getElementById('docNumber').value.trim();

    // Validação MGA de Malta (18 anos ou mais)
    const idade = Math.floor((new Date() - new Date(dob)) / 31557600000);
    if (idade < 18) {
        alert("❌ REGISTRATION DENIED: Under MGA regulations, players must be at least 18 years old.");
        return;
    }

    const playerId = "PL-" + Math.floor(100000 + Math.random() * 900000);
    const ledgerHash = "0x" + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');

    try {
        const { error } = await supabaseClient
            .from('players')
            .insert([
                {
                    id: playerId,
                    fullname: fullName,
                    dob: dob,
                    country: country,
                    document_type: docType,
                    document_number: docNumber,
                    ledger_hash: ledgerHash
                }
            ]);      
        
        if (error) throw error;

        const dadosJogador = {
            id: playerId,
            nome: fullName,
            pais: country,
            hashSeguranca: ledgerHash,
            statusKYC: "APPROVED"
        };
        
        localStorage.setItem("current_player", JSON.stringify(dadosJogador));
        localStorage.setItem("igaming_balance", "50.00"); // Concede saldo inicial em carteira

        alert(`✅ BANCO DE DADOS SYNCED:\nWelcome ${fullName}!\nYour data is safely stored in the Cloud Database.\nID: ${playerId}`);
        window.location.href = "index.html";

    } catch (error) {
        console.error("Erro retornado pelo Supabase:", error);
        alert("❌ FALHA NO REGISTRO: " + error.message);
    }
}

/**
 * Atualiza o painel visual
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

/**
 * Operação de Depósito
 */
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

/**
 * Operação de Saque
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
