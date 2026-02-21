import { type Component, createSignal, Show } from 'solid-js';
import FindButton from "~/components/Find/FindButton";
import { getCID } from "~/utils/utils";
import { searching } from "~/find/find_state";

import styles from './App.module.css';

const App: Component = () => {
  const cid = getCID();
  const [username, setUsername] = createSignal("");

  return (
    <div class={styles.App}>
      <h1>Find a Game</h1>
      <p>your cid is {cid}</p>
      <input
        type="text"
        placeholder="Username"
        value={username()}
        disabled={searching()}
        onInput={(e) => setUsername(e.currentTarget.value)}
      />
      <Show when={searching()}>
        <p>Searching for a game...</p>
      </Show>
      <FindButton username={username()} />
    </div>
  );
};

export default App;
