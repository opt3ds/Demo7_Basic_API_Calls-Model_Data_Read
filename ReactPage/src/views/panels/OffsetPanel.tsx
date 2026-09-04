/**
 * Feature offset panel
 * - After picking a feature, control the feature offset via X/Y/Z three-axis sliders
 * - While dragging a slider, the displayed value updates in real time; after releasing the mouse, loader.interface.offset is called
 * - The cumulative total offset is displayed in the InputNumber, and after release the slider automatically resets for the next drag
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

export default function OffsetPanel(props: { loader: any; canvas: HTMLCanvasElement }) {
  const { loader, canvas } = props;
  const { message } = App.useApp();
  const [formState, setFormState] = useState<FormState>({ ...originalFrom });
  const formStateRef = useRef(formState);
  formStateRef.current = formState;
  const creatFeatureRef = useRef<string | undefined>(undefined);
  const FeatureListRef = useRef<FeatureItem[]>([]);
  const indexRef = useRef(0);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    message.info("Please click to select the feature to offset!");
  }, []);

  function updateNum(axis: "x" | "y" | "z", value: number) {
    // During dragging, only update the displayed value without calling the underlying API; if a reset timer already exists, clear it to avoid being reset mid-drag
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
    setFormState((s) => ({ ...s, [`${axis}Num`]: value } as FormState));
  }

  async function applyOffset(axis: "x" | "y" | "z", value: number) {
    if (!creatFeatureRef.current) return;
    await loader.interface.offset({
      featureIds: creatFeatureRef.current,
      x: axis === "x" ? value : 0,
      y: axis === "y" ? value : 0,
      z: axis === "z" ? value : 0,
    });
    const next: FormState = {
      ...formStateRef.current,
      [`${axis}TotalNum`]: formStateRef.current[`${axis}TotalNum` as keyof FormState] + value,
    } as FormState;
    setFormState(next);
    FeatureListRef.current[indexRef.current].data = next;
    resetTimerRef.current = setTimeout(() => {
      setFormState((s) => ({ ...s, [`${axis}Num`]: 0 } as FormState));
      resetTimerRef.current = null;
    }, 100);
  }

  /** Pick a feature and record its current offset state; if it was offset before, restore the last state */
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

  /** Clear the offsets of all features and restore the white highlight when the panel unmounts */
  async function ClearOperate() {
    if (creatFeatureRef.current) {
      await loader.interface.setColor({
        featureIds: creatFeatureRef.current,
        color: "rgb(255, 255, 255)",
      });
    }
    for (const item of FeatureListRef.current) {
      await loader.interface.clearOffset({ featureIds: item.id });
    }
    FeatureListRef.current = [];
    setFormState({ ...originalFrom });
  }

  useCanvasPick(canvas, onCanvasClick, () => {
    ClearOperate();
  });

  return (
    <>
      <Space className="operate-box" style={{ width: "100%" }}>
        <div>X:</div>
        <Slider
          min={-10}
          max={10}
          value={formState.xNum}
          onChange={(v) => updateNum("x", v)}
          onAfterChange={(v) => applyOffset("x", v)}
        />
        <InputNumber
          value={formState.xTotalNum}
          disabled
          formatter={(v) => `${v}m`}
          style={{ width: "100%" }}
        />
      </Space>

      <Space className="operate-box" style={{ width: "100%" }}>
        <div>Y:</div>
        <Slider
          min={-10}
          max={10}
          value={formState.yNum}
          onChange={(v) => updateNum("y", v)}
          onAfterChange={(v) => applyOffset("y", v)}
        />
        <InputNumber
          value={formState.yTotalNum}
          disabled
          formatter={(v) => `${v}m`}
          style={{ width: "100%" }}
        />
      </Space>

      <Space className="operate-box" style={{ width: "100%" }}>
        <div>Z:</div>
        <Slider
          min={-10}
          max={10}
          value={formState.zNum}
          onChange={(v) => updateNum("z", v)}
          onAfterChange={(v) => applyOffset("z", v)}
        />
        <InputNumber
          value={formState.zTotalNum}
          disabled
          formatter={(v) => `${v}m`}
          style={{ width: "100%" }}
        />
      </Space>
    </>
  );
}
