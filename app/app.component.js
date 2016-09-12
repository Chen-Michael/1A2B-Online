"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var io = require('socket.io-client');
var AppComponent = (function () {
    function AppComponent(el) {
        this.el = el;
        this.isLogin = false;
        this.user = [];
        this.nowPlayer = 0;
        this.myTurn = false;
        this.answer = "";
        this.myHighlight = "";
    }
    AppComponent.prototype.ngOnInit = function () {
        this.socket = io.connect("127.0.0.1:25041");
        this.socket.on("login_fail", function () {
            this.err = "登入失敗";
        }.bind(this));
        this.socket.on("repeat_login", function () {
            this.err = "重複登入";
        }.bind(this));
        this.socket.on("login_success", function () {
            this.err = "";
            this.socket.emit("getGame", {});
        }.bind(this));
        this.socket.on("game_info", function (data) {
            this.game = data;
            this.isLogin = true;
        }.bind(this));
        this.socket.on("update_player", function (data) {
            this.user = data;
        }.bind(this));
        this.socket.on("update_answer", function (data) {
            this.game.history.push(data);
            setTimeout(function () {
                $("#history_div").scrollTop($("#history_div table").height());
            }, 200);
        }.bind(this));
        this.socket.on("correct", function () {
            this.socket.emit("getGame", {});
        }.bind(this));
        this.socket.on("now_player", function (data) {
            this.nowPlayer = data;
        }.bind(this));
        this.socket.on("assign", function () {
            this.myTurn = true;
            setTimeout(function () { return $("#answer_input").focus(); }, 500);
        }.bind(this));
        this.socket.on("logout", function () {
            this.isLogin = false;
        }.bind(this));
    };
    AppComponent.prototype.login = function () {
        this.socket.emit("login", { "account": this.acc, "password": this.pas });
    };
    AppComponent.prototype.send = function () {
        if (this.answer.toString().length != this.game.level) {
            alert("字數不足");
            return;
        }
        this.socket.emit("answer", { "answer": this.answer.toString().split("") });
        this.answer = "";
        this.myTurn = false;
    };
    AppComponent.prototype.keypressEvent = function (event) {
        if (event.keyCode == 13) {
            this.send();
            return;
        }
        if (this.answer.toString().length == this.game.level)
            return false;
        return event.keyCode > 47 && event.keyCode < 58;
    };
    AppComponent = __decorate([
        core_1.Component({
            selector: 'my-app',
            templateUrl: 'app/app.component.html',
            styleUrls: ['app/app.component.css']
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef])
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map