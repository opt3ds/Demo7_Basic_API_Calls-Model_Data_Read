<template>
  <div class="attribute-panel" ref="wrapRef">
    <a-tabs v-model:activeKey="tab" size="small" :animated="false" @change="onTabChange" centered>
      <a-tab-pane key="properties" tab="Properties">
        <div class="table-container" v-if="hasData && tableList.length > 0">
          <a-table
            :columns="columns"
            :data-source="tableList"
            bordered
            :pagination="false"
            :showHeader="false"
            size="small"
          />
        </div>
        <div class="empty-tip" v-else>{{ attributeInformation }}</div>
      </a-tab-pane>
      <a-tab-pane key="type" tab="Type">
        <div class="table-container" v-if="hasData && typeTableList.length > 0">
          <a-table
            :columns="columns"
            :data-source="typeTableList"
            bordered
            :pagination="false"
            :showHeader="false"
            size="small"
          />
        </div>
        <div class="empty-tip" v-else>{{ attributeInformation }}</div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { message } from "ant-design-vue";
import { Vector2 } from "three";
import { getPropertiesStation } from "../../api/index";
import { useModelStore } from "../../store/modules/model";

const props = defineProps<{
  loader: any;
  canvas: HTMLCanvasElement;
}>();

const store = useModelStore();
const wrapRef = ref<HTMLDivElement | null>(null);
const tab = ref("properties");
const tableList = ref<any[]>([]);
const typeTableList = ref<any[]>([]);
const attributeInformation = ref("Click to pick a component");
const hasData = ref(false);
const currentFeatureId = ref<string | null>(null);

const columns = [
  {
    dataIndex: "propertyname",
    key: "propertyname",
    customCell: (record: any) => ({
      colSpan: record.isSpace ? 2 : 1,
    }),
    ellipsis: true,
  },
  {
    dataIndex: "value",
    key: "value",
    customCell: (record: any) => ({
      colSpan: record.isSpace ? 0 : 1,
    }),
    ellipsis: true,
  },
];

interface AttributeItem {
  type: string;
  content: any[];
  setName: string[];
}

const attributeList = ref<AttributeItem[]>([]);

function onTabChange(activeKey: string) {
  if (activeKey === "properties") {
    if (attributeList.value[0] && attributeList.value[0].content.length > 0) {
      tableList.value = attributeList.value[0].content;
    } else {
      attributeInformation.value = "No data";
    }
  } else {
    if (attributeList.value[1] && attributeList.value[1].content.length > 0) {
      typeTableList.value = attributeList.value[1].content;
    } else {
      attributeInformation.value = "No data";
    }
  }
}

async function onCanvasClick(event: MouseEvent) {
  const rect = props.canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  try {
    const json = await props.loader.interface.pick({ position: new Vector2(x, y) });
    if (json != undefined) {
      if (currentFeatureId.value) {
        await props.loader.interface.setColor({
          featureIds: currentFeatureId.value,
          color: "rgb(255, 255, 255)",
        });
      }

      currentFeatureId.value = json.id;
      await props.loader.interface.setColor({
        featureIds: currentFeatureId.value,
        color: "rgb(255, 255, 0)",
        type: 1,
      });
      await fetchProperties(json.id);
    }
  } catch (e) {
    console.error(e);
  }
}

async function fetchProperties(featureId: string) {
  attributeList.value = [];
  tab.value = "properties";
  attributeInformation.value = "Loading, please wait...";
  hasData.value = false;
  if (!featureId) {
    attributeInformation.value = "Unable to get component external ID";
    return;
  }

  try {
    const res: any = await getPropertiesStation({
      lightweightName: store.modelName,
      externalId: featureId,
    });

    const propertiesList: any[] = res.datas || [];

    if (propertiesList.length === 0) {
      attributeInformation.value = "No data";
      return;
    }

    const typeSet: string[] = [];
    let currentTypeName = "";

    for (let i = 0; i < propertiesList.length; i++) {
      const item = propertiesList[i];
      const propertySetName = item.propertySetName;

      delete item.children;

      if (typeSet.indexOf(item.propertyTypeName) === -1) {
        attributeList.value.push({
          type: item.propertyTypeName,
          content: [
            {
              propertyname: item.propertySetName,
              value: "",
              isSpace: true,
            },
            formatPropertyItem(item),
          ],
          setName: [item.propertySetName],
        });
        currentTypeName = propertySetName;
        typeSet.push(item.propertyTypeName);
      } else {
        const typeIndex = typeSet.indexOf(item.propertyTypeName);
        if (propertySetName === currentTypeName) {
          attributeList.value[typeIndex].content.push(formatPropertyItem(item));
        } else {
          attributeList.value[typeIndex].content.push({
            propertyname: item.propertySetName,
            value: "",
            isSpace: true,
          });
          attributeList.value[typeIndex].content.push(formatPropertyItem(item));
          currentTypeName = propertySetName;
        }
      }
    }

    hasData.value = true;
    tableList.value = attributeList.value[0]?.content || [];
    typeTableList.value = attributeList.value[1]?.content || [];
  } catch (error) {
    console.error("Failed to fetch properties:", error);
    attributeInformation.value = "Failed to fetch properties";
  }
}

function formatPropertyItem(item: any): any {
  return {
    propertyname: item.propertyname,
    value: item.value ?? "",
    isSpace: false,
  };
}

onMounted(() => {
  message.info("Click to pick a component to query properties");
  props.canvas.addEventListener("click", onCanvasClick);
});

onBeforeUnmount(() => {
  if (currentFeatureId.value) {
    props.loader.interface.setColor({
      featureIds: currentFeatureId.value,
      color: "rgb(255, 255, 255)",
    });
  }
  props.canvas.removeEventListener("click", onCanvasClick);
});
</script>

<style scoped lang="less">
.attribute-panel {
  .table-container {
    max-height: 400px;
    overflow-y: auto;

    :deep(.ant-table-wrapper) {
      .ant-table-tbody > tr:hover > td {
        background-color: rgba(22, 119, 255, 0.1);
      }
    }
  }

  .empty-tip {
    text-align: center;
    padding: 20px;
    color: rgba(255, 255, 255, 0.65);
  }
}
</style>
