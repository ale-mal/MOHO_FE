import { createSignal } from "solid-js";

const [searching, setSearching] = createSignal(false);
const [username, setUsername] = createSignal("");

export { searching, setSearching, username, setUsername };