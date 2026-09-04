/**
 * Feature rotation panel
 * - After picking a feature, control the feature rotation via X/Y/Z three-axis sliders
 * - While dragging a slider, the displayed value updates in real time; after releasing the mouse, loader.interface.rotate is called with the incremental angle
 * - The InputNumber shows the absolute angle of the current axis, linked with the slider
 */
import React, { useEffect, useRef, useState } from "react";
import { App, Space, Slider, InputNumber } from "antd";
import { Vector2 } from "three";
import { useCanvasPick } from "./useCanvasPick";

interface FormState {
  xNum: number;
  xTotalNum: number;
  yNum: number;
  yTotalNum: number;
  zNum: number;
  zTotalNum: number;
}

const originalFrom: FormState = {
  xNum: 0,
  xTotalNum: 0,
  yNum: 0,
  yTotalNum: 0,
  zNum: 0,
  zTotalNum: 0,
};

interface FeatureItem {
  id: string;
  data: FormState;
}

export default function RotatePanel(props: { loader: any; canvas: HTMLCanvasElement }) {
  const { loader, canvas } = props;
  const { message } = App.useApp();
  const [formState, setFormState] = useState<FormState>({ ...originalFrom });
  const formStateRef = useRef(formState);
  formStateRef.current = formState;
  const creatFeatureRef = useRef<string | undefined>(undefined);
  const FeatureListRef = useRef<FeatureItem[]>([]);
  const indexRef = useRef(0);

  useEffect(() => {
    message.info("Please click to select the feature to rotate!");
  }, []);

  function updateNum(axis: "x" | "y" | "z", value: number) {
    // Update the displayed value during dragging so the slider thumb follows the mouse
    setFormState((s) => ({ ...s, [`${axis}Num`]: value } as FormState));
  }

  async function applyRotate(axis: "x" | "y" | "z", value: number) {
    if (!creatFeatureRef.current) return;
    const totalKey = `${axis}TotalNum` as keyof FormState;
    const prevTotal = formStateRef.current[totalKey] as number;
    if (Math.abs(value - prevTotal) === 0) return;
    await loader.interface.rotate({
      featureIds: creatFeatureRef.current,
      x: axis === "x" ? 1 : 0,
      y: axis === "y" ? 1 : 0,
      z: axis === "z" ? 1 : 0,
      angle: Math.abs(value - prevTotal),
    });
    const next: FormState = {
      ...formStateRef.current,
      [totalKey]: value,
    } as FormState;
    setFormState(next);
    FeatureListRef.current[indexRef.current].data = next;
  }

  /** Pick a feature and record its current rotation state; if it was rotated before, restore the last state */
  async function onCanvasClick(event: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    try {
      const json = await loader.interface.pick({ position: new Vector2(x, y) });
      if (json != undefined) {
        if (creatFeatureRef.current) {
          await loader.interface.setColor({
            featureIds: creatFeatureRef.current,
            color: "rgb(255, 255, 255)",
          });
        }
        creatFeatureRef.current = json.id;
        await loader.interface.setColor({
          featureIds: json.id,
          color: "rgb(255, 255, 0)",
          type: 1,
        });
        indexRef.current = FeatureListRef.current.findIndex((item) => item.id == json.id);
        if (indexRef.current == -1) {
          FeatureListRef.current.push({ id: json.id, data: { ...originalFrom } });
          indexRef.current = FeatureListRef.current.length - 1;
          setFormState({ ...originalFrom });
        } else {
          setFormState({ ...originalFrom, ...FeatureListRef.current[indexRef.current].data });
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  /** Clear the rotations of all features and restore the white highlight when the panel unmounts */
  async function RestoreModel() {
    if (creatFeatureRef.current) {
      await loader.interface.setColor({
        featureIds: creatFeatureRef.current,
        color: "rgb(255, 255, 255)",
      });
    }
    for (const item of FeatureListRef.current) {
      await loader.interface.clearRotate({ featureIds: item.id });
    }
    FeatureListRef.current = [];
    setFormState({ ...originalFrom });
  }

  useCanvasPick(canvas, onCanvasClick, () => {
    RestoreModel();
  });

  return (
    <>
      <Space className="operate-box" style={{ width: "100%" }}>
        <div>X:</div>
        <Slider
          min={0}
          max={360}
          value={formState.xNum}
          onChange={(v) => updateNum("x", v)}
          onAfterChange={(v) => applyRotate("x", v)}
        />
        <InputNumber
          value={formState.xNum}
          disabled
          min={0}
          max={360}
          formatter={(v) => `${v}°`}
          style={{ width: "100%" }}
        />
      </Space>

      <Space className="operate-box" style={{ width: "100%" }}>
        <div>Y:</div>
        <Slider
          min={0}
          max={360}
          value={formState.yNum}
          onChange={(v) => updateNum("y", v)}
          onAfterChange={(v) => applyRotate("y", v)}
        />
        <InputNumber
          value={formState.yNum}
          disabled
          min={0}
          max={360}
          formatter={(v) => `${v}°`}
          style={{ width: "100%" }}
        />
      </Space>

      <Space className="operate-box" style={{ width: "100%" }}>
        <div>Z:</div>
        <Slider
          min={0}
          max={360}
          value={formState.zNum}
          onChange={(v) => updateNum("z", v)}
          onAfterChange={(v) => applyRotate("z", v)}
        />
        <InputNumber
          value={formState.zNum}
          disabled
          min={0}
          max={360}
          formatter={(v) => `${v}°`}
          style={{ width: "100%" }}
        />
      </Space>
    </>
  );
}
