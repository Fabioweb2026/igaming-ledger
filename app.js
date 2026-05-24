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

    updateBalance();

    document.getElementById('bonus-balance').innerText =
        '€' + player.bonusBalance;

    document.getElementById('kyc-status').innerText =
        player.kycStatus;
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
