/**
 * Feature transparency panel
 * - After picking a feature, a transparency setting dialog pops up
 * - After being applied, the feature is rendered with the specified transparency and recorded in the history list
 * - When deleted or unmounted, full opacity is restored (alpha = 1)
 */
import React, { useEffect, useRef, useState } from "react";
import { App, Space, Button, Card, List, Tooltip, Form, InputNumber } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { Vector2 } from "three";
import DraggableModal from "../../components/DraggableModal";
import { useCanvasPick } from "./useCanvasPick";

interface AlphaItem {
  id: string;
  transparent: number;
}

export default function AlphaPanel(props: { loader: any; canvas: HTMLCanvasElement }) {
  const { loader, canvas } = props;
  const { message } = App.useApp();
  const [transparent, setTransparent] = useState<number>(0.5);
  const [componentList, setComponentList] = useState<AlphaItem[]>([]);
  const [visible, setVisible] = useState(false);
  const [featureId, setFeatureId] = useState<string | undefined>(undefined);
  const listRef = useRef(componentList);
  listRef.current = componentList;

  useEffect(() => {
    message.open({ content: "Please click to pick a feature", duration: 2 });
  }, []);

  /** Open the transparency setting dialog after picking a feature */
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

  function onDelete(data: AlphaItem, index: number) {
    setComponentList((list) => list.filter((_, i) => i !== index));
    loader.interface.setAlpha({ featureIds: data.id, alpha: 1 });
  }

  /** After confirming the transparency, apply it to the current feature and add it to the history list */
  async function SaveFeatureAlpha() {
    await loader.interface.setAlpha({
      featureIds: featureId,
      alpha: transparent,
    });
    setComponentList((list) => {
      const idx = list.findIndex((item) => item.id == featureId);
      if (idx === -1) {
        return [...list, { id: featureId!, transparent }];
      }
      return list.map((item, i) => (i === idx ? { ...item, transparent } : item));
    });
    setVisible(false);
  }

  /** Clear the history list and restore all features to full opacity */
  function DeleteAll() {
    listRef.current.forEach((item) => {
      loader.interface.setAlpha({ featureIds: item.id, alpha: 1 });
    });
    setComponentList([]);
  }

  useCanvasPick(canvas, onCanvasClick, () => {
    listRef.current.forEach((item) => {
      loader.interface.setAlpha({ featureIds: item.id, alpha: 1 });
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
        title="Set Feature Transparency"
        okText="OK"
        cancelText="Cancel"
        width={320}
        onOk={SaveFeatureAlpha}
        onCancel={() => setVisible(false)}
      >
        <Form>
          <Form.Item
            label="Transparency"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            className="transparent"
          >
            <InputNumber
              step={0.1}
              min={0}
              max={1}
              value={transparent}
              onChange={(v) => setTransparent(v ?? 1)}
            />
          </Form.Item>
        </Form>
      </DraggableModal>
    </div>
  );
}
