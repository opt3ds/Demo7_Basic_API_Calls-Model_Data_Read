<template>
  <div class="opt-loader-demo">
    <div id="container" ref="containerRef"></div>

    <div class="left-nav" v-if="loaderReady">
      <div v-for="tool in tools" :key="tool.id" class="left-tool" :class="{ active: activeTool === tool.id }" @click="onToolClick(tool.id)">
        <img :src="getNavImage(tool.icon)" />
        <span>{{ tool.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, h, onMounted, onUnmounted } from "vue";
import { message, notification } from "ant-design-vue";
import {
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
  AmbientLight,
  DirectionalLight,
  Color,
  Vector2,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import OptRapid3dLoader from "../utils/OptRapid3dLoader";
import ColorPanel from "./panels/ColorPanel.vue";
import VisiblePanel from "./panels/VisiblePanel.vue";
import AlphaPanel from "./panels/AlphaPanel.vue";
import OffsetPanel from "./panels/OffsetPanel.vue";
import RotatePanel from "./panels/RotatePanel.vue";
import AttributePanel from "./panels/AttributePanel.vue";
import { useModelStore } from "../store/modules/model";
const containerRef = ref<HTMLDivElement | null>(null);
const loaderReady = ref(false);
const activeTool = ref("");

let loaderInstance: any = null;
let rendererInstance: WebGLRenderer | null = null;
let cameraInstance: PerspectiveCamera | null = null;
let controlsInstance: OrbitControls | null = null;
let animationId: number | null = null;

const tools = [
  { id: "attribute", name: "Properties", icon: "SubAttributes" },
  { id: "color", name: "Color", icon: "SubSetFeatureColor" },
  { id: "visible", name: "Visibility", icon: "SubHideOrShow" },
  { id: "alpha", name: "Opacity", icon: "ComponentTransparency" },
  { id: "offset", name: "Offset", icon: "SubFeatureOffset" },
  { id: "rotate", name: "Rotate", icon: "SubSetFeatureRotate" },
  { id: "website", name: "Website", icon: "home" },
  // { id: "download", name: "Source Download", icon: "Export" },
];

function getNavImage(name: string) {
  return new URL(`../assets/img/${name}.png`, import.meta.url).href;
}

function onToolClick(id: string) {
  if (id === "website") {
    window.open("https://www.opt3ds.com", "_blank");
    return;
  }
  if (id === "download") {
    const link = document.createElement("a");
    link.href = "./static/Opt Rapid3D Loader for Three.js.zip";
    link.download = "Opt Rapid3D Loader for Three.js.zip";
    link.click();
    return;
  }
  if (activeTool.value === id) {
    activeTool.value = "";
    notification.destroy();
    return;
  }
  activeTool.value = id;
  notification.destroy();

  const panelMap: Record<string, any> = {
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

  const PanelComponent = panelMap[id];
  if (PanelComponent && rendererInstance) {
    notification.open({
      key: "EngineKey",
      message: titleMap[id],
      description: () =>
        h(PanelComponent, {
          loader: loaderInstance,
          canvas: rendererInstance!.domElement,
        }),
      class: "engine-notification",
      duration: null,
      placement: "topRight",
      style: { width: "300px", marginRight: "20px" },
      onClose: () => {
        activeTool.value = "";
      },
    });
  }
}

function onResize() {
  if (!cameraInstance || !rendererInstance) return;
  cameraInstance.aspect = window.innerWidth / window.innerHeight;
  cameraInstance.updateProjectionMatrix();
  rendererInstance.setSize(window.innerWidth, window.innerHeight);
}

onMounted(async () => {
  try {
    const scene = new Scene();
    scene.background = new Color(0x87cefa);
    const renderer = new WebGLRenderer({
      antialias: true,
      logarithmicDepthBuffer: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    rendererInstance = renderer;
    if (containerRef.value) {
      containerRef.value.appendChild(renderer.domElement);
    }
    const camera = new PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 100, 150);
    camera.lookAt(0, 0, 0);
    cameraInstance = camera;
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsInstance = controls;
    const ambientLight = new AmbientLight(0xffffff, 2.0);
    scene.add(ambientLight);
    const mainLight = new DirectionalLight(0xffffff, 1.0);
    mainLight.position.set(5, 10, 7);
    scene.add(mainLight);
    const store = useModelStore();
    const baseUrl = store.baseUrl || "";
    const loader = new OptRapid3dLoader({
      renderer: renderer,
      camera: camera,
      parent: scene,
      doubleSide: true,
      libs: "./static/libs",
      url: baseUrl + `/static/OutputModel/${store.modelName}/root.opt`,
      callback: () => {
        console.log("Loading completed!");
        loaderReady.value = true;
      },
    });
    window.api = loader
    loaderInstance = loader;
    window.addEventListener("resize", onResize);
    function animate() {
      animationId = requestAnimationFrame(animate);
      controls.update();
      loader.interface.update();
      renderer.render(scene, camera);
    }
    animate();
  } catch (error) {
    console.error("Initialization failed:", error);
    message.error("Initialization failed, please refresh the page and try again");
  }
});

onUnmounted(() => {
  if (animationId !== null) cancelAnimationFrame(animationId);
  notification.destroy();
  if (rendererInstance) rendererInstance.dispose();
  if (controlsInstance) controlsInstance.dispose();
  window.removeEventListener("resize", onResize);
});
</script>

<style lang="less" scoped>
.opt-loader-demo {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

#container {
  width: 100%;
  height: 100%;
}

@keyframes glow-pulse {
  0%,
  100% {
    box-shadow: 0 0 8px rgba(22, 119, 255, 0.4);
  }
  50% {
    box-shadow: 0 0 20px rgba(64, 150, 255, 0.7);
  }
}

.left-nav {
  position: fixed;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  z-index: 100;
  background: rgba(50, 54, 65, 0.88);
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
  overflow: hidden;

  .left-tool {
    padding: 10px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.3s ease;
    width: 60px;

    img {
      width: 24px;
      height: 24px;
      margin-bottom: 6px;
      transition: all 0.3s ease;
    }

    span {
      white-space: nowrap;
      letter-spacing: 0.5px;
    }

    &:hover {
      background: rgba(22, 119, 255, 0.5);
      color: #fff;

      img {
        filter: drop-shadow(0 0 4px rgba(22, 119, 255, 0.5));
      }
    }

    &.active {
      background: rgba(22, 119, 255, 0.75);
      color: #fff;
      animation: glow-pulse 2.5s ease-in-out infinite;

      img {
        filter: drop-shadow(0 0 6px rgba(22, 119, 255, 0.6));
      }
    }
  }
}

.tips-bar {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 30px;
  background: rgba(50, 54, 65, 0.9);
  padding: 12px 25px;
  border-radius: 8px;
  z-index: 100;

  .tip-item {
    display: flex;
    align-items: center;
    color: rgba(255, 255, 255, 0.65);
    font-size: 13px;

    img {
      width: 24px;
      height: 24px;
      margin-right: 8px;
    }
  }
}
</style>
