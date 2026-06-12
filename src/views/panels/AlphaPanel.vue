<template>
  <div class="side-frame" @contextmenu.prevent="" ref="wrap">
    <a-space class="operate-btn-box">
      <a-button ghost @click="DeleteAll">Delete All</a-button>
    </a-space>
    <a-card size="small" :bordered="false" :body-style="{ padding: 0 }">
      <div class="box">
        <a-list
          size="small"
          :data-source="componentList"
          :locale="{ emptyText: `No history` }"
          class="roam-list scroll-box"
        >
          <template #renderItem="{ item, index }">
            <a-list-item>
              <a-space>
                <div>{{ item.id }}</div>
              </a-space>
              <template #actions>
                <a-tooltip title="Delete">
                  <DeleteOutlined :style="{ fontSize: '16px', color: '#05a081' }" @click="onDelete(item, index)" />
                </a-tooltip>
              </template>
            </a-list-item>
          </template>
        </a-list>
      </div>
    </a-card>
    <Modal
      class="set-data"
      :visible="visible"
      @ok="confirmChange"
      @cancel="handleCancel"
      title="Set Component Opacity"
      ok-text="OK"
      cancel-text="Cancel"
      :width="320"
      :maskClosable="false"
      :mask="false"
      :centered="true"
      :getContainer="() => $refs.wrap"
    >
      <a-form>
        <a-form-item label="Opacity" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
          <a-input-number v-model:value="inputValue" :step="0.1" :min="0" :max="1" />
        </a-form-item>
      </a-form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { message } from "ant-design-vue";
import { DeleteOutlined } from "@ant-design/icons-vue";
import { Vector2 } from "three";
import Modal from "../../components/Modal.vue";

const props = defineProps<{
  loader: any;
  canvas: HTMLCanvasElement;
}>();

const componentList = ref<Array<{}>>([]);
const visible = ref(false);
const inputValue = ref(0.5);
const featureId = ref<any>(undefined);

async function onCanvasClick(event: MouseEvent) {
  const rect = props.canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  try {
    const json = await props.loader.interface.pick({ position: new Vector2(x, y) });
    if (json != undefined) {
      console.log("Component ID", json.id);
      featureId.value = json.id;
      visible.value = true;
    }
  } catch (e) {
    console.error(e);
  }
}

async function onDelete(data: any, index: number) {
  componentList.value.splice(index, 1);
  await props.loader.interface.setAlpha({
    featureIds: data.id,
    alpha: 1,
  });
}

async function confirmChange() {
  await props.loader.interface.setAlpha({
    featureIds: featureId.value,
    alpha: inputValue.value,
  });
  let haveList = componentList.value.findIndex((item: any) => item.id == featureId.value);
  haveList == -1
    ? componentList.value.push({
        id: featureId.value,
        transparent: inputValue.value,
      })
    : ((componentList.value[haveList] as any).transparent = inputValue.value);
  visible.value = false;
}

function handleCancel() {
  visible.value = false;
}

async function DeleteAll() {
  for (const item of componentList.value) {
    await props.loader.interface.setAlpha({
      featureIds: (item as any).id,
      alpha: 1,
    });
  }
  componentList.value = [];
}

onMounted(() => {
  message.open({
    content: "Click to pick a component",
    duration: 2,
  });
  props.canvas.addEventListener("click", onCanvasClick);
});

onBeforeUnmount(() => {
  DeleteAll();
  props.canvas.removeEventListener("click", onCanvasClick);
});
</script>

<style scoped lang="less"></style>
