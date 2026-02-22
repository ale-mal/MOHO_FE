import { InputMessage } from "~/game/types";
import styles from "./GameControls.module.css";

interface Props {
  touchInput: InputMessage;
}

export default function GameControls(props: Props) {
  const { touchInput } = props;

  function makeHandlers(field: keyof InputMessage) {
    return {
      onPointerDown: (e: PointerEvent) => {
        e.preventDefault();
        touchInput[field] = true;
      },
      onPointerUp: (e: PointerEvent) => {
        e.preventDefault();
        touchInput[field] = false;
      },
      onPointerLeave: (e: PointerEvent) => {
        e.preventDefault();
        touchInput[field] = false;
      },
      onPointerCancel: (e: PointerEvent) => {
        e.preventDefault();
        touchInput[field] = false;
      },
    };
  }

  return (
    <div class={styles.controls}>
      <div class={styles.dpad}>
        <button class={styles.btn} {...makeHandlers("left")}>&#8592;</button>
        <button class={styles.btn} {...makeHandlers("right")}>&#8594;</button>
      </div>
      <button class={`${styles.btn} ${styles.jumpBtn}`} {...makeHandlers("jump")}>&#8593;</button>
    </div>
  );
}
