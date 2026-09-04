/**
 * Main page component
 * Responsibilities:
 * 1. Initialize the Three.js scene, camera, renderer, orbit controls, and lights
 * 2. Load the lightweight model via OptRapid3dLoader and show the left toolbar after loading completes
 * 3. Manage the left toolbar click logic, popping up the corresponding function panel on the right via antd notification
 * 4. Listen for window resize to keep the canvas adaptive to full screen
 */
import React, { useEffect, useRef, useState } from "react";
import { notification } from "antd";
import {
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
  AmbientLight,
  DirectionalLight,
  Color,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import OptRapid3dLoader from "../utils/OptRapid3dLoader";
import { getModelMessage } from "../config";
import AttributePanel from "./panels/AttributePanel";
import ColorPanel from "./panels/ColorPanel";
import VisiblePanel from "./panels/VisiblePanel";
import AlphaPanel from "./panels/AlphaPanel";
import OffsetPanel from "./panels/OffsetPanel";
import RotatePanel from "./panels/RotatePanel";
import SubAttributesIcon from "../assets/img/SubAttributes.png";
import SubSetFeatureColorIcon from "../assets/img/SubSetFeatureColor.png";
import SubHideOrShowIcon from "../assets/img/SubHideOrShow.png";
import ComponentTransparencyIcon from "../assets/img/ComponentTransparency.png";
import SubFeatureOffsetIcon from "../assets/img/SubFeatureOffset.png";
import SubSetFeatureRotateIcon from "../assets/img/SubSetFeatureRotate.png";
import HomeIcon from "../assets/img/home.png";

// Toolbar definition fully consistent with index.vue
const tools = [
  { id: "attribute", name: "Properties", icon: SubAttributesIcon },
  { id: "color", name: "Color", icon: SubSetFeatureColorIcon },
  { id: "visible", name: "Visibility", icon: SubHideOrShowIcon },
  { id: "alpha", name: "Opacity", icon: ComponentTransparencyIcon },
  { id: "offset", name: "Offset", icon: SubFeatureOffsetIcon },
  { id: "rotate", name: "Rotate", icon: SubSetFeatureRotateIcon },
  { id: "website", name: "Website", icon: HomeIcon },
];

interface PanelProps {
  loader: any;
  canvas: HTMLCanvasElement;
}

const panelMap: Record<string, React.ComponentType<PanelProps>> = {
  attribute: AttributePanel,
  color: ColorPanel,
  visible: VisiblePanel,
  alpha: AlphaPanel,
  offset: OffsetPanel,
  rotate: RotatePanel,
};

const titleMap: Record<string, string> = {
  attribute: "Properties",
  color: "Color",
  visible: "Visibility",
  alpha: "Opacity",
  offset: "Offset",
  rotate: "Rotate",
};

export default function Index() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const loaderRef = useRef<any>(null);
  const [loaderReady, setLoaderReady] = useState(false);
  const [activeTool, setActiveTool] = useState("");
  const onToolClickRef = useRef<(id: string) => void>(() => {});

  // Root cause fix: the holder of the antd v5 static notification is rendered through the react-dom main entry
  // (unstableSetRender -> rc-util render). The main entry of React 19 no longer exports
  // createRoot / render, so the fragment is never mounted and the panel never appears.
  // Switched to the hook version API: the holder is rendered as a regular node into the main React tree,
  // and api.open / api.destroy(key) semantics match the static version (replace / close with the same key).
  const [notify, notifyHolder] = notification.useNotification();

  useEffect(() => {
    let scene: Scene | null = null;
    let renderer: WebGLRenderer | null = null;
    let camera: PerspectiveCamera | null = null;
    let controls: OrbitControls | null = null;
    let loader: any = null;
    let animationId = 0;

    function onResize() {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    try {
      scene = new Scene();
      scene.background = new Color(0x87cefa);
      renderer = new WebGLRenderer({
        antialias: true,
        logarithmicDepthBuffer: true,
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      if (containerRef.current) {
        containerRef.current.appendChild(renderer.domElement);
      }
      canvasRef.current = renderer.domElement;
      camera = new PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.set(0, 100, 150);
      camera.lookAt(0, 0, 0);
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      const ambientLight = new AmbientLight(0xffffff, 2.0);
      scene.add(ambientLight);
      const mainLight = new DirectionalLight(0xffffff, 1.0);
      mainLight.position.set(5, 10, 7);
      scene.add(mainLight);

      const { baseUrl, modelName } = getModelMessage();
      loader = new OptRapid3dLoader({
        renderer: renderer,
        camera: camera,
        parent: scene,
        doubleSide: true,
        libs: "./static/libs",
        url: `${baseUrl}/static/OutputModel/${modelName}/root.opt`,
        callback: () => {
          console.log("Loading completed!");
          setLoaderReady(true);
        },
      });
      (window as any).api = loader;
      loaderRef.current = loader;

      window.addEventListener("resize", onResize);

      function animate() {
        animationId = requestAnimationFrame(animate);
        if (controls) controls.update();
        if (loader) loader.interface.update();
        if (scene && camera && renderer) renderer.render(scene, camera);
      }
      animate();
    } catch (error) {
      console.error("Initialization failed:", error);
      notify.error({
        message: "Initialization failed",
        description: "Initialization failed, please refresh the page and try again",
        duration: 6,
      });
    }

    // Clean up Three.js related resources when the component unmounts to avoid memory leaks
    return () => {
      if (animationId !== 0) cancelAnimationFrame(animationId);
      window.removeEventListener("resize", onResize);
      try {
        if (loader && loader.interface && loader.interface.dispose) {
          loader.interface.dispose();
        }
      } catch (e) {
        console.error("loader dispose failed:", e);
      }
      if (controls) controls.dispose();
      if (renderer) renderer.dispose();
    };
    // notify is the stable api returned by notification.useNotification(),
    // so referencing it in the effect is safe (unrelated to the component lifecycle).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Left toolbar click handler
   * - website: jump to the official website
   * - Clicking an already activated tool again: close the panel
   * - Other tools: close the old panel and open the new one; when closing, also clear the activeTool highlight
   */
  function onToolClick(id: string) {
    if (id === "website") {
      window.open("https://www.opt3ds.com", "_blank");
      return;
    }
    if (activeTool === id) {
      setActiveTool("");
      notify.destroy("EngineKey");
      return;
    }
    setActiveTool(id);
    notify.destroy("EngineKey");

    const PanelComponent = panelMap[id];
    if (PanelComponent && canvasRef.current) {
      notify.open({
        key: "EngineKey",
        message: titleMap[id],
        description: (
          <PanelComponent loader={loaderRef.current} canvas={canvasRef.current} />
        ),
        className: "engine-notification",
        duration: null,
        placement: "topRight",
        style: { width: "300px", marginRight: "20px" },
        onClose: () => {
          setActiveTool("");
        },
      });
    }
  }

  onToolClickRef.current = onToolClick;

  return (
    <div className="opt-loader-demo">
      {notifyHolder}
      <div id="container" ref={containerRef} />
      {loaderReady && (
        <div className="left-nav">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className={`left-tool${activeTool === tool.id ? " active" : ""}`}
              onClick={() => onToolClick(tool.id)}
            >
              <img src={tool.icon} />
              <span>{tool.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
