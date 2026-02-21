import { Show } from "solid-js";
import { useSearchParams } from "@solidjs/router";
import { username } from "~/find/find_state";
import Chat from "~/components/Chat/Chat";

export default function Game() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.sessionId;

  return (
    <Show
      when={sessionId && username()}
      fallback={<p>No active game session. Please find a game from the home page.</p>}
    >
      <Chat sessionId={sessionId!} username={username()} />
    </Show>
  );
}
