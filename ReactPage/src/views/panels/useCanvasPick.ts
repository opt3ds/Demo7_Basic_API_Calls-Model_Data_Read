import { useEffect, useRef } from "react";

/**
 * Canvas click pick hook
 * Purpose: uniformly bind/unbind the click event for the Three.js canvas and perform cleanup when the panel unmounts.
 * - Bind the click event to the canvas on mount
 * - Remove the event on unmount and perform the restore operation (restore white / clear offset and rotation, etc.)
 *
 * Design rationale: every panel needs to listen for canvas clicks; wrapping it in a hook avoids
 * repeating the useEffect + addEventListener/removeEventListener boilerplate in each panel.
 */
export function useCanvasPick(
  canvas: HTMLCanvasElement,
  onPick: (event: MouseEvent) => void,
  onUnmount?: () => void
) {
  const pickRef = useRef(onPick);
  pickRef.current = onPick;
  const unmountRef = useRef(onUnmount);
  unmountRef.current = onUnmount;

  useEffect(() => {
    const handler = (event: MouseEvent) => pickRef.current(event);
    canvas.addEventListener("click", handler);
    return () => {
      canvas.removeEventListener("click", handler);
      unmountRef.current?.();
    };
  }, [canvas]);
}
