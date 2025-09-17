const amounts = document.querySelectorAll(".amount");
let players_amount = 0;
let settings = '';
amounts.forEach(a => {
    a.addEventListener('click', event => {
        event.preventDefault();
        players_amount = a.innerText;
        settings = {gamemode:'Friends',
                    players: players_amount
                };
        sessionStorage.clear();
        sessionStorage.setItem("settings", JSON.stringify(settings));
        window.location.href = "game.html";
    })
})