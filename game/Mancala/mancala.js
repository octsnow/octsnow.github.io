// global variables
const g_setting = {
    stone_r: 20,
    text_font: "48px arial",
    text_draw_color: "#000000",
    text_draw_frames: 30,
    text_draw_fade_frames: 10,
    player_holes:[
        {min:8, max:13},
        {min: 1, max:6}
    ]
};

let g_draw_data = {
    stone_colors: [
        "#FF0000",
        "#00FF00",
        "#0000FF",
        "#00F0F0",
        "#F0F000"
    ],
    ctx: 0,
    back_ctx: 0,
    holes: 0,
    c_w: 0,
    c_h: 0
};

let g_state = {
    mouse_x: 0,
    mouse_y: 0,
    stones: [],
    overed_hole: -1,
    selected_hole: -1,
    player_turn: 0
};

let g_gen = function* (){}();

// classes
class Hole{
    constructor(x, y, w, h){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    setPoint(x, y){
        this.x = x;
        this.y = y;
    }
}

class Stone{
    constructor(x, y, color){
        this.x = x;
        this.y = y;
        this.color = color;
    }
    setPoint(x, y){
        this.x = x;
        this.y = y;
    }
}

// functions
function* genDrawTextFrames(text, color, frames){
    let alpha_interval = 1.0 / g_setting.text_draw_fade_frames;
    let alpha = alpha_interval;
    let text_font = g_setting.text_font;
    let text_size = getTextSize(g_draw_data.back_ctx, text);

    while(frames > 0){
        let ctx = g_draw_data.back_ctx;
        let x = (g_draw_data.c_w - text_size.width) / 2;
        let y = (g_draw_data.c_h - text_size.height) / 2;
        
        ctx.globalAlpha = alpha;

        ctx.font = text_font;
        setStrokeColor(ctx, "#FFFFFF");
        setFillColor(ctx, color);
        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);

        if(frames <= g_setting.text_draw_fade_frames){
            alpha -= alpha_interval;
        }else if(alpha < 1){
            alpha += alpha_interval;
        }else{
            alpha = 1;
        }
        frames--;
        yield;
    }
}

function setGen(genObj){
    g_gen = genObj;
}

function setFillColor(ctx, color){
    ctx.fillStyle = color;
}

function setStrokeColor(ctx, color){
    ctx.strokeStyle = color;
}

function getRandomColor(){
    return g_draw_data.stone_colors[Math.floor(Math.random()*g_draw_data.stone_colors.length)];
}

function getRandomCapsulePoint(x, y, w, h){
    let range_x1 = g_setting.stone_r + x;
    let range_x2 = w - 2*g_setting.stone_r;
    let out_x = range_x1 + Math.random() * range_x2;

    let h_d = Math.sqrt(pow2(w/2 - g_setting.stone_r) - pow2(x + (w/2) - out_x));
    let range_y1 = y + w/2 - h_d;
    let range_y2 = h - w + 2*h_d;
    let out_y = range_y1 + Math.random() * range_y2;

    return {x: out_x, y: out_y};
}

function getHoleParams(board_width, board_height){
    let out1 = [];
    let out2 = [];

    let pad_left = 10;
    let pad_top = 10;
    let hole_space = 5;
    let hole_space_wcenter = 50;
    let hole_space_hcenter = 10;
    let hole_w = (board_width - pad_left*2 - hole_space*6 - hole_space_wcenter) / 8;
    let hole_h = (board_height - pad_top*2 - hole_space_hcenter) / 2;

    out1.push(new Hole(pad_left, pad_top, hole_w, (board_height - pad_top*2)));

    for(let i = 0; i < 3; i++){
        let s = pad_left + hole_space + hole_w;
        let x = s + i*(hole_w + hole_space);
        let y1 = pad_top;
        let y2 = board_height - pad_top - hole_h;

        out1.push(new Hole(x, y2, hole_w, hole_h));
        out2.push(new Hole(x, y1, hole_w, hole_h));
    }
    for(let i = 0; i < 3; i++){
        let s = pad_left + hole_space*3 + hole_w*4 + hole_space_wcenter;
        let x = s + i*(hole_w + hole_space);
        let y1 = pad_top;
        let y2 = board_height - pad_top - hole_h;

        out1.push(new Hole(x, y2, hole_w, hole_h));
        out2.push(new Hole(x, y1, hole_w, hole_h));
    }
    out2.push(new Hole((board_width - pad_left - hole_w), pad_top, hole_w, (board_height - pad_top*2)));

    return out2.reverse().concat(out1);
}

function getStoneParams(){
    let out = [];

    out.push([]);
    for(let i = 1; i < g_draw_data.holes.length; i++){
        out.push([]);
        if(i === 7)  continue;
        for(let j = 0; j < 4; j++){
            let hole = g_draw_data.holes[i];

            let p = getRandomCapsulePoint(hole.x, hole.y, hole.w, hole.h);

            out[i].push(new Stone(p.x, p.y, getRandomColor()));
        }
    }

    return out;
}

function updateStones(hole_num){
    g_state.stones[hole_num].forEach((v) => {
        let hole = g_draw_data.holes[hole_num];
        let p = getRandomCapsulePoint(hole.x, hole.y, hole.w, hole.h);
        v.setPoint(p.x, p.y);
    });
}

function drawCapsule(ctx, x, y, w, h, fill=true){
    let r = w / 2;

    if(fill){
        ctx.beginPath();
        ctx.arc(x+r, y+r, r, 0, Math.PI, true );
        ctx.arc(x+r, y+h-r, r, 0, Math.PI, false );
        ctx.fill();
        ctx.fillRect(x, y+r, w, h-w);
    }else{
        ctx.beginPath();
        ctx.arc(x+r, y+r, r, 0, Math.PI, true );
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x+r, y+h-r, r, 0, Math.PI, false );
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x, y+r);
        ctx.lineTo(x, y+h-r);
        ctx.moveTo(x+w, y+r);
        ctx.lineTo(x+w, y+h-r);
        ctx.stroke();
    }
}

function getOtherSideHoleNum(hole_num){
    return g_draw_data.holes.length - hole_num;
}

function moveStone(hole_num){
    let pick_hole_num = hole_num;

    while(g_state.stones[pick_hole_num].length > 0){
        let stone = g_state.stones[pick_hole_num].pop();

        hole_num = (hole_num + 1) % g_state.stones.length;
        g_state.stones[hole_num].push(stone);
        updateStones(hole_num);
    }

    // is just goal
    if(hole_num === g_state.player_turn * (g_draw_data.holes.length / 2 )){
        setGen(genDrawTextFrames("ぴったりゴール", g_setting.text_draw_color, g_setting.text_draw_frames))
        return true;
    }
    
    // is stealing
    let other_side_hole_num = getOtherSideHoleNum(hole_num);
    let player_hole = g_setting.player_holes[g_state.player_turn];
    if((player_hole.min <= hole_num && hole_num <= player_hole.max)
    && g_state.stones[hole_num].length === 1
    && g_state.stones[other_side_hole_num].length > 0){
        let store_num = g_state.player_turn * Math.floor(g_draw_data.holes.length / 2);
        g_state.stones[store_num] = g_state.stones[store_num].concat(g_state.stones[hole_num].concat(g_state.stones[other_side_hole_num]));
        g_state.stones[hole_num] = [];
        g_state.stones[other_side_hole_num] = [];

        updateStones(hole_num);
        updateStones(other_side_hole_num);
        updateStones(store_num);

        setGen(genDrawTextFrames("よこどり", g_setting.text_draw_color, g_setting.text_draw_frames));
    }
    
    return false;
}

function nextTurn(){
    g_state.player_turn = 1 - g_state.player_turn;
}

function pow2(n){
    return n*n;
}

function getTextSize(ctx, text){
    let measure = ctx.measureText(text);
    let width = measure.width;
    let height = measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent;

    return {width: width, height: height};
}

function checkHitCircle(x1, y1, x2, y2, r){
    return Math.sqrt(pow2(x1-x2)+pow2(y1-y2)) <= r;
}

function checkHitBox(x1, y1, x2, y2, w, h){
    return (x2 <= x1 && x1 <= (x2+w)) && (y2 <= y1 && y1 <= (y2+h));
}

function checkHitCapsule(x1, y1, x2, y2, w, h){
    return checkHitCircle(x1, y1, (x2+w/2), (y2+w/2), w/2) || checkHitCircle(x1, y1, (x2+w/2), (y2+h-w/2), w/2) || checkHitBox(x1, y1, x2, (y2+w/2), w, (h-w));
}

function checkEndGame(){
    let out = false;
    g_setting.player_holes.forEach((v, i) => {
        let player_stones = g_state.stones.slice(v.min, v.max + 1);

        let s = 0;
        player_stones.forEach((v) => {
            s += v.length;
        });

        if(s === 0){
            out =  true;
        }
    });

    return out;
}

function endGame(){
    g_setting.player_holes.forEach((v, i) => {
        let holes = g_setting.player_holes[1 - i];
        let player_stones = g_state.stones.slice(holes.min, holes.max + 1);
        let store_hole = (1 - i) * Math.floor(g_draw_data.holes.length / 2);
        let sum_stones = [];
        player_stones.forEach((w, j)=>{
            sum_stones = sum_stones.concat(w);
            g_state.stones[holes.min+j] = [];
        });
        g_state.stones[store_hole] = g_state.stones[store_hole].concat(sum_stones);
        updateStones(store_hole);
    });
}

function initStones(){
    g_state.stones = getStoneParams();
}

function update(){
    let img_data;
    let back_canvas;
    let back_ctx;
    
    back_canvas = document.createElement("canvas");
    back_canvas.width = g_draw_data.c_w;
    back_canvas.height = g_draw_data.c_h;
    back_ctx = back_canvas.getContext("2d");

    g_draw_data.back_ctx = back_ctx;

    // Draw gameboard
    setFillColor(back_ctx, "#FFDF98");
    back_ctx.fillRect(0, 0, g_draw_data.c_w, g_draw_data.c_h);
    
    g_draw_data.holes.forEach((v) => {
        setFillColor(back_ctx, "#CEAC7D");
        drawCapsule(back_ctx, v.x, v.y, v.w, v.h, true);
    });

    // Draw selected hole
    if(g_state.overed_hole >= 0){
        let hole = g_draw_data.holes[g_state.overed_hole];
        drawCapsule(back_ctx, hole.x, hole.y, hole.w, hole.h, false);
    }

    // Draw stones
    back_ctx.font = g_setting.text_font;
    g_state.stones.forEach((stone_list, i) => {
        stone_list.forEach((v) => {
            setFillColor(back_ctx, v.color)
            back_ctx.beginPath();
            back_ctx.arc(v.x, v.y, g_setting.stone_r, 0, 2*Math.PI, true);
            back_ctx.fill();
        });

        setFillColor(back_ctx, "#703900");
        setStrokeColor(back_ctx, "#000000");
        let hole = g_draw_data.holes[i];
        let text = stone_list.length.toString();
        let size = getTextSize(back_ctx, text);
        back_ctx.fillText(text, hole.x + (hole.w - size.width)/2, hole.y + (hole.h - size.height)/2);
        back_ctx.strokeText(text, hole.x + (hole.w - size.width)/2, hole.y + (hole.h - size.height)/2);
    });

    g_gen.next();

    // Swap back for front
    img_data = back_ctx.getImageData(0, 0, g_draw_data.c_w, g_draw_data.c_h);
    g_draw_data.ctx.putImageData(img_data, 0, 0);

    window.requestAnimationFrame(update);
}

window.onload = () => {
    let canvas;
    
    canvas = document.getElementById("gameCanvas");
    g_draw_data.ctx = canvas.getContext("2d");

    document.body.width = window.innerWidth;
    document.body.height = window.innerHeight;
    canvas.width = window.innerWidth;
    canvas.height = canvas.width * (1/3);

    g_draw_data.c_w = canvas.width;
    g_draw_data.c_h = canvas.height;

    // Add event listener
    canvas.addEventListener("mousemove", (e) => {
        g_state.mouse_x = e.clientX;
        g_state.mouse_y = e.clientY;

        let is_hit = false;
        let ph = g_setting.player_holes[g_state.player_turn];
        for(let i = ph.min; i <= ph.max; i++){
            let v = g_draw_data.holes[i];
            if(checkHitCapsule(g_state.mouse_x, g_state.mouse_y, v.x, v.y, v.w, v.h)){
                is_hit = true;
                g_state.overed_hole = i;
                break;
            }
        }
        if(!is_hit) g_state.overed_hole = -1;
    });
    canvas.addEventListener("click", (e) => {
        if(g_state.overed_hole >= 0
        && g_state.stones[g_state.overed_hole].length > 0){
            g_state.selected_hole = g_state.overed_hole;
            if(!moveStone(g_state.selected_hole)){
                nextTurn();
            }
            if(checkEndGame()){
                endGame();
            }
        }
    });

    g_draw_data.holes = getHoleParams(canvas.width, canvas.height);

    initStones();
    update();
};