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
          :locale="{ emptyText: `No history data` }"
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
      @ok="SaveFeatureColor"
      @cancel="handleCancel"
      title="Set Feature Color"
      ok-text="OK"
      cancel-text="Cancel"
      :width="320"
      :maskClosable="false"
      :mask="false"
      :centered="true"
      :getContainer="() => $refs.wrap"
    >
      <a-form>
        <a-form-item label="Select Color" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" class="color-picker">
          <colorPicker :color="colorValue" @updateColor="updateColor" :format="'rgb'"></colorPicker>
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
import colorPicker from "../../components/colorPicker.vue";
import Modal from "../../components/Modal.vue";

const props = defineProps<{
  loader: any;
  canvas: HTMLCanvasElement;
}>();

const colorValue = ref("rgba(255,0,0,1)");
const componentList = ref<Array<{}>>([]);
const visible = ref(false);
const featureId = ref<any>(undefined);

function updateColor(data: string) {
  colorValue.value = data;
}

async function onCanvasClick(event: MouseEvent) {
  const rect = props.canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  try {
    const json = await props.loader.interface.pick({ position: new Vector2(x, y) });
    if (json != undefined) {
      console.log("Feature id", json.id);
      featureId.value = json.id;
      visible.value = true;
    }
  } catch (e) {
    console.error(e);
  }
}

function onDelete(data: any, index: number) {
  componentList.value.splice(index, 1);
  props.loader.interface.setColor({
    featureIds: data.id,
    color: "rgb(255, 255, 255)",
  });
}

async function SaveFeatureColor() {
  await props.loader.interface.setColor({
    featureIds: featureId.value,
    color: colorValue.value,
    type: 1,
  });
  let haveList = componentList.value.findIndex((item: any) => item.id == featureId.value);
  haveList == -1
    ? componentList.value.push({
        id: featureId.value,
        color: colorValue.value,
      })
    : ((componentList.value[haveList] as any).color = colorValue.value);
  visible.value = false;
}

function handleCancel() {
  visible.value = false;
}

function DeleteAll() {
  componentList.value.forEach((item: any) => {
    props.loader.interface.setColor({
      featureIds: item.id,
      color: "rgb(255, 255, 255)",
    });
  });
  componentList.value = [];
}

onMounted(() => {
  message.open({
    content: "Please click to pick a feature",
    duration: 2,
  });
  props.canvas.addEventListener("click", onCanvasClick);
});

onBeforeUnmount(() => {
  componentList.value.forEach((item: any) => {
    props.loader.interface.setColor({
      featureIds: item.id,
      color: "rgb(255, 255, 255)",
    });
  });
  props.canvas.removeEventListener("click", onCanvasClick);
});
</script>

<style scoped lang="less">
.color-picker {
  /deep/.color_picker_wrapper {
    z-index: 99999;
    position: absolute;
    top: 32px;

    .color-type:not(.color-type ~ .color-type) {
      display: none;
    }

    .colors {
      display: none;
    }
  }

  .ant-input {
    width: 76% !important;
    margin-right: 4%;
  }

  .color-card {
    width: 32px;
    height: 32px;
    border: 1px solid #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: relative;

    span {
      width: 24px;
      height: 24px;
      display: inline-block;
      background: #fff;
    }
  }
}
</style>
