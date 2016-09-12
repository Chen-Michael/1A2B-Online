var express = require("express");
var app = express();
var http = require("http").Server(app).listen(80);
var io = require("socket.io")(25041);
var member = new ( require("./js/member.js") );

/* 玩家資訊 */
var player = {
    list: [],
    socket: {},
    whoIsNow: 0,
    whoIsNext: 0
};

/* 狀態 */
var status = {
    normal: "normal",
    end: "end"
}

/* 遊戲資訊 */
var game = {
    answer: [],
    history: [],
    level: 4,
    status: status.end
};

app.get(["/", "/index.html"], function(req, res){
    res.sendfile("index.html");
});

app.use(express.static("./"));

Array.prototype.shuffle = function() {
    for(var j, x, i = this.length; i; j = parseInt(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
    return this;
};

io.on("connection", function(socket){
    /* 登入 */
    socket.on("login", function(data){
        if (
            data.account == undefined || 
            data.password == undefined || 
            !member.login(data.account, data.password)
        ){
            socket.emit("login_fail");
            return;
        }
        
        if (player["list"].indexOf(data.account) > -1){
            socket.emit("repeat_login");
            return;
        }
        
        player["list"].push(data.account);
        player["socket"][data.account] = socket;
        
        socket.name = data.account;
        socket.emit("login_success");
        notice("update_player", player["list"]);
        
        if (player["list"].length == 1){
            if (game.status == status.end){
                loadGame();
            }else{
                player.whoIsNow = 0;
                player.whoIsNext = 0;
                nextPlayer();
            }
        }else if (player.whoIsNext == 0){
            /* 當下一位是回到第一個玩家的時候，更改為最後新加入的玩家 */
            player.whoIsNext = player["list"].length -1;
        }
    });
    
    /* 遊戲資訊 */
    socket.on("getGame", function () {
        if (socket.name == undefined){
           socket.emit("logout");
           return; 
        } 
        socket.emit("game_info", {level: game.level, history: game.history});
    });
    
    /* 接收答案 */
    socket.on("answer", function (data) {
        if (socket.name == undefined){
           socket.emit("logout");
           return; 
        } 
        // var prev = prevPlayer();
        if (player["list"].indexOf(socket.name) != player.whoIsNow) return;
        if (data.answer != undefined && data.answer.length == game.level && checkAnswer(data.answer)) correct();
        nextPlayer();
    });
    
    /* 斷線 */
    socket.on("disconnect", function () {
        if (socket.name != undefined){
            /* 移除線上名單 */
            var index = player["list"].indexOf(socket.name);
            if (index > -1) player["list"].splice(index, 1);
            if (player["socket"][socket.name] != undefined) delete player["socket"][socket.name];
            /* 通知更新名單 */
            notice("update_player", player["list"]);
            /* 下一位換自己回答加上自己是最後一個，回到第一位玩家 */
            if (index == player.whoIsNext && index == player["list"].length) player.whoIsNext = 0;
            /* 如果斷線時不是剛好自己回答，返回 */
            // if (index != prevPlayer()) return;
            if (index != player.whoIsNow) return;
            /* 因為上面已經移除了斷線玩家，所以減去1剛好是下一位玩家 */
            if (player.whoIsNext > 0) --player.whoIsNext;
            nextPlayer();
        }
    });
    
    /* 載入遊戲 */
    function loadGame(){
        var item = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].shuffle();
        var answer = [];
        for (var i = 0, len = game.level; i < len; i++){
            answer.push(item.shift());
        }
        game.answer = answer;
        game.history = [];
        game.status = status.normal;
        nextPlayer();
    }
    
    /* 下一個玩家 */
    function nextPlayer(){
        notice("now_player", player.whoIsNext);
        player["socket"][ player["list"][player.whoIsNext] ].emit("assign");
        if (player.whoIsNow != player.whoIsNext) player.whoIsNow = player.whoIsNext;
        player.whoIsNext = (player.whoIsNext < player["list"].length -1)? ++player.whoIsNext: 0;
    }
    
    /* 上一個玩家 */
    function prevPlayer(){
        if (player.whoIsNext > 0) return player.whoIsNext -1;
        if (player["list"].length == 1) return 0;
        return player["list"].length -1;
    }
    
    /* 檢查答案 */
    function checkAnswer(answer){
        var a = 0;
        var b = 0;
        answer.forEach(function(value, index, obj){
            if (game["answer"][index] == value){
                ++a;
            }else if (game["answer"].indexOf(value) > -1){
                ++b;
            }
        });
        
        var result = {
            answer: answer.join(""),
            a: a,
            b: b
        };
        
        game.history.push(result);
        notice("update_answer", result);
        
        return a == game.level;
    }
    
    /* 過關 */
    function correct(){
        game.status = status.end;
        notice("correct", {});
        loadGame();
    }
    
    /* 全體廣播 */
    function notice(event, data){
        for (var k in player["socket"]){
            player["socket"][k].emit(event, data);
        }
    }
});