const express = require('express');
const cors = require('cors');
// Caso use SQLite para testes rápidos ou PostgreSQL/MySQL em produção, importe o drive correspondente aqui
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares obrigatórios para leitura de dados e segurança da API
app.use(cors());
app.use(express.json());

// Banco de dados em memória simulado (Substitua pela conexão do seu banco real como PostgreSQL, MySQL ou MongoDB)
let playersDatabase = [];

/**
 * ROTA: Cadastro de Jogador Internacional (KYC Endpoint)
 * POST /api/register
 */
app.post('/api/register', (req, res) => {
    const { fullName, dob, country, docType, docNumber } = req.body;

    // Validação de segurança básica no servidor (Anti-fraude)
    if (!fullName || !dob || !country || !docType || !docNumber) {
        return res.status(400).json({ error: "FIELDS_REQUIRED", message: "Todos os campos de KYC são obrigatórios." });
    }

    // Regra regulatória de Malta: Validação técnica de Idade
    const idade = Math.floor((new Date() - new Date(dob)) / 31557600000);
    if (idade < 18) {
        return res.status(403).json({ error: "UNDERAGE", message: "Registro negado por conformidade com a MGA (Menor de 18 anos)." });
    }

    // Geração dos identificadores de segurança do Ledger
    const playerId = "PL-" + Math.floor(100000 + Math.random() * 900000);
    const ledgerHash = "0x" + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');

    const newPlayer = {
        id: playerId,
        fullName,
        dob,
        country,
        docType,
        docNumber,
        ledgerHash,
        balance: 50.00 // Crédito inicial em Euros
    };

    // Salva no banco de dados
    playersDatabase.push(newPlayer);

    // Retorna a aprovação em conformidade técnica
    res.status(201).json({
        status: "APPROVED",
        player: {
            id: newPlayer.id,
            nome: newPlayer.fullName,
            pais: newPlayer.country,
            hashSeguranca: newPlayer.ledgerHash,
            balance: newPlayer.balance
        }
    });
});

/**
 * ROTA: Consulta de Saldo unificado do Ledger
 * GET /api/balance/:id
 */
app.get('/api/balance/:id', (req, res) => {
    const player = playersDatabase.find(p => p.id === req.params.id);
    if (!player) return res.status(404).json({ error: "PLAYER_NOT_FOUND" });
    
    res.json({ balance: player.balance });
});

app.listen(PORT, () => {
    console.log(`📡 iGaming Ledger Backend rodando com sucesso na porta ${PORT}`);
});
