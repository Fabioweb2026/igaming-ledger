async function loadPlayer() {

    const response = await fetch('../database/players.json');

    const players = await response.json();

    const player = players[0];

    document.getElementById('player-name').innerText =
        player.username;

    document.getElementById('wallet-balance').innerText =
        '€' + player.walletBalance;

    document.getElementById('bonus-balance').innerText =
        '€' + player.bonusBalance;

    document.getElementById('kyc-status').innerText =
        player.kycStatus;
}

loadPlayer();
