const title = document.getElementById("title_container");
const text = title.textContent.trim();
let colors = ["rgba(204, 46, 46, 1)", "rgba(47, 184, 47, 1)", "rgba(58, 67, 194, 1);", "rgba(224, 164, 53, 1)"];

let newHTML = "";
for(let i = 0; i < colors.length; i++) {
    newHTML += `<span style="color:${colors[i]}; text-shadow: 1.5px 1.5px 10px ${colors[i]}">${text[i]}</span>`;
}
title.innerHTML = newHTML;


const play_with_bot_btn = document.getElementsByClassName("gamemode_button")[0];

play_with_bot_btn.addEventListener('click', function() {
    sessionStorage.clear();
    const settings = {
                    gamemode: "Bot",
                    players: 2
                };
    sessionStorage.setItem("settings", JSON.stringify(settings));
})


const info_block = document.querySelector("#info");
const info_btn = document.querySelector("#info_btn");
const close_info = document.querySelector("#close_info");
const overlay = document.querySelector("#overlay");

info_btn.addEventListener('click', function() {
    info_block.style.display = "block";
    overlay.style.display = "block";
})

close_info.addEventListener('click', function() {
    info_block.style.display = "none";
    overlay.style.display = "none";
})

