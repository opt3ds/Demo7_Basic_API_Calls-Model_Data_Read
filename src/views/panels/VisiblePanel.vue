<template>
  <a-space class="operate-btn-box">
    <a-button ghost @click="DeleteAll">Delete All</a-button>
  </a-space>
  <div class="side-frame" @contextmenu.prevent="">
    <a-card size="small" :bordered="false" :body-style="{ padding: 0 }">
      <div class="box">
        <a-list
          size="small"
          :data-source="componentList"
          :locale="{ emptyText: `No history` }"
          class="list-box scroll-box"
        >
          <template #renderItem="{ item, index }">
            <a-list-item>
              <a-space>
                <a-switch
                  size="small"
                  v-model:checked="item.isHidden"
                  @change="onChangeHidden($event, item)"
                  checked-children="Show"
                  un-checked-children="Hide"
                />
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { message } from "ant-design-vue";
import { DeleteOutlined } from "@ant-design/icons-vue";
import { Vector2 } from "three";

const props = defineProps<{
  loader: any;
  canvas: HTMLCanvasElement;
}>();

const componentList = ref<Array<{}>>([]);

async function onCanvasClick(event: MouseEvent) {
  const rect = props.canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  try {
    const json = await props.loader.interface.pick({ position: new Vector2(x, y) });
    if (json != undefined) {
      console.log("Component ID", json.id);
      var clickComponent: any = componentList.value.find((e: any) => {
        return e.id === json.id;
      });
      if (clickComponent) {
        clickComponent.isHidden = false;
      } else {
        componentList.value.push({
          id: json.id,
          isHidden: false,
        });
      }
      props.loader.interface.setVisible({
        featureIds: json.id,
        visible: false,
      });
    }
  } catch (e) {
    console.error(e);
  }
}

async function onChangeHidden(event: boolean, data: any) {
  data.isHidden = event;
  await props.loader.interface.setVisible({
    featureIds: data.id,
    visible: event,
  });
}

async function onDelete(data: any, index: number) {
  componentList.value.splice(index, 1);
  await props.loader.interface.setVisible({
    featureIds: data.id,
    visible: true,
  });
}

async function DeleteAll() {
  for (const item of componentList.value) {
    await props.loader.interface.setVisible({
      featureIds: (item as any).id,
      visible: true,
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

<style scoped lang="less">
.list-box {
  max-height: 50vh;

  /deep/.ant-list-item {
    background: transparent;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 4px;
    margin: 0 4px;

    &:hover {
      background: rgba(22, 119, 255, 0.1);
    }

    &:last-child {
      border-bottom: none;
    }
  }

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, rgba(22, 119, 255, 0.5) 0%, rgba(22, 119, 255, 0.25) 100%);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, rgba(22, 119, 255, 0.7) 0%, rgba(22, 119, 255, 0.4) 100%);
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 2px;
  }
}
</style>
