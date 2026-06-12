<template>
  <div class="color-picker-box">
    <a-input v-model:value="pureColor" />
    <color-picker
      v-model:pureColor="pureColor"
      :format="props.format"
      useType="pure"
      pickerType="chrome"
      :disableHistory="true"
      v-model:gradientColor="gradientColor"
      @pureColorChange="pureColorChange"
      :disableAlpha="pureAlpha"
    />
  </div>
</template>

<script setup lang="ts">
// npm install vue3-colorpicker
import { ColorPicker } from "vue3-colorpicker";
import "vue3-colorpicker/style.css";

// 定义Props接口，描述组件的属性
interface Props {
  color?: string;
  disableAlpha?: boolean;
}

// 设置props的默认值
const props = withDefaults(defineProps<Props>(), {
  color: "#ffffff",
  format: "hex6",
  disableAlpha: false,
});

const pureColor = ref(props.color);
const pureAlpha = ref(props.disableAlpha);
const gradientColor = ref(
  "linear-gradient(0deg, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 100%)"
);
const emit = defineEmits(["updateColor"]);
// 监听props的变化
watch(
  () => props.color,
  (newValue) => {
    pureColor.value = newValue;
  }
);
function pureColorChange(value) {
  emit("updateColor", value);
}

// 创建emit函数，用于触发自定义事件
</script>

<style scoped lang="less">
.color-picker-box {
  display: flex;

  .ant-input {
    width: calc(100% - 40px) !important;
    margin-right: 8px;
    border-radius: 3px;
    background: transparent;
    color: #fff;
  }

  /deep/.vc-color-wrap {
    margin: 0;
    width: 32px;
    height: 32px;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #d9d9d9;
    background: transparent;

    .current-color {
      width: calc(100% - 8px);
      height: calc(100% - 8px);
      padding: 5px;
    }
  }
}
</style>
