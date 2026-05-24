let currentBalance = 0;

async function loadPlayer() {

    const response =
        await fetch('../database/players.json');

    const players =
        await response.json();

    const player = players[0];

    currentBalance = player.walletBalance;

    document.getElementById('player-name').innerText =
        player.username;

    document.getElementById('bonus-balance').innerText =
        '€' + player.bonusBalance;

    document.getElementById('kyc-status').innerText =
        player.kycStatus;

    document.getElementById('vip-level').innerText =
        player.vipLevel;

    updateBalance();
}

function updateBalance() {

    document.getElementById('wallet-balance').innerText =
        '€' + currentBalance.toFixed(2);
}

function depositMoney() {

    currentBalance += 100;

    updateBalance();

    alert('Deposit Successful!');
}

function placeBet() {

    if (currentBalance < 25) {

        alert('Insufficient Balance');

        return;
    }

    currentBalance -= 25;

    updateBalance();

    alert('Bet Placed!');
}

async function loadTransactions() {

    const response =
        await fetch('../database/transactions.json');

    const transactions =
        await response.json();

    const table =
        document.getElementById('transactions-table');

    transactions.forEach(transaction => {

        const row =
            document.createElement('tr');

        row.innerHTML = `
            <td>${transaction.transactionId}</td>
            <td>${transaction.type}</td>
            <td>${transaction.amount} ${transaction.currency}</td>
            <td>${transaction.status}</td>
        `;

        table.appendChild(row);
    });
}

loadPlayer();

loadTransactions();
