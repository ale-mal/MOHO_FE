import {getCID} from "../utils/utils"

export default function Game() {
  let cid = getCID();
  return (
    <div>
      <p>Game</p>
      <p>your cid is {cid}</p>
    </div>
  );
}