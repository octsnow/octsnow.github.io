const g_setting = {
    margin_top: 10,
    margin_left: 10,
    boxes_num_w: 6,
    boxes_num_h: 4,
    box_size: 10,
    line_half_thickness: 3,
    non_line_half_thickness: 2,
    line_half_hit: 15,
    paint_line_interval: 20,
    player_color:[
        "#FF0000",
        "#0000FF"
    ],
    non_line_color: "#aaaaaa",
    font: "100px Arial"
};

let g_game_data = {
    ctx: 0,
    back_ctx: 0,
    c_w: 0,
    c_h: 0,
    board_top: 0,
    board_left: 0,
    box_size: 0,
    state: {
        mouse_x: 0,
        mouse_y: 0,
        boxes: 0,
        lines: 0,
        turn: 0,
        score: 0,
        end_flag: false
    }
};

let g_gen = function* (){}();

class Line{
    constructor(s_x, s_y, e_x, e_y, player){
        this.s_x = s_x;
        this.s_y = s_y
        this.e_x = e_x;
        this.e_y = e_y;
        this.player = player;
    }
}

function* genDrawTextFrames(text, frames){
    let size = getTextSize(g_game_data.back_ctx, text);

    setFillColor(g_game_data.back_ctx, "#000000");
    while(frames > 0){
        g_game_data.back_ctx.fillText(text, (g_game_data.c_w - size.width) / 2, (g_game_data.c_h - size.height) / 2);
        frames--;
        yield;
    }
}

function setGen(genObj){
    g_gen = genObj;
}

function hitPoint2Box(px, py, bx1, by1, bx2, by2){
    return (bx1 <= px && px < bx2) && (by1 <= py && py < by2);
}

function checkClickLine(x, y, i, s_x, s_y, e_x, e_y){
    let b1 = Array(2);
    let b2 = Array(2);

    let bs = g_game_data.box_size;

    b1[i] = arguments[3+i] * bs;
    b1[1-i] = arguments[3+1-i] * bs - g_setting.line_half_hit;
    b2[i] = arguments[5+i] * bs;
    b2[1-i] = arguments[5+1-i] * bs + g_setting.line_half_hit;

    return hitPoint2Box(x, y, ...b1, ...b2);
}

function isBox(x, y){
    if(x < 0
    || y < 0
    || x >= g_setting.boxes_num_w
    || y >= g_setting.boxes_num_h
    || g_game_data.state.lines[x][y][0] < 0
    || g_game_data.state.lines[x][y][1] < 0
    || g_game_data.state.lines[x+1][y][1] < 0
    || g_game_data.state.lines[x][y+1][0] < 0){
        return false;
    }

    return true;
}

function checkBox(s_x, s_y, i){
    let boxes = [Array(2), [s_x, s_y]];
    let out = [];

    boxes[0][i] = arguments[i];
    boxes[0][1-i] = arguments[1-i] - 1;

    boxes.forEach((v) => {
        if(isBox(...v)){
            out.push(
                {
                    x: v[0],
                    y: v[1]
                }
            );
        }
    });

    return out;
}

function getClickLine(x, y){
    let s_p = Array(2);
    let e_p = Array(2);
    let out = false;
    x = x - g_game_data.board_left;
    y = y - g_game_data.board_top;
    
    [x, y].forEach((v, i, arr) => {
        s_p[i] = Math.floor(v / g_game_data.box_size);
        s_p[1-i] = Math.floor((arr[1-i] + (g_game_data.box_size / 2)) / g_game_data.box_size);
        e_p[i] = s_p[i] + 1;
        e_p[1-i] = s_p[1-i];

        if(checkClickLine(x, y, i, ...s_p, ...e_p, i)){
            out = {
                s_x: s_p[0],
                s_y: s_p[1],
                dir: i
            };
        }
    });

    return out;
}

function checkEnd(){
    let isEnd = true;
    g_game_data.state.boxes.forEach((ys) => {
        ys.forEach((v) => {
            if(v < 0)   isEnd = false;
        });
    });
    g_game_data.state.end_flag = isEnd;
}

function setFillColor(ctx, color){
    ctx.fillStyle = color;
}

function setStrokeColor(ctx, color){
    ctx.strokeStyle = color;
}

function getTextSize(ctx, text){
    let measure = ctx.measureText(text);

    return {
        width: measure.width,
        height: measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent
    };
}

function clearScreen(ctx){
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, g_game_data.c_w, g_game_data.c_h);
}

function drawGameInfo(ctx){
    let x, y, size, text, score;

    score = g_game_data.state.score;
    
    // Player 0 score
    text = score[0].toString();
    x = g_game_data.board_left;
    y = g_game_data.board_top - 10;
    setFillColor(ctx, g_setting.player_color[0]);
    ctx.fillText(text, x, y);

    // Player 1 score
    text = score[1].toString();
    size = getTextSize(ctx, text);
    x = g_game_data.c_w - g_game_data.board_left - size.width;
    setFillColor(ctx, g_setting.player_color[1]);
    ctx.fillText(text, x, y);

    // Turn
    if(g_game_data.state.end_flag){
        text = "かち";
        setFillColor(ctx, g_setting.player_color[Number(score[0] < score[1])]);
    }else{
        text = "ターン";
        setFillColor(ctx, g_setting.player_color[g_game_data.state.turn]);
    }
    size = getTextSize(ctx, text);
    x = (g_game_data.c_w - size.width) / 2;
    ctx.fillText(text, x, y);
}

function drawLinesBox(ctx, x, y, w, h){
    let interval = g_setting.paint_line_interval;

    for(let i = interval; i <= (w + h); i += interval){
        ctx.beginPath();
        
        if(i < w)   ctx.moveTo(x + i, y);
        else        ctx.moveTo(x + w, y + (i - w));

        if(i < h)   ctx.lineTo(x, y + i);
        else        ctx.lineTo(x + (i - h), y + h);

        ctx.stroke();
    }
}

function drawDots(ctx){
    for(let i = 0; i < g_setting.boxes_num_h + 1; i++){
        for(let j = 0; j < g_setting.boxes_num_w + 1; j++){
            let x = g_game_data.board_left + g_game_data.box_size * j;
            let y = g_game_data.board_top + g_game_data.box_size * i;
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2*Math.PI);
            ctx.fill();
        }
    }
}

function drawBoxes(ctx){
    ctx.beginPath();
    for(let i = 0; i < g_setting.boxes_num_h; i++){
        for(let j = 0; j < g_setting.boxes_num_w; j++){
            let x = g_game_data.board_left + (g_game_data.box_size * j);
            let y = g_game_data.board_top + (g_game_data.box_size * i);
            let box_state = g_game_data.state.boxes[j][i];

            if(box_state >= 0){
                setStrokeColor(ctx, g_setting.player_color[box_state]);
                drawLinesBox(ctx, x, y, g_game_data.box_size, g_game_data.box_size);
            }
        }
    }
    ctx.stroke();
}

function drawLines(ctx){
    g_game_data.state.lines.forEach((ys, x) => {
        ys.forEach((ls, y) => {
            ls.forEach((v, i) =>{
                if((x === g_game_data.state.lines.length - 1 && i === 0)
                || (y === g_game_data.state.lines[0].length - 1 && i === 1)){
                    return;
                }

                let s_p = Array(2);
                let e_p = Array(2);
                let offsets = [g_game_data.board_left, g_game_data.board_top];

                s_p[0] = g_game_data.board_left + (g_game_data.box_size * x);
                s_p[1] = g_game_data.board_top + (g_game_data.box_size * y);
                e_p[i] = s_p[i] + g_game_data.box_size;
                e_p[1-i] = s_p[1-i];
        
                setFillColor(ctx, [g_setting.non_line_color, ...g_setting.player_color][v + 1]);

                let l_p = Array(2);
                let l_size = Array(2);
                let half_thickness = [g_setting.non_line_half_thickness, g_setting.line_half_thickness][Number(Boolean(v + 1))];
                l_p[i] = s_p[i];
                l_p[1-i] = s_p[1-i] - half_thickness;
                l_size[i] = e_p[i] - s_p[i];
                l_size[1-i] = half_thickness * 2;

                ctx.fillRect(...l_p, ...l_size);
            });
        });
    });
}

function initParams(){
    g_game_data.box_size = g_game_data.c_w * (g_setting.box_size/100);
    g_game_data.board_left = g_game_data.c_w / 2 - g_game_data.box_size * (g_setting.boxes_num_w / 2);
    g_game_data.board_top = g_game_data.c_h / 2 - g_game_data.box_size * (g_setting.boxes_num_h / 2);

    g_game_data.state.boxes = [];
    g_game_data.state.lines = [];
    for(let i = 0; i < g_setting.boxes_num_w + 1; i++){
        g_game_data.state.boxes.push([]);
        g_game_data.state.lines.push([]);
        for(let j = 0; j < g_setting.boxes_num_h + 1; j++){
            g_game_data.state.boxes[i].push(-1);
            g_game_data.state.lines[i].push([-1, -1]);
        }
        g_game_data.state.boxes[i].pop();
    }
    g_game_data.state.boxes.pop();

    g_game_data.state.score = [0, 0];
}

function update(){
    let back_canvas = document.createElement("canvas");
    let back_ctx = back_canvas.getContext("2d");
    let back_img_data;

    back_canvas.width = g_game_data.c_w;
    back_canvas.height = g_game_data.c_h;

    g_game_data.back_ctx = back_ctx;

    clearScreen(back_ctx);
    drawBoxes(back_ctx);
    drawLines(back_ctx);
    
    setFillColor(back_ctx, "#000000");
    drawDots(back_ctx);

    back_ctx.font = g_setting.font;
    setFillColor(back_ctx, g_setting.player_color[g_game_data.state.turn]);
    drawGameInfo(back_ctx);

    g_gen.next();

    back_img_data = back_ctx.getImageData(0, 0, g_game_data.c_w, g_game_data.c_h);
    g_game_data.ctx.putImageData(back_img_data, 0, 0);

    requestAnimationFrame(update);
}

window.onload = () => {
    let canvas = document.getElementById("gameCanvas");
    g_game_data.ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 10;
    g_game_data.c_w = canvas.width;
    g_game_data.c_h = canvas.height;

    initParams();

    canvas.addEventListener("mousemove", (e) => {
        g_game_data.state.mouse_x = e.clientX;
        g_game_data.state.mouse_y = e.clientY;
    });
    canvas.addEventListener("click", (e) => {
        let p;
        if(p = getClickLine(e.clientX, e.clientY)){
            if(g_game_data.state.lines[p.s_x][p.s_y][p.dir] < 0){
                g_game_data.state.lines[p.s_x][p.s_y][p.dir] = g_game_data.state.turn;

                let boxes = checkBox(p.s_x, p.s_y, p.dir);
                if(boxes.length > 0){
                    boxes.forEach((v) => {
                        g_game_data.state.boxes[v.x][v.y] = g_game_data.state.turn;
                    });

                    checkEnd();

                    g_game_data.state.score[g_game_data.state.turn]++;
                }else{
                    g_game_data.state.turn = 1 - g_game_data.state.turn;
                }
            }
        }
    });
    update();
};