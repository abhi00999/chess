import { useEffect, useState } from "react";
import { Button } from "../components/Button";
import { ChessBoard } from "../components/ChessBoard"
import { useSocket } from "../hooks/useSocket"
import { Chess } from "chess.js";

//TODo: Move Together, there is code repetition
export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over";

export const Game = () => {
    const socket = useSocket();
    const [chess, setChess] = useState(new Chess())
    const [board, setBoard] = useState(board.board());

    useEffect(()=>{
        if(!socket) return;

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            console.log(message)
            switch(message.type) {
                case INIT_GAME:
                    setChess(new Chess());
                    setBoard(chess.board());
                    console.log("game initialized")
                    break;

                case MOVE:
                    const move = message.payload;
                    chess.move(move);
                    setBoard(chess.board());
                    console.log("Move made")
                    break;
                
                case GAME_OVER:
                    console.log("Game Over")
                    break;
            }
        }
    },[socket])

    if(!socket) return <div>Connecting...</div>

    return <div className="flex justify-center">
        <div className="pt-8 max-w-screen-lg">
            <div className="grid grid-cols-6 gap-4">
                <div className="col-span-4 bg-red-200">
                    <ChessBoard board = {board} />
                </div>
                <div className="col-span-2 bg-green-200">
                    <Button onClick(()=>{
                        socket.send(JSON.stringify({
                            type: INIT_GAME
                        }))
                    })>
                        Play
                    </Button>
                </div>

            </div>
        </div>
        
    </div>
}