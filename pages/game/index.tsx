import { useState, useEffect } from "react";
import { Socket } from "socket.io-client";
import { useSocket } from "../../hooks/useSocket";
import styles from "../../styles/Game.module.css";
import Image from "next/image";

interface User {
  username: string;
  position: number | null;
  score: number;
  alive: boolean;
}

const TOTAL_BOXES = 4;

export default function Game() {
  const socket: Socket | null = useSocket();

  const [username, setUsername] = useState<string>("");
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [timer, setTimer] = useState<number>(100);
  const [eliminationBox, setEliminationBox] = useState<number | null>(null);

  useEffect(() => {
    if (!socket) return;

    // Join game setelah login
    if (loggedIn) {
      socket.emit("joinGame", { username });
    }

    // Terima pembaruan room
    socket.on("roomUpdate", (updatedUsers: Record<string, User>) => {
      setUsers(updatedUsers);
    });

    // Terima pembaruan timer
    socket.on("timer", (currentTimer: number) => {
      setTimer(currentTimer);
    });

    // Terima eliminasi
    socket.on("elimination", ({ boxIndex }: { boxIndex: number }) => {
      setEliminationBox(boxIndex);

      // Hapus eliminasi setelah 5 detik
      setTimeout(() => {
        setEliminationBox(null);
      }, 5000);
    });

    // Tangani error
    socket.on("error", (error: { message: string }) => {
      alert(error.message);
    });

    return () => {
      socket.off("roomUpdate");
      socket.off("timer");
      socket.off("elimination");
      socket.off("error");
    };
  }, [socket, loggedIn, username]);

  const joinGame = () => {
    if (username.trim() && socket) {
      setLoggedIn(true);
    }
  };

  const handleBoxClick = (boxIndex: number) => {
    if (timer > 3 && socket) {
      socket.emit("selectBox", { boxIndex });
    }
  };

  const getPlayersInBox = (boxIndex: number) => {
    return Object.entries(users)
      .filter(([, user]) => user.position === boxIndex && user.alive)
      .map(([, user]) => user.username);
  };

  return (
    <div className={styles.container}>
      {!loggedIn ? (
        <div className={styles.login}>
          <h1>Multiplayer Game</h1>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={joinGame}>Join Game</button>
        </div>
      ) : (
        <div className={styles.game}>
          <div
            style={{
              textAlign: "left",
              fontSize: "3rem",
              color: "white",
              marginBottom: "1rem",
            }}
          >
            Cursed Box Game
          </div>
          <div className={styles.header}>
            <h2>Timer: {timer} s</h2>
          </div>
          <div className={styles.currentPlayer}>
            <h3>Playing as: {username}</h3>
          </div>
          <div className={styles.scores}>
            {Object.values(users).map((user, idx) => (
              <div key={idx} className={styles.score}>
                {user.username}: {user.score}
              </div>
            ))}
          </div>
          <div
            style={{
              textAlign: "left",
              fontSize: "1.5rem",
              color: "white",
              marginBottom: "1rem",
            }}
          >
            Choose one your lucky box and make sure you are not eliminated
          </div>
          <div className={styles.grid}>
            {Array.from({ length: TOTAL_BOXES }).map((_, index) => (
              <div
                key={index}
                className={`${styles.box} ${
                  eliminationBox === index ? styles.elimination : ""
                }`}
                onClick={() => handleBoxClick(index)}
              >
                <div className={styles.players}>
                  <div className={styles.playerGrid}>
                    {getPlayersInBox(index).map((name, idx) => (
                      <div key={idx} className={styles.playerItem}>
                        <Image
                          src={`/player-${
                            Math.floor(Math.random() * 2) + 1
                          }.png`}
                          alt="Player Avatar"
                          className={styles.playerAvatar}
                          width={40}
                          height={40}
                        />
                        <div className={styles.playerName}>{name}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {eliminationBox === index && (
                  <div className={styles.eliminationOverlay}>Eliminated!</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
