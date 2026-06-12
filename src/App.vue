<template>
  <a-config-provider
    :locale="enUS"
    :theme="{
      token: {
        colorPrimary: '#1677ff',
        borderRadius: 2,
      },
      components: {
        Button: {
          colorPrimary: '#1677ff',
          algorithm: true,
        },
        Input: {
          colorPrimary: '#1677ff',
          colorPrimaryHover: '#1677ff',
          algorithm: true,
        },
        Tabs: {
          colorPrimary: '#1677ff',
          itemActiveColor: '#1677ff',
          itemHoverColor: '#1677ff',
          inkBarColor: '#1677ff',
          algorithm: true,
        },
        Select: {
          colorPrimary: '#1677ff',
          optionSelectedBg: '#e6f7ff',
          optionActiveBg: '#e6f7ff',
          algorithm: true,
        },
        Checkbox: {
          colorPrimary: '#1677ff',
          colorBgContainer: '#1677ff',
          algorithm: true,
        },
        Radio: {
          colorPrimary: '#1677ff',
          colorPrimaryBg: '#1677ff',
          buttonSolidCheckedColor: '#fff',
          buttonSolidCheckedBg: '#1677ff',
          buttonSolidCheckedBorderColor: '#1677ff',
          algorithm: true,
        },
        Menu: {
          colorPrimary: '#1677ff',
          itemSelectedBg: '#e6f7ff',
          itemSelectedColor: '#1677ff',
          algorithm: true,
        },
        Tooltip: {
          colorPrimary: '#1677ff',
          algorithm: true,
        },
        Slider: {
          colorPrimary: '#1677ff',
          trackBg: '#1677ff',
          handleColor: '#1677ff',
          algorithm: true,
        },
      }
    }">
    <router-view></router-view>
  </a-config-provider>
</template>

<script setup lang="ts">
import enUS from 'ant-design-vue/es/locale/en_US';
</script>

<style lang="less">
  #app {
    margin: 0;
    padding: 0;
    width: 100vw;
    height: 100vh;
  }
</style>