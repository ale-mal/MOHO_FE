import { Show, onMount, onCleanup } from "solid-js";
import { useSearchParams } from "@solidjs/router";
import { username } from "~/find/find_state";
import { getCID } from "~/utils/utils";
import Phaser from "phaser";
import { GameScene } from "~/components/Game/GameScene";
import GameControls from "~/components/Game/GameControls";
import { InputMessage } from "~/game/types";
import { WORLD_WIDTH, WORLD_HEIGHT } from "~/game/constants";
import styles from "./Game.module.css";

export default function Game() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.sessionId;
  let gameContainer!: HTMLDivElement;
  let game: Phaser.Game | undefined;

  const touchInput: InputMessage = { left: false, right: false, jump: false };

  onMount(() => {
    if (!sessionId || !username()) return;

    const cid = getCID() ?? "";
    const wsBaseUrl = import.meta.env.VITE_WEBSOCKET_URL as string;

    game = new Phaser.Game({
      type: Phaser.AUTO,
      width: WORLD_WIDTH,
      height: WORLD_HEIGHT,
      parent: gameContainer,
      backgroundColor: "#1a1a2e",
      scene: [GameScene],
    });

    game.scene.start("GameScene", {
      sessionId,
      cid,
      wsBaseUrl,
      touchInput,
    });
  });

  onCleanup(() => {
    game?.destroy(true);
  });

  return (
    <Show
      when={sessionId && username()}
      fallback={<p>No active game session. Please find a game from the home page.</p>}
    >
      <div class={styles.gameWrapper}>
        <div ref={gameContainer} />
        <GameControls touchInput={touchInput} />
      </div>
    </Show>
  );
}
