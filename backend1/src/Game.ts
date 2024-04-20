import { WebSocket } from "ws";
import { Chess } from "chess.js";
import { GAME_OVER, INIT_GAME, MOVE } from "./messages";

export class Game {
    public player1: WebSocket;
    public player2: WebSocket;
    public board: Chess;
    public startTime: Date;
    private moveCount = 0;


    constructor(player1: WebSocket, player2: WebSocket){
        this.player1 = player1;
        this.player2 = player2;
        this.board = new Chess();
        this.startTime = new Date();
        this.player1.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: "white"
            } 
        }))
        this.player2.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: "black"
            } 
        }));
    }

    makeMove(socket: WebSocket, move: {
        from: string;
        to: string;
    }){
        //validation here
        //is it this users move
        if(this.moveCount % 2 === 0 && socket != this.player1){
            return;
        }
        if(this.moveCount % 2 === 1 && socket != this.player1){
            return;
        }

        //above if statements not needed, as everything is done chess.js library 
        //i.e.validate the type of move using zod as follows
        try{
            this.board.move(move);
        } catch (e) {
            return; 
        }

        //Update the board
        //Push the move 
        //Both Done by library

        //Check if the game is over then send message to both the players
        if(this.board.isGameOver()){
            this.player1.send(JSON.stringify({
                type: GAME_OVER,
                payload: {
                    winner: this.board.turn() === "w" ? "black" : "white"
                } 
            }));
            this.player2.send(JSON.stringify({
                type: GAME_OVER,
                payload: {
                    winner: this.board.turn() === "w" ? "black" : "white"
                } 
            }));
            return;
        }

        // if not then send the updated board to both players
        if( this.board.moves().length % 2 === 0){
            this.player2.send(JSON.stringify({
                type: MOVE,
                payload: move
            }))
        } else {
            this.player1.send(JSON.stringify({
                type: MOVE,
                payload: move
            }))
        }
        this.moveCount++;
    }
}