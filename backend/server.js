// 1. CHAVES DE CONEXÃO COM O SUPABASE
const SUPABASE_URL = 'https://supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_k0e7oUjMRbCynrzeK6N2Xw_mjyXVInMb'; 

// 2. IMPORTAÇÃO DE BIBLIOTECAS
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// 3. MIDDLEWARES OBRIGATÓRIOS
app.use(cors());
app.use(express.json());

// Inicializa a conexão oficial com o PostgreSQL do Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * ROTA: Cadastro de Jogador Internacional (KYC Endpoint com Gravação no Banco)
 * POST /api/register
 */
app.post('/api/register', async (req, res) => {
    const { fullName, dob, country, docType, docNumber } = req.body;

    if (!fullName || !dob || !country || !docType || !docNumber) {
        return res.status(400).json({ error: "FIELDS_REQUIRED", message: "Todos os campos de KYC são obrigatórios." });
    }

    // Regra regulatória de Malta: Validação de maioridade (18+)
    const idade = Math.floor((new Date() - new Date(dob)) / 31557600000);
    if (idade < 18) {
        return res.status(403).json({ error: "UNDERAGE", message: "Registro negado por conformidade com a MGA (Menor de 18 anos)." });
    }

    // Identificadores de segurança do Ledger
    const playerId = "PL-" + Math.floor(100000 + Math.random() * 900000);
    const ledgerHash = "0x" + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');

    // Insere os dados diretamente na tabela 'players' do Supabase
    const { data, error } = await supabase
        .from('players')
        .insert([
            { 
                id: playerId, 
                fullname: fullName, 
                dob: dob, 
                country: country, 
                document_type: docType, 
                document_number: docNumber, 
                ledger_hash: ledgerHash,
                balance: 50.00 // Crédito inicial regulamentado de 50 Euros
            }
        ]);

    if (error) {
        console.error("Erro no Supabase:", error);
        return res.status(500).json({ error: "DATABASE_ERROR", message: "Falha ao gravar no banco central do Supabase." });
    }

    res.status(201).json({
        status: "APPROVED",
        player: {
            id: playerId,
            nome: fullName,
            pais: country,
            hashSeguranca: ledgerHash,
            balance: 50.00
        }
    });
});

/**
 * ROTA: Consulta de Saldo unificado do Ledger
 * GET /api/balance/:id
 */
app.get('/api/balance/:id', async (req, res) => {
    const { data, error } = await supabase
        .from('players')
        .select('balance')
        .eq('id', req.params.id)
        .single();

    if (error || !data) {
        return res.status(404).json({ error: "PLAYER_NOT_FOUND" });
    }
    
    res.json({ balance: data.balance });
});

app.listen(PORT, () => {
    console.log(`📡 iGaming Ledger Engine conectada ao Supabase Postgres na porta ${PORT}`);
});


    
