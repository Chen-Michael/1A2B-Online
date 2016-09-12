import { Component, OnInit, ElementRef, AfterViewInit, ViewChild, Renderer, Directive, Input } from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';
import * as io from 'socket.io-client';


@Component({
    selector: 'my-app',
    templateUrl: 'app/app.component.html',
    styleUrls: ['app/app.component.css']
})

export class AppComponent implements OnInit {
    private acc: string;
    private pas: string;
    private err: string;
    private socket;
    private isLogin: boolean = false;
    private game: any;
    private user: Array<string> = [];
    private nowPlayer: number = 0;
    private myTurn: boolean = false;
    private answer: string = "";
    private myHighlight: string = "";
    
    constructor(private el:ElementRef) {}
  
    ngOnInit(): void {
        this.socket = io.connect("127.0.0.1:25041");
        
        this.socket.on("login_fail", function(){
            this.err = "登入失敗";
        }.bind(this));
        
        this.socket.on("repeat_login", function(){
            this.err = "重複登入";
        }.bind(this));
        
        this.socket.on("login_success", function(){
            this.err = "";
            this.socket.emit("getGame", {});
        }.bind(this));
        
        this.socket.on("game_info", function(data){
            this.game = data;
            this.isLogin = true;
        }.bind(this));
        
        this.socket.on("update_player", function(data){
            this.user = data;
        }.bind(this));
        
        this.socket.on("update_answer", function(data){
            this.game.history.push(data);
            setTimeout(function(){
                $("#history_div").scrollTop($("#history_div table").height());
            }, 200);
        }.bind(this));
        
        this.socket.on("correct", function(){
            this.socket.emit("getGame", {});
        }.bind(this));
        
        this.socket.on("now_player", function(data){
            this.nowPlayer = data;
        }.bind(this));
        
        this.socket.on("assign", function(){
            this.myTurn = true;
            setTimeout(()=>$("#answer_input").focus(), 500);
        }.bind(this));
        
        this.socket.on("logout", function(){
            this.isLogin = false;
        }.bind(this));
    }
    
    login(): void {
        this.socket.emit("login", {"account": this.acc, "password": this.pas});
    }
    
    send(): void {
        if (this.answer.toString().length != this.game.level){
            alert("字數不足");
            return;
        }
        this.socket.emit("answer", {"answer": this.answer.toString().split("")});
        this.answer = "";
        this.myTurn = false;
    }
    
    keypressEvent(event) {
        if (event.keyCode == 13){
            this.send();
            return;
        }
        if (this.answer.toString().length == this.game.level) return false;
        return event.keyCode > 47 && event.keyCode < 58;
    } 
}