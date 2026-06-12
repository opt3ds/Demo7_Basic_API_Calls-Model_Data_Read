<template>
  <a-space class="operate-box">
    <div>X:</div>
    <a-slider v-model:value="formState.xNum" :max="360" :min="0" @afterChange="XRotateChange" />
    <a-input-number
      v-model:value="formState.xNum"
      :min="0"
      :max="360"
      :parser="(value:any) => value.replace('°', '')"
      :disabled="true"
      :formatter="(value) => `${value}°`"
    />
  </a-space>
  <a-space class="operate-box">
    <div>Y:</div>
    <a-slider v-model:value="formState.yNum" :max="360" :min="0" @afterChange="YRotateChange" />
    <a-input-number
      v-model:value="formState.yNum"
      :min="0"
      :max="360"
      :parser="(value:any) => value.replace('°', '')"
      :disabled="true"
      :formatter="(value) => `${value}°`"
    />
  </a-space>
  <a-space class="operate-box">
    <div>Z:</div>
    <a-slider v-model:value="formState.zNum" :max="360" :min="0" @afterChange="ZRotateChange" />
    <a-input-number
      v-model:value="formState.zNum"
      :min="0"
      :max="360"
      :parser="(value:any) => value.replace('°', '')"
      :disabled="true"
      :formatter="(value) => `${value}°`"
    />
  </a-space>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { message } from "ant-design-vue";
import { Vector2 } from "three";

const props = defineProps<{
  loader: any;
  canvas: HTMLCanvasElement;
}>();

const creatFeature = ref<any>();
const FeatureList = ref<Array<{}>>([]);
const originalFrom = ref({
  xNum: 0,
  xTotalNum: 0,
  yNum: 0,
  yTotalNum: 0,
  zNum: 0,
  zTotalNum: 0,
});
const formState = ref(Object.assign({}, originalFrom.value));
const index = ref(0);

async function XRotateChange(value: number) {
  if (Math.abs(value - formState.value.xTotalNum) != 0 && creatFeature.value) {
    await props.loader.interface.rotate({
      featureIds: creatFeature.value,
      x: 1,
      y: 0,
      z: 0,
      angle: Math.abs(value - formState.value.xTotalNum),
    });
    formState.value.xTotalNum = value;
    (FeatureList.value[index.value] as any).data = formState.value;
  }
}

async function YRotateChange(value: number) {
  if (Math.abs(value - formState.value.yTotalNum) != 0 && creatFeature.value) {
    await props.loader.interface.rotate({
      featureIds: creatFeature.value,
      x: 0,
      y: 1,
      z: 0,
      angle: Math.abs(value - formState.value.yTotalNum),
    });
    formState.value.yTotalNum = value;
    (FeatureList.value[index.value] as any).data = formState.value;
  }
}

async function ZRotateChange(value: number) {
  if (Math.abs(value - formState.value.zTotalNum) != 0 && creatFeature.value) {
    await props.loader.interface.rotate({
      featureIds: creatFeature.value,
      x: 0,
      y: 0,
      z: 1,
      angle: Math.abs(value - formState.value.zTotalNum),
    });
    formState.value.zTotalNum = value;
    (FeatureList.value[index.value] as any).data = formState.value;
  }
}

async function onCanvasClick(event: MouseEvent) {
  const rect = props.canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  try {
    const json = await props.loader.interface.pick({ position: new Vector2(x, y) });
    if (json != undefined) {
      console.log("Component ID", json.id);
      if (creatFeature.value) {
        await props.loader.interface.setColor({
          featureIds: creatFeature.value,
          color: "rgb(255, 255, 255)",
        });
      }
      creatFeature.value = json.id;
      await props.loader.interface.setColor({
        featureIds: creatFeature.value,
        color: "rgb(255, 255, 0)",
        type: 1,
      });
      index.value = FeatureList.value.findIndex((item: any) => item.id == json.id);
      if (index.value == -1) {
        let option = {
          id: json.id,
          data: Object.assign({}, originalFrom.value),
        };
        FeatureList.value.push(option);
        index.value = FeatureList.value.length - 1;
        formState.value = {
          xNum: 0,
          xTotalNum: 0,
          yNum: 0,
          yTotalNum: 0,
          zNum: 0,
          zTotalNum: 0,
        };
      } else {
        formState.value = Object.assign(originalFrom.value, (FeatureList.value[index.value] as any).data);
      }
    }
  } catch (e) {
    console.error(e);
  }
}

async function RestoreModel() {
  if (creatFeature.value) {
    await props.loader.interface.setColor({
      featureIds: creatFeature.value,
      color: "rgb(255, 255, 255)",
    });
  }
  for (const item of FeatureList.value) {
    await props.loader.interface.clearRotate({
      featureIds: (item as any).id,
    });
  }
  FeatureList.value = [];
  formState.value = {
    xNum: 0,
    xTotalNum: 0,
    yNum: 0,
    yTotalNum: 0,
    zNum: 0,
    zTotalNum: 0,
  };
}

onMounted(() => {
  message.info("Click to select a component for rotation!");
  props.canvas.addEventListener("click", onCanvasClick);
});

onBeforeUnmount(() => {
  RestoreModel();
  props.canvas.removeEventListener("click", onCanvasClick);
});
</script>

<style scoped lang="less">
.operate-box {
  width: 100%;
  margin: 5px 0;
  /deep/.ant-space-item:nth-child(1) {
    width: 15%;
    text-align: right;
  }

  /deep/.ant-space-item:nth-child(2) {
    width: 55%;

    .ant-slider-rail {
      background-color: rgba(252, 252, 252, 0.24);
    }
  }

  /deep/.ant-space-item:nth-child(3) {
    width: 20%;
  }
}
</style>
