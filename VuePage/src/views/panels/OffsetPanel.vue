<template>
  <a-space class="operate-box">
    <div>X:</div>
    <a-slider v-model:value="formState.xNum" :min="-10" :max="10" @change="XOffsetChange" />
    <a-input-number
      v-model:value="formState.xTotalNum"
      :parser="(value:any) => value.replace('m', '')"
      :disabled="true"
      :formatter="(value) => `${value}m`"
    />
  </a-space>
  <a-space class="operate-box">
    <div>Y:</div>
    <a-slider v-model:value="formState.yNum" :min="-10" :max="10" @change="YOffsetChange" />
    <a-input-number
      v-model:value="formState.yTotalNum"
      :parser="(value:any) => value.replace('m', '')"
      :disabled="true"
      :formatter="(value) => `${value}m`"
    />
  </a-space>
  <a-space class="operate-box">
    <div>Z:</div>
    <a-slider v-model:value="formState.zNum" :min="-10" :max="10" @change="ZOffsetChange" />
    <a-input-number
      v-model:value="formState.zTotalNum"
      :parser="(value:any) => value.replace('m', '')"
      :disabled="true"
      :formatter="(value) => `${value}m`"
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

async function XOffsetChange(value: number) {
  if (creatFeature.value) {
    await props.loader.interface.offset({
      featureIds: creatFeature.value,
      x: value,
      y: 0,
      z: 0,
    });
    formState.value.xTotalNum += value;
    (FeatureList.value[index.value] as any).data = formState.value;
    setTimeout(() => {
      formState.value.xNum = 0;
    }, 100);
  }
}

async function YOffsetChange(value: number) {
  if (creatFeature.value) {
    await props.loader.interface.offset({
      featureIds: creatFeature.value,
      x: 0,
      y: value,
      z: 0,
    });
    formState.value.yTotalNum += value;
    (FeatureList.value[index.value] as any).data = formState.value;
    setTimeout(() => {
      formState.value.yNum = 0;
    }, 100);
  }
}

async function ZOffsetChange(value: number) {
  if (creatFeature.value) {
    await props.loader.interface.offset({
      featureIds: creatFeature.value,
      x: 0,
      y: 0,
      z: value,
    });
    formState.value.zTotalNum += value;
    (FeatureList.value[index.value] as any).data = formState.value;
    setTimeout(() => {
      formState.value.zNum = 0;
    }, 100);
  }
}

async function onCanvasClick(event: MouseEvent) {
  const rect = props.canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  try {
    const json = await props.loader.interface.pick({ position: new Vector2(x, y) });
    if (json != undefined) {
      console.log("Feature id", json.id);
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

async function ClearOperate() {
  if (creatFeature.value) {
    await props.loader.interface.setColor({
      featureIds: creatFeature.value,
      color: "rgb(255, 255, 255)",
    });
  }
  for (const item of FeatureList.value) {
    await props.loader.interface.clearOffset({
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
  message.info("Please click to select the feature to offset!");
  props.canvas.addEventListener("click", onCanvasClick);
});

onBeforeUnmount(() => {
  ClearOperate();
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
