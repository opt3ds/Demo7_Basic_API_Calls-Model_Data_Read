/**
 * Draggable modal component
 * - Hold and drag the title bar to move the modal
 * - The modal is rendered into document.body to avoid being confined within the notification panel by the parent transform
 * - Gets the .ant-modal DOM through the modalRender wrapper layer and applies the drag displacement to it
 * - Boundary constraint: the modal will not move out of the viewport
 */
import React, { useEffect, useRef, useState } from "react";
import { Modal } from "antd";

/**
 * Draggable modal (visual style aligned with WebPage/src/components/Modal.vue)
 * - Rendered into document.body: the notification notice-wrapper of antd v5 React carries
 *   will-change/transform; if rendered into the panel like the Vue version, fixed positioning would be confined to
 *   the notification box (the modal would stretch the submenu and scrollbars would appear), so it is mounted to body instead
 * - Hold the title to drag, the modal follows the mouse, and the drag boundary is constrained within the viewport
 * - Locates the .ant-modal element through the modalRender wrapper layer to apply the drag displacement
 */
interface DraggableModalProps {
  open: boolean;
  title?: React.ReactNode;
  width?: number;
  okText?: string;
  cancelText?: string;
  onOk?: () => void;
  onCancel?: () => void;
  centered?: boolean;
  mask?: boolean;
  maskClosable?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const DraggableModal: React.FC<DraggableModalProps> = ({
  open,
  title,
  width = 320,
  okText = "OK",
  cancelText = "Cancel",
  onOk,
  onCancel,
  centered = true,
  mask = false,
  maskClosable = false,
  className,
  children,
}) => {
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const dragRef = useRef(drag);
  dragRef.current = drag;
  const holderRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef({
    active: false,
    startX: 0,
    startY: 0,
    baseX: 0,
    baseY: 0,
  });

  const getModalEl = () =>
    holderRef.current?.querySelector(".ant-modal") as HTMLElement | null;

  // Reset the position when closed
  useEffect(() => {
    if (!open) {
      setDrag({ x: 0, y: 0 });
    }
  }, [open]);

  // Apply the displacement to .ant-modal (transform stacked on top of the centered layout)
  useEffect(() => {
    const el = getModalEl();
    if (!el) return;
    el.style.transform = open ? `translate(${drag.x}px, ${drag.y}px)` : "";
  }, [open, drag]);

  const onTitleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const s = dragState.current;
    s.active = true;
    s.startX = e.clientX;
    s.startY = e.clientY;
    s.baseX = dragRef.current.x;
    s.baseY = dragRef.current.y;

    const onMove = (ev: MouseEvent) => {
      if (!s.active) return;
      const dx = ev.clientX - s.startX;
      const dy = ev.clientY - s.startY;
      let nx = s.baseX + dx;
      let ny = s.baseY + dy;
      // Boundary constraint: keep the modal within the viewport
      const el = getModalEl();
      if (el) {
        const r = el.getBoundingClientRect();
        const W = window.innerWidth;
        const H = window.innerHeight;
        nx = Math.max(8 - W / 2 + r.width / 2, Math.min(nx, W / 2 - r.width / 2 - 8));
        ny = Math.max(8 - H / 2 + r.height / 2, Math.min(ny, H / 2 - r.height / 2 - 8));
      }
      setDrag({ x: nx, y: ny });
    };

    const onUp = () => {
      s.active = false;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  return (
    <Modal
      open={open}
      className={className}
      wrapClassName="set-data-wrap"
      getContainer={() => document.body}
      modalRender={(node) => (
        <div ref={holderRef} style={{ display: "contents" }}>
          {node}
        </div>
      )}
      title={
        <div style={{ width: "100%", cursor: "move" }} onMouseDown={onTitleMouseDown}>
          {title}
        </div>
      }
      width={width}
      centered={centered}
      mask={mask}
      maskClosable={maskClosable}
      okText={okText}
      cancelText={cancelText}
      onOk={onOk}
      onCancel={onCancel}
    >
      {children}
    </Modal>
  );
};

export default DraggableModal;
