const g_setting = {
    back_color: "#00FFFF",
    coin_r: 20,
    coin_speed: 2,
    coin_throw_height: 500,
    coin_color: "#BF8624",
    hako_width: 500,
    hako_height: 300,
    hako_color: "#BF5724",
    hako_top_color: "#8D3200",
    nawa_max_shake: 10,
    nawa_time_interval: 200,
    coin_to_nawa_interval: 500
};

let g_data = {
    ctx: 0,
    c_w: 0,
    c_h: 0,
    gen: function* (){}(),
    nawa_thickness: 0,
    nawa_n: 0,
    state: {
        coin_th: 0,
        coin_hidden: true,
        nawa_offset: 0,
        nawa_x: 0,
    }
};

function* genThrowCoin(){
    g_data.state.coin_hidden = false;
    g_data.state.coin_th = 0;
    while(g_data.state.coin_th < 130){
        g_data.state.coin_th += g_setting.coin_speed;
        yield;
    }
    g_data.state.coin_hidden = true;


    let last_time = Date.now();
    while((Date.now() - last_time) <= g_setting.coin_to_nawa_interval){
        yield
    }

    shakeNawa();
}

function* genShakeNawa(){
    let last_time = Date.now();
    let time_interval = g_setting.nawa_time_interval;
    let count = 0;
    let max_count = g_setting.nawa_max_shake;

    setRandomNawaX();
    while(count < max_count){
        if((Date.now() - last_time) >= time_interval){
            last_time = Date.now();
            setRandomNawaX();
            count++;
        }
        yield;
    }

    for(let i = 0; i < 3;){
        if((Date.now() - last_time) >= time_interval){
            last_time = Date.now();
            g_data.state.nawa_x.forEach((v, i, arr) => {
                g_data.state.nawa_x[i] /= 2;
            });
            i++;
        }
        yield;
    }

    g_data.state.nawa_x.fill(0);
}

function setRandomNawaX(){
    g_data.nawa_x = Array(g_data.nawa_n);
    for(let i = 0; i < g_data.nawa_n; i++){
        g_data.state.nawa_x[i] = (g_data.nawa_thickness * Math.random()) - (g_data.nawa_thickness / 4);
    }
}

function getTextSize(text){
    let measure = g_data.ctx.measureText(text);
    return {
        width: measure.width,
        height: measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent
    };
}

function throwCoin(){
    g_data.gen = genThrowCoin();
}

function shakeNawa(){
    g_data.gen = genShakeNawa();
}

function cls(){
    g_data.ctx.fillStyle = g_setting.back_color;
    g_data.ctx.fillRect(0, 0, g_data.c_w, g_data.c_h);
}
function drawCircle(x, y, r, color){
    g_data.ctx.fillStyle = color;
    g_data.ctx.beginPath();
    g_data.ctx.arc(x, y, r, 0, Math.PI * 2);
    g_data.ctx.fill();
}

function drawCoin(){
    let x = g_data.c_w / 2;
    let y = g_data.c_h * 0.95 - Math.sin(g_data.state.coin_th * (Math.PI / 180)) * g_setting.coin_throw_height;
console.log(y);
    drawCircle(x, y, g_setting.coin_r, g_setting.coin_color);
    drawCircle(x, y, g_setting.coin_r * 0.25, "#FFFFFF");
}

function drawSaisenbako(){
    let top_height = g_setting.hako_height * 0.2;
    let x2 = (g_data.c_w - g_setting.hako_width) / 2;
    let x1 = x2 + g_setting.hako_width * 0.2;
    let y1 = g_data.c_h - (g_data.c_h - g_setting.hako_height) / 3 * 2;
    let y2 = y1 + top_height;
    let asi_width = g_setting.hako_width * 0.1;
    let asi_height = g_setting.hako_height * 0.1;
    let text = "賽銭";
    let text_size = getTextSize(text);

    g_data.ctx.fillStyle = g_setting.hako_color;
    g_data.ctx.fillRect(x2, y2 - 1, g_setting.hako_width, g_setting.hako_height - top_height);

    g_data.ctx.fillStyle = g_setting.hako_top_color;
    g_data.ctx.beginPath();
    g_data.ctx.moveTo(x1, y1);
    g_data.ctx.lineTo(x2 + g_setting.hako_width - (x1 - x2), y1);
    g_data.ctx.lineTo(x2 + g_setting.hako_width, y2);
    g_data.ctx.lineTo(x2, y2);
    g_data.ctx.lineTo(x1, y1);
    g_data.ctx.fill();

    g_data.ctx.fillStyle = "#C27924";
    g_data.ctx.fillRect(x1 + 5, y1 + 10, g_setting.hako_width - (x1 - x2) * 2 - 10, 10);
    g_data.ctx.fillRect(x2 + (x1 - x2) * 0.75 + 5, y1 + 10 + top_height * 0.25, g_setting.hako_width - (x1 - x2) * 0.75 * 2 - 10, 10);
    g_data.ctx.fillRect(x2 + (x1 - x2) * 0.5  + 5, y1 + 10 + top_height * 0.5 , g_setting.hako_width - (x1 - x2) * 0.5 * 2 - 10, 10);

    g_data.ctx.fillStyle = g_setting.back_color;
    g_data.ctx.fillRect(
        x2 + asi_width,
        y1 + g_setting.hako_height - asi_height,
        g_setting.hako_width - asi_width * 2,
        asi_height + 1
    );

    // 賽銭
    g_data.ctx.fillStyle = "#DDDDDD";
    g_data.ctx.fillText(
        text,
        x2 + (g_setting.hako_width - text_size.width) / 2,
        y2 + (g_setting.hako_height - top_height - asi_height + text_size.height) / 2
    );
}

function drawKane(){
    let nawa_x = (g_data.c_w / 2) + (g_data.c_w * 0.125);
    let kane_r = g_data.nawa_thickness * 1.05;
    let kane_x = nawa_x + g_data.nawa_thickness;
    let kane_y = kane_r * 0.75;

    // 縄
    for(let i = g_data.nawa_n - 1; i >= 0; i--){
        let c_x = nawa_x + g_data.state.nawa_x[i];
        let c_y = (g_data.nawa_thickness / 2) * i;

        drawCircle(c_x, c_y, g_data.nawa_thickness / 2, ["#FF0000", "#FFFFFF"][i % 2]);
    }

    // 鐘
    drawCircle(kane_x, kane_y, kane_r, "#FF9F00");
    //drawCircle(kane_x + (kane_r * 0.3), kane_y + (kane_r * 0.5), kane_r / 3, "#E38100");
    //drawCircle(kane_x - (kane_r * 0.75) * 0.75, kane_y - (kane_r * 0.75) * 0.3, kane_r * 0.75, "#F39F00");
}

function initParam(){
    g_data.nawa_thickness = g_data.c_w * 0.05;
    g_data.nawa_n = Math.floor(g_data.c_h * 0.5 / (g_data.nawa_thickness / 2));
    g_data.state.nawa_x = Array(g_data.nawa_n).fill(0);
}

function update(){
    cls();
    drawSaisenbako();
    drawKane();
    if(!g_data.state.coin_hidden)    drawCoin();
    g_data.gen.next();
    requestAnimationFrame(update);
}

window.onload = () => {
    let canvas = document.getElementById("mainCanvas");
    g_data.ctx = canvas.getContext("2d");

    canvas.width = document.documentElement.clientWidth - 10;
    canvas.height = document.documentElement.clientHeight - 10;

    g_data.c_w = canvas.width;
    g_data.c_h = canvas.height;

    canvas.addEventListener("click", (e) => {
        if(g_data.state.coin_hidden)    throwCoin();
    });
    
    g_data.ctx.font = "150px arial";
    initParam();
    requestAnimationFrame(update);
};