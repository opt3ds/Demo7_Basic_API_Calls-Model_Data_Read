/**
 * Feature show/hide panel
 * - After clicking a feature in the scene, add it to the hidden list and call setVisible to hide it
 * - In the list, the show/hide state of a single feature can be toggled at any time via the Switch
 * - When a list item is deleted or the panel unmounts, all features become visible again
 */
import React, { useEffect, useRef, useState } from "react";
import { App, Space, Button, List, Tooltip, Switch } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { Vector2 } from "three";
import { useCanvasPick } from "./useCanvasPick";

interface VisibleItem {
  id: string;
  isHidden: boolean;
}

export default function VisiblePanel(props: { loader: any; canvas: HTMLCanvasElement }) {
  const { loader, canvas } = props;
  const { message } = App.useApp();
  const [componentList, setComponentList] = useState<VisibleItem[]>([]);
  const listRef = useRef(componentList);
  listRef.current = componentList;

  useEffect(() => {
    message.open({ content: "Please click to pick a feature", duration: 2 });
  }, []);

  /** Add the picked feature to the hidden list and hide it in the scene */
  async function onCanvasClick(event: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    try {
      const json = await loader.interface.pick({ position: new Vector2(x, y) });
      if (json != undefined) {
        const found = listRef.current.find((e) => e.id === json.id);
        if (found) {
          setComponentList((list) =>
            list.map((item) => (item.id === json.id ? { ...item, isHidden: false } : item))
          );
        } else {
          setComponentList((list) => [...list, { id: json.id, isHidden: false }]);
        }
        loader.interface.setVisible({ featureIds: json.id, visible: false });
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function onChangeHidden(checked: boolean, data: VisibleItem) {
    setComponentList((list) =>
      list.map((item) => (item.id === data.id ? { ...item, isHidden: checked } : item))
    );
    await loader.interface.setVisible({ featureIds: data.id, visible: checked });
  }

  async function onDelete(data: VisibleItem, index: number) {
    setComponentList((list) => list.filter((_, i) => i !== index));
    await loader.interface.setVisible({ featureIds: data.id, visible: true });
  }

  async function DeleteAll() {
    for (const item of listRef.current) {
      await loader.interface.setVisible({ featureIds: item.id, visible: true });
    }
    setComponentList([]);
  }

  useCanvasPick(canvas, onCanvasClick, () => {
    DeleteAll();
  });

  return (
    <div className="side-frame" onContextMenu={(e) => e.preventDefault()}>
      <Space className="operate-btn-box">
        <Button ghost onClick={DeleteAll}>
          Delete All
        </Button>
      </Space>

      <List
        dataSource={componentList}
        locale={{ emptyText: "No history data" }}
        className="list-box scroll-box"
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
              <Switch
                size="small"
                checkedChildren="Show"
                unCheckedChildren="Hide"
                checked={item.isHidden}
                onChange={(checked) => onChangeHidden(checked, item)}
              />
              <div>{item.id}</div>
            </Space>
          </List.Item>
        ))}
      </List>
    </div>
  );
}
