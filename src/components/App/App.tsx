import { type Component } from 'solid-js';
import Chat from "~/components/Chat/Chat";
import FindButton from "~/components/Find/FindButton";
import {getCID} from "~/utils/utils"

import styles from './App.module.css';

const App: Component = () => {
  let cid = getCID();

  return (
    <div class={styles.App}>
      <h1>Real-time Chat</h1>
      <p>your cid is {cid}</p>
      <FindButton />
      <Chat />
    </div>
  );
};

export default App;
