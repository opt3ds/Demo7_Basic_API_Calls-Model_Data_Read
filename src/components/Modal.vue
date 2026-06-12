<template>
  <a-modal class="drag-model" ref="modalRef" :open="props.visible" :wrap-style="{ overflow: 'hidden' }" @ok="handleOk" :mask-closable="maskClosable" :centered="props.centered" :footer="props.footer"
    @cancel="handleCancel" :confirm-loading="props.confirmLoading" :destroyOnClose="props.destroyOnClose" :width="props.width">
    <slot></slot>
    <template #title>
      <div ref="modalTitleRef" style="width: 100%; cursor: move">{{ props.title }}</div>
    </template>

    <template #modalRender="{ originVNode }">
      <div>
        <component :is="originVNode" />
      </div>
    </template>
  </a-modal>
</template>
<script lang="ts" setup>
import { computed, CSSProperties, ref, watch, watchEffect } from "vue";
import { useDraggable } from "@vueuse/core";

// Define Props interface to describe component properties
interface Props {
  title?: string; // Dialog title, defaults to "Tip"
  footer?: null; // Dialog footer, defaults to null
  visible: boolean; // Whether the dialog is visible
  confirmLoading?: boolean; // Whether the confirm button is in loading state, defaults to false
  destroyOnClose?: boolean; // Whether to destroy the component when the dialog is closed, defaults to false
  maskClosable?: boolean; // Whether the dialog can be closed by clicking the mask layer, defaults to false
  centered?: boolean; // Whether the dialog is centered, defaults to false
  width?: number;
}

// 设置props的默认值
const props = withDefaults(defineProps<Props>(), {
  title: "Tip",
  visible: false,
  destroyOnClose: false,
  maskClosable: false,
  width: 350,
});

// Create ref reference modalTitleRef to reference the title element in the component
const modalTitleRef = ref<HTMLElement | null | any>(null);

// Use useDraggable hook to get drag-related properties
const { x, y, isDragging } = useDraggable(modalTitleRef);

// Create emit function to trigger custom events
const emit = defineEmits(["ok", "update:visible", "cancel"]);

// Function to handle ok event
const handleOk = (e: MouseEvent) => {
  emit("ok");
};

// Function to handle cancel event
const handleCancel = () => {
  emit("update:visible", false);
  emit("cancel");
};
const leftFixed = ref(0);
leftFixed.value = props.width / 2;

// Create various reactive data
const startX = ref<number>(0); // Record the x coordinate of the starting point
const startY = ref<number>(0); // Record the y coordinate of the starting point
const startedDrag = ref(false); // Flag indicating whether dragging has started, defaults to false
const transformX = ref(0); // x offset
const transformY = ref(0); // y offset
const preTransformX = ref(0); // x offset before dragging
const preTransformY = ref(0); // y offset before dragging
const dragRect = ref({
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
}); // Draggable boundaries

// Watch for changes in x and y
watch([x, y], () => {
  // Function to watch for mouse movement
  if (!startedDrag.value) {
    // If dragging has not started yet
    startX.value = x.value; // Record the x coordinate of the starting point
    startY.value = y.value; // Record the y coordinate of the starting point
    const bodyRect = document.body.getBoundingClientRect(); // Get the boundary information of the page body element
    const titleRect = modalTitleRef.value.getBoundingClientRect(); // Get the boundary information of the modalTitle element
    dragRect.value.right = bodyRect.width - titleRect.width; // Calculate the maximum draggable right boundary
    dragRect.value.bottom = bodyRect.height - titleRect.height; // Calculate the maximum draggable bottom boundary
    preTransformX.value = transformX.value; // Record the x offset before dragging
    preTransformY.value = transformY.value; // Record the y offset before dragging
  }
  startedDrag.value = true; // Set the flag indicating dragging has started
});

// Watch for changes in isDragging
watch(isDragging, () => {
  // Watch for changes in the isDragging variable
  if (!isDragging) {
    // If isDragging becomes false
    startedDrag.value = false; // Set startedDrag.value to false, indicating the drag operation has ended
  }
});

// Use watchEffect to watch for changes in reactive data
watchEffect(() => {
  // Respond to changes in startedDrag.value
  if (startedDrag.value) {
    // If startedDrag.value is true, indicating a drag operation is in progress
    transformX.value = // Calculate x offset
      preTransformX.value +
      Math.min(Math.max(dragRect.value.left, x.value), dragRect.value.right) -
      startX.value;
    transformY.value = // Calculate y offset
      preTransformY.value +
      Math.min(Math.max(dragRect.value.top, y.value), dragRect.value.bottom) -
      startY.value;
    const dragDom = ref<HTMLElement | null | any>(
      document.querySelector(".ant-modal-wrap")
    );
    dragDom.value.style.transform = transformStyle.value.transform;
  }
});

// Calculate transformStyle for dynamically setting the dialog position
const transformStyle = computed<CSSProperties>(() => {
  return {
    transform: `translate(calc(-50% + ${transformX.value}px),calc(-50% + ${transformY.value}px))`,
  };
});
</script>
<style lang="less">
.ant-modal-root {
  .ant-modal-wrap {
    right: unset;
    bottom: unset;
    top: 50%;
    left: 50%;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    overflow: unset;
    z-index: 1020;

    .drag-model {
      transform-origin: 50% 50% !important;
      padding: 0;
      top: 0 !important;
    }
    .ant-modal-confirm {
      top: 0;
    }
  }
}
</style>