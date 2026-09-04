/**
 * Feature color panel
 * - After clicking a feature in the scene, a color selection dialog pops up
 * - After confirmation, the color is applied to the specified feature and recorded in the history list
 * - When the panel unmounts or an entry is deleted, the feature's original white color is restored
 */
import React, { useEffect, useRef, useState } from "react";
import { App, Space, Button, Card, List, Tooltip, Form, ColorPicker } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { Vector2 } from "three";
import DraggableModal from "../../components/DraggableModal";
import { useCanvasPick } from "./useCanvasPick";

interface ColorItem {
  id: string;
  color: string;
}

export default function ColorPanel(props: { loader: any; canvas: HTMLCanvasElement }) {
  const { loader, canvas } = props;
  const { message } = App.useApp();
  const [colorValue, setColorValue] = useState("rgba(255,0,0,1)");
  const [componentList, setComponentList] = useState<ColorItem[]>([]);
  const [visible, setVisible] = useState(false);
  const [featureId, setFeatureId] = useState<string | undefined>(undefined);
  const listRef = useRef(componentList);
  listRef.current = componentList;

  useEffect(() => {
    message.open({ content: "Please click to pick a feature", duration: 2 });
  }, []);

  /** Open the color setting dialog after picking a feature */
  async function onCanvasClick(event: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    try {
      const json = await loader.interface.pick({ position: new Vector2(x, y) });
      if (json != undefined) {
        setFeatureId(json.id);
        setVisible(true);
      }
    } catch (e) {
      console.error(e);
    }
  }

  function onDelete(data: ColorItem, index: number) {
    setComponentList((list) => list.filter((_, i) => i !== index));
    loader.interface.setColor({ featureIds: data.id, color: "rgb(255, 255, 255)" });
  }

  /** After confirming the color, apply it to the currently selected feature and update the history list */
  async function SaveFeatureColor() {
    await loader.interface.setColor({
      featureIds: featureId,
      color: colorValue,
      type: 1,
    });
    setComponentList((list) => {
      const idx = list.findIndex((item) => item.id == featureId);
      if (idx === -1) {
        return [...list, { id: featureId!, color: colorValue }];
      }
      return list.map((item, i) => (i === idx ? { ...item, color: colorValue } : item));
    });
    setVisible(false);
  }

  /** Clear all colored features and restore them to white */
  function DeleteAll() {
    listRef.current.forEach((item) => {
      loader.interface.setColor({ featureIds: item.id, color: "rgb(255, 255, 255)" });
    });
    setComponentList([]);
  }

  useCanvasPick(canvas, onCanvasClick, () => {
    listRef.current.forEach((item) => {
      loader.interface.setColor({ featureIds: item.id, color: "rgb(255, 255, 255)" });
    });
  });

  return (
    <div className="side-frame" onContextMenu={(e) => e.preventDefault()}>
      <Space className="operate-btn-box">
        <Button ghost onClick={DeleteAll}>
          Delete All
        </Button>
      </Space>

      <Card size="small" bordered={false} styles={{ body: { padding: 0 } }}>
        <div className="box">
          <List
            size="small"
            dataSource={componentList}
            locale={{ emptyText: "No history data" }}
            className="roam-list scroll-box"
          >
            {componentList.map((item, index) => (
              <List.Item
                key={item.id}
                actions={[
                  <Tooltip title="Delete" key="del">
                    <DeleteOutlined
                      style={{ fontSize: "16px", color: "#05a081" }}
                      onClick={() => onDelete(item, index)}
                    />
                  </Tooltip>,
                ]}
              >
                <Space>
                  <div>{item.id}</div>
                </Space>
              </List.Item>
            ))}
          </List>
        </div>
      </Card>

      <DraggableModal
        open={visible}
        className="set-data"
        title="Set Feature Color"
        okText="OK"
        cancelText="Cancel"
        width={320}
        onOk={SaveFeatureColor}
        onCancel={() => setVisible(false)}
      >
        <Form>
          <Form.Item
            label="Select Color"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            className="color-picker"
          >
            <ColorPicker
              format="rgb"
              showText
              value={colorValue}
              onChange={(c) => setColorValue(c.toCssString())}
            />
          </Form.Item>
        </Form>
      </DraggableModal>
    </div>
  );
}
