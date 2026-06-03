/**
 * iGaming Ledger - Core Engine (Official Supabase SDK Integration)
 */

const SUPABASE_URL = 'https://njexnwhyjtgrcskmazon.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qZXhud2h5dGpncmNza21hem9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2NTMyOTQsImV4cCI6MjA5NTIyOTI5NH0.Ua0q2qgxqZrWjeTjS_gaSFylS8Y6amcAY5vrmzsCl1o';

// Inicializa o cliente do Supabase com tratamento seguro
const supabaseClient = window.Supabase ? window.Supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

if (!supabaseClient) {
    console.error("ERRO DE INICIALIZAÇÃO: A biblioteca do Supabase não foi detectada.");
}

// Configurações executadas assim que a página carrega
document.addEventListener("DOMContentLoaded", () => {
    // Inicializa o saldo local se não existir
    if (!localStorage.getItem("igaming_balance")) {
        localStorage.setItem("igaming_balance", "0.00");
    }
    
    // Atualiza elementos visuais na tela
    atualizarCamposInterface();

    // Vincula o evento de envio ao formulário de cadastro de forma segura
    const formulario = document.getElementById('kycForm');
    if (formulario) {
        formulario.addEventListener('submit', processarCadastro);
    }
});

/**
 * Cadastra o jogador usando o SDK oficial do Supabase
 */
async function processarCadastro(event) {
    // 1. Impede o recarregamento imediato da página
    event.preventDefault();

    if (!supabaseClient) {
        alert("❌ ERRO DE REDE: O cliente do Supabase não foi inicializado. Verifique suas credenciais.");
        return;
    }

    // 2. Captura os valores dos inputs do HTML
    const fullName = document.getElementById('fullName').value.trim();
    const dob = document.getElementById('dob').value;
    const country = document.getElementById('country').value;
    const docType = document.getElementById('docType').value;
    const docNumber = document.getElementById('docNumber').value.trim();

    // 3. Validação de Idade (Regulamentação MGA Malta)
    const idade = Math.floor((new Date() - new Date(dob)) / 31557600000);
    if (idade < 18) {
        alert("❌ REGISTRATION DENIED: Under MGA regulations, players must be at least 18 years old.");
        return;
    }

    // 4. Criação de chaves únicas do Ledger fictício
    const playerId = "PL-" + Math.floor(100000 + Math.random() * 900000);
    const ledgerHash = "0x" + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');

    try {
        // 5. Envia os dados estruturados para a tabela 'players' no banco PostgreSQL do Supabase
        // Certifique-se de que os nomes das colunas abaixo batem EXATAMENTE com as colunas criadas no banco
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

        // 6. Salva o estado de sessão local do navegador se gravou no banco com sucesso
        const dadosJogador = {
            id: playerId,
            nome: fullName,
            pais: country,
            hashSeguranca: ledgerHash,
            statusKYC: "APPROVED"
        };
        
        localStorage.setItem("current_player", JSON.stringify(dadosJogador));
        localStorage.setItem("igaming_balance", "50.00"); // Concede bônus inicial fictício

        alert(`✅ BANCO DE DADOS SYNCED:\nWelcome ${fullName}!\nYour data is safely stored in the Cloud Database.\nID: ${playerId}`);
        
        // 7. Redireciona o usuário de volta para o painel principal
        window.location.href = "index.html";

    } catch (error) {
        console.error("Erro retornado pelo Supabase:", error);
        alert("❌ FALHA NO REGISTRO: " + error.message);
    }
}

/**
 * Atualiza o cabeçalho e saldo com os dados do jogador atual
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

function executarDeposito() {
    const jogadorSessao = localStorage.getItem("current_player");
    if (!jogadorSessao) { alert("❌ KYC Registration required."); return; }
    const valor = parseFloat(prompt("Enter deposit amount (€):", "100.00"));
    if (isNaN(valor) || valor <= 0) return;

    let saldo = parseFloat(localStorage.getItem("igaming_balance") || "0.00") + valor;
    localStorage.setItem("igaming_balance", saldo.toString());
    atualizarCamposInterface();
}
