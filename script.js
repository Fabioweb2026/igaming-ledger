/**
 * iGaming Ledger - Core Engine (Official Supabase SDK Integration)
 */
// 1.  <title>iGaming Ledger - International KYC Register</title> (Pegue no painel do Supabase em Settings > API)
// 🌟 URL Corrigida (Apenas até o .co, sem barras no final)
const SUPABASE_URL = 'https://njexnwhyjtgrcskmazon.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qZXhud2h5dGpncmNza21hem9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2NTMyOTQsImV4cCI6MjA5NTIyOTI5NH0.Ua0q2qgxqZrWjeTjS_gaSFylS8Y6amcAY5vrmzsCl1o';
// 2. CORREÇÃO DA BIBLIOTECA: O "S" deve ser maiúsculo para CDN v2 (window.Supabase)
const supabaseClient = window.Supabase ? window.Supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// Sistema de segurança contra falha de carregamento
if (!supabaseClient) {
    alert("ERRO DE REDE: A biblioteca do Supabase não foi carregada. Certifique-se de que o script de CDN está no seu cadastro.html.");
}

// 🌟 CORREÇÃO: Escuta o carregamento da página e vincula o evento de envio do formulário
document.addEventListener("DOMContentLoaded", () => {
    if (!localStorage.getItem("igaming_balance")) {
        localStorage.setItem("igaming_balance", "0.00");
    }
    atualizarCamposInterface();

// 🌟 VINCULA A FUNÇÃO AO FORMULÁRIO DE CADASTRO
// 🌟 ESCUTA O FORMULÁRIO DE CADASTRO UNIFICADO
document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.querySelector('form');

    if (formulario) {
        formulario.addEventListener('submit', async (event) => {
            // 1. Bloqueia o recarregamento da página IMEDIATAMENTE
            event.preventDefault(); 

            if (!supabaseClient) {
                alert("Erro: O cliente do Supabase não foi inicializado corretamente.");
                return;
            }

            try {
                // 2. Captura os valores de forma segura (por posição se o ID falhar)
                const nomeCompleto = document.getElementById('fullName')?.value || document.querySelector('input[placeholder*="official document"]')?.value;
                const dataNascimento = document.getElementById('dob')?.value || document.querySelector('input[type="date"]')?.value;
                const paisResidencia = document.getElementById('country')?.value || document.querySelector('select')?.value;
                const numeroDocumento = document.getElementById('docNumber')?.value || document.querySelector('input[placeholder*="ID number"]')?.value;

                // Validação de conformidade MGA de Malta
                if (!nomeCompleto || !dataNascimento || !paisResidencia || !numeroDocumento) {
                    alert("Por favor, preencha todos os campos regulamentares para o KYC.");
                    return;
                }

                // 3. Envia os dados para a tabela 'players' no Supabase
                    // Dentro da sua função, após coletar as constantes:
const { data, error } = await supabaseClient
  .from('players')
  .insert([
      { 
          full_name: fullName,
          dob: dob,         
          country: country,
          document_number: docNumber // Usa a constante docNumber mapeada corretamente
      }
   ]);

                // 4. Resposta para o operador do Ledger
                if (error) {
                    console.error("Erro do Supabase RLS/Tabela:", error);
                    alert("Erro ao registrar no Ledger: " + error.message);
                } else {
                    alert("Cliente de iGaming registrado com sucesso internacional em Malta!");
                    formulario.reset(); // Limpa o formulário de forma segura
                }

            } catch (err) {
                console.error("Erro crítico na execução do JavaScript:", err);
                alert("Erro interno: O script travou durante o processamento.");
            }
        });
    }
});

/**
 * Cadastra o jogador usando o SDK oficial do Supabase
 */
async function processarCadastro(event) {
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

    // Verifica se a biblioteca do Supabase carregou corretamente na página
    if (!supabaseClient) {
        alert("❌ ERRO DE REDE: A biblioteca do Supabase não foi carregada. Certifique-se de que o script de CDN está no seu cadastro.html.");
        return;
    }

    try {
        // Envia os dados de forma nativa e limpa para o PostgreSQL
        // Envia os dados de forma nativa e limpa para o PostgreSQL
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
            // 🌟 REMOVIDO: O balance não é mais enviado pelo frontend!
        }
    ]);      
        if (error) throw error;

        // Guarda a sessão local se o banco gravou com sucesso
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

    } catch (error) {
        alert("❌ FALHA NO REGISTRO: " + error.message);
    }
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
</> JavaScript
}
