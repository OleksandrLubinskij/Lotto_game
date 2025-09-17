const settings = JSON.parse(sessionStorage.getItem("settings"));
const players_amount = settings.players;
const gamemode = settings.gamemode;

class Game {
    constructor(players_amount) {
        this.players_amount = players_amount;
        this.players = [];
        this.used_barrels = [];
        if(gamemode == "Friends") {
            for(let i = 0; i < players_amount; i++) {
                let player = new Player(`Гравець ${i+1}`, this);
                this.players.push(player)
            }
        }
        else {
            let player = new Player("You", this);
            let bot = new Player("Bot", this);
            this.players.push(player);
            this.players.push(bot);
        }
    }

    static random(min_num, max_num) {
        return Math.floor(Math.random() * (max_num - min_num + 1)) + min_num;
    }

    static fill_arr() {
        return new Array(3).fill(0);
    }

    static shuffle_arr(arr) {
        if (arr.length <= 1) return arr;
        let new_position = this.random(1, 2);
        [arr[1], arr[new_position]] = [arr[new_position], arr[1]];
        return arr;
    }
    
    static arrange_col(arr) {
        if(arr.length == 1 || arr[0] < arr[1]) return arr;
        else {
            let flag = arr[0];
            arr[0] = arr[1];
            arr[1] = flag;
            return arr;
        } 
    }

    static fix_card_col(arr) {
        let arranged_arr = Game.arrange_col(arr);
        return Game.shuffle_arr(arranged_arr);
    }

    static generate_card_col(card_col, min_cell_num, max_cell_num, num_in_col) {
        let banned_nums = [];
        card_col = Game.fill_arr();

        let k = 0;
        while (k < num_in_col) {
            let cell_num = Game.random(min_cell_num, max_cell_num);
            if (!banned_nums.includes(cell_num)) {
                card_col[k] = cell_num;
                banned_nums.push(cell_num);
                k++;
            }
        }

        return card_col;
    }


    static amount_of_num_in_col(max_amount_in_card) {
        let amounts = [];
        for (let i = 0; i < 9; i++) {
            let nums_in_col = Game.random(1, 2);
            amounts.push(nums_in_col);
        }

        let sum_amount = amounts.reduce((a, b) => a + b, 0);

        if (sum_amount > max_amount_in_card) {

            for (let i = 0; sum_amount > max_amount_in_card && i < amounts.length; i++) {
                if (amounts[i] === 2) {
                    amounts[i]--;
                    sum_amount--;
                }
            }
        } 
        else if (sum_amount < max_amount_in_card) {
            for (let i = 0; sum_amount < max_amount_in_card && i < amounts.length; i++) {
                if (amounts[i] === 1) {
                    amounts[i]++;
                    sum_amount++;
                }
            }
        }
        return amounts;
    }


    generate_cards() {
    let max_amount_in_card = 15;
    for(let i = 0; i < this.players_amount; i++) { 
        let min_cell_num = 1;
        let max_cell_num = 9;

        let amounts = Game.amount_of_num_in_col(max_amount_in_card);

        for(let j = 0; j < 9; j++) {
            let card_col = [];
            card_col = Game.generate_card_col(card_col, min_cell_num, max_cell_num, amounts[j]);
            card_col = Game.fix_card_col(card_col);
            this.players[i].player_card.push(card_col);
            min_cell_num += 10;
            max_cell_num += 10;
        }
    }
    }

    fill_card_by_nums() {
        this.players.forEach((player, index) => {
            player.render_card("main_container", index);
        })
    }

    get_players() {
        return this.players;
    }
    get_used_barrels() {
        return this.used_barrels;
    }
}
class Player {
    constructor(name, gameInstance) {
        this.player_name = name;
        this.player_card = [];
        this.players = gameInstance.get_players();
        this.used_barrels = gameInstance.get_used_barrels();
        this.filled_cells = 0;
    }

    static get_card(index = null) {
    if (index === null) {
        const template = document.getElementById("card_template");
        return template.content.cloneNode(true);
    } else {
        return document.querySelector(`.card[data-player_index='${index}']`);
    }
}

    render_card(containerId, player_index) {
        const clone = Player.get_card();
        const container = document.getElementById(containerId);
        const name_tag = clone.querySelector("#name");
        name_tag.textContent = this.player_name;
        clone.querySelector('.card').dataset.player_index = player_index;
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 9; col++) {
                let value = this.player_card[col][row];
                if (value !== 0) {
                    clone.querySelector(`.r${row}c${col}`).textContent = value;
                }
            }
        }

        container.appendChild(clone);
    }

take_turn() {
    let barrel_num = 0;
    do {
        barrel_num = Game.random(1, 90);
    }
    while(this.used_barrels.includes(barrel_num));
    const barrel_block = document.querySelector('#num_from_barrel');
    const barrel_msg = document.querySelector('#message');
    barrel_block.textContent = barrel_num;

    let lucky_players = [];
    let winners = [];
    this.players.forEach((player, index) => {
        if (player.player_card.some(col => col.includes(barrel_num))) {
            lucky_players.push(player.player_name);
            player.filled_cells++;
            const player_c = Player.get_card(index);
            const cell = player_c.querySelectorAll('td');
            cell.forEach(element => {
                if(element.textContent.trim() == barrel_num) {
                    element.style.backgroundColor = "#228B22";
                }
            })
        }
    });
    this.used_barrels.push(barrel_num);
    if (lucky_players.length > 0) {
        barrel_msg.textContent = `Гравцям пощастило: ${lucky_players.join(', ')}`;
        
        this.players.forEach(player => {
            if(player.filled_cells == 15) {
                winners.push(player.player_name)
            }
        })
        
    } else {
        barrel_msg.textContent = "На жаль, не пощастило";
    }
    Player.check_win(winners);
}

    static check_win(winners) {
        if(winners.length > 0) {
            const winners_block = document.querySelector("#winners");
            const winners_msg = document.querySelector("#winner_msg");
            const look_gamefield = document.querySelector("#buttons div");
            const return_to_results = document.querySelector("#return_to_results");
            const overlay = document.querySelector("#overlay");
            winners_block.style.display = "flex";
            overlay.style.display = "block";
            winners_msg.textContent = `${winners.length == 1 ? "Переможець: " : "Переможці: "} ${winners.join(", ")}`;
            look_gamefield.addEventListener("click", function() {
                winners_block.style.display = "none";
                overlay.style.display = "none";
                return_to_results.style.display = "flex";
            })
            return_to_results.addEventListener("click", function() {
                winners_block.style.display = "flex";
                overlay.style.display = "block";
                return_to_results.style.display = "none";
            })

        }
    }



}

let game = new Game(players_amount);
game.generate_cards();
game.fill_card_by_nums();


function Play(game) {
    let turn = 0;
    const players = game.get_players();
    const take_barrel_btn = document.querySelector("#barrel");

    function nextTurn() {
        const currentPlayer = players[turn];
        currentPlayer.take_turn();
        const prev_index = (turn > 0) ? turn - 1 : players.length - 1;
        const prev_clone = Player.get_card(prev_index);
        const curr_clone = Player.get_card(turn);

        let cur_table = curr_clone.querySelector('table');
        let cur_td = curr_clone.querySelectorAll('td');
        let cur_name_tag = curr_clone.querySelector('#name');
        let prev_table = prev_clone.querySelector('table');
        let prev_td = prev_clone.querySelectorAll('td');
        let prev_name_tag = prev_clone.querySelector('#name');

        cur_table.style.borderColor = 'rgb(240, 248, 255)';
        cur_td.forEach(el => el.style.borderColor = 'rgb(240, 248, 255)');
        cur_name_tag.style.color = 'rgb(240, 248, 255)';

        prev_table.style.borderColor = 'rgb(128, 128, 128)';
        prev_td.forEach(el => el.style.borderColor = 'rgb(128, 128, 128)');
        prev_name_tag.style.color = 'rgb(128, 128, 128)';

        turn++;
        if(turn >= players.length) turn = 0;

        if(gamemode !== "Friends" && players[turn].player_name === "Bot") {
            setTimeout(nextTurn, 1000);
        }
    }

    take_barrel_btn.addEventListener('click', function() {
        if(players[turn].player_name !== "Bot") {
            nextTurn();
        }
    });
}

Play(game);