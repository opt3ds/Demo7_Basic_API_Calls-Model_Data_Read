/**
 * Feature properties panel
 * - Click a feature in the Three.js scene to get the feature ID via loader.interface.pick
 * - Call the backend endpoint /api/app/model/GetPropertyDataByExternalId to get property data
 * - Group by propertyTypeName and display them in the "Properties" and "Type" tabs respectively
 */
import React, { useEffect, useRef, useState } from "react";
import { App, Tabs, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Vector2 } from "three";
import { getPropertiesStation } from "../../api/index";
import { getModelMessage } from "../../config";
import { useCanvasPick } from "./useCanvasPick";

interface AttrRow {
  key: number;
  propertyname: string;
  value: string;
  isSpace: boolean;
}

interface AttributeItem {
  type: string;
  content: AttrRow[];
  setName: string[];
}

export default function AttributePanel(props: { loader: any; canvas: HTMLCanvasElement }) {
  const { loader, canvas } = props;
  const { message } = App.useApp();
  const [tab, setTab] = useState("properties");
  const [tableList, setTableList] = useState<AttrRow[]>([]);
  const [typeTableList, setTypeTableList] = useState<AttrRow[]>([]);
  const [attributeInformation, setAttributeInformation] = useState("Please click to pick a feature");
  const [hasData, setHasData] = useState(false);
  const [attributeList, setAttributeList] = useState<AttributeItem[]>([]);
  const currentFeatureId = useRef<string | null>(null);

  const columns: ColumnsType<AttrRow> = [
    {
      dataIndex: "propertyname",
      key: "propertyname",
      ellipsis: true,
      onCell: (record) => ({ colSpan: record.isSpace ? 2 : 1 }),
    },
    {
      dataIndex: "value",
      key: "value",
      ellipsis: true,
      onCell: (record) => ({ colSpan: record.isSpace ? 0 : 1 }),
    },
  ];

  useEffect(() => {
    message.info("Please click to pick the feature whose properties you want to query");
  }, []);

  function onTabChange(activeKey: string) {
    setTab(activeKey);
    if (activeKey === "properties") {
      if (attributeList[0] && attributeList[0].content.length > 0) {
        setTableList(attributeList[0].content);
      } else {
        setAttributeInformation("No data yet~");
      }
    } else {
      if (attributeList[1] && attributeList[1].content.length > 0) {
        setTypeTableList(attributeList[1].content);
      } else {
        setAttributeInformation("No data yet~");
      }
    }
  }

  function formatPropertyItem(item: any): AttrRow {
    return {
      key: Math.random(),
      propertyname: item.propertyname,
      value: item.value ?? "",
      isSpace: false,
    };
  }

  function withKey(content: (Omit<AttrRow, "key"> | AttrRow)[]): AttrRow[] {
    return content.map((row, i) => ({ ...(row as Omit<AttrRow, "key">), key: i }));
  }

  /** Fetch property data from the backend by feature ID, grouped by propertyTypeName */
  async function fetchProperties(featureId: string) {
    setAttributeList([]);
    setTab("properties");
    setAttributeInformation("Querying, please wait~");
    setHasData(false);
    if (!featureId) {
      setAttributeInformation("Unable to get the feature external ID");
      return;
    }

    try {
      const res: any = await getPropertiesStation({
        lightweightName: getModelMessage().modelName,
        externalId: featureId,
      });

      const propertiesList: any[] = res.datas || [];

      if (propertiesList.length === 0) {
        setAttributeInformation("No data yet~");
        return;
      }

      const typeSet: string[] = [];
      let currentTypeName = "";
      const newList: AttributeItem[] = [];

      for (let i = 0; i < propertiesList.length; i++) {
        const item = propertiesList[i];
        const propertySetName = item.propertySetName;

        delete item.children;

        if (typeSet.indexOf(item.propertyTypeName) === -1) {
          newList.push({
            type: item.propertyTypeName,
            content: [
              { key: 0, propertyname: item.propertySetName, value: "", isSpace: true },
              formatPropertyItem(item),
            ],
            setName: [item.propertySetName],
          });
          currentTypeName = propertySetName;
          typeSet.push(item.propertyTypeName);
        } else {
          const typeIndex = typeSet.indexOf(item.propertyTypeName);
          if (propertySetName === currentTypeName) {
            newList[typeIndex].content.push(formatPropertyItem(item));
          } else {
            newList[typeIndex].content.push({
              key: 0,
              propertyname: item.propertySetName,
              value: "",
              isSpace: true,
            });
            newList[typeIndex].content.push(formatPropertyItem(item));
            currentTypeName = propertySetName;
          }
        }
      }

      setHasData(true);
      setAttributeList(newList);
      setTableList(withKey(newList[0]?.content || []));
      setTypeTableList(withKey(newList[1]?.content || []));
    } catch (error) {
      console.error("Failed to get properties:", error);
      setAttributeInformation("Failed to get properties");
    }
  }

  /** Pick the feature when the scene is clicked, highlight the selected feature and load its property data */
  async function onCanvasClick(event: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    try {
      const json = await loader.interface.pick({ position: new Vector2(x, y) });
      if (json != undefined) {
        if (currentFeatureId.current) {
          await loader.interface.setColor({
            featureIds: currentFeatureId.current,
            color: "rgb(255, 255, 255)",
          });
        }
        currentFeatureId.current = json.id;
        await loader.interface.setColor({
          featureIds: currentFeatureId.current,
          color: "rgb(255, 255, 0)",
          type: 1,
        });
        await fetchProperties(json.id);
      }
    } catch (e) {
      console.error(e);
    }
  }

  useCanvasPick(canvas, onCanvasClick, () => {
    if (currentFeatureId.current) {
      loader.interface.setColor({
        featureIds: currentFeatureId.current,
        color: "rgb(255, 255, 255)",
      });
    }
  });

  function renderTable(list: AttrRow[]) {
    return hasData && list.length > 0 ? (
      <div className="table-container">
        <Table
          columns={columns}
          dataSource={list}
          rowKey="key"
          bordered
          pagination={false}
          showHeader={false}
          size="small"
        />
      </div>
    ) : (
      <div className="empty-tip">{attributeInformation}</div>
    );
  }

  return (
    <div className="attribute-panel">
      <Tabs
        activeKey={tab}
        onChange={onTabChange}
        size="small"
        animated={false}
        centered
        items={[
          { key: "properties", label: "Properties", children: renderTable(tableList) },
          { key: "type", label: "Type", children: renderTable(typeTableList) },
        ]}
      />
    </div>
  );
}
