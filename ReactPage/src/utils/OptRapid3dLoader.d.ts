import { Camera, Scene, WebGLRenderer } from "three";

export interface OptLoaderOptions {
  renderer: WebGLRenderer;
  camera: Camera;
  parent: Scene;
  /** Whether to render double-sided (disable backface culling), default false */
  doubleSide?: boolean;
  /** Decoder file directory (draco/basis/rhino3dm), e.g. "./static/libs" */
  libs?: string;
  /** Path of the .opt format model */
  url: string;
  /** Callback when loading completes */
  callback?: () => void;
}

export interface PickResult {
  id: string;
  [key: string]: any;
}

export interface OptLoaderInterface {
  /** Feature picking; position is a Vector2 (coordinates within the canvas) */
  pick(params: { position: any }): Promise<PickResult | undefined>;
  /** Set feature color, type: 0=blend, 1=replace */
  setColor(params: { featureIds: any; color: string; type?: number }): Promise<void>;
  /** Set feature visibility */
  setVisible(params: { featureIds: any; visible: boolean }): Promise<void>;
  /** Set feature transparency, alpha: 0~1 */
  setAlpha(params: { featureIds: any; alpha: number }): Promise<void>;
  /** Feature offset (meters) */
  offset(params: { featureIds: any; x: number; y: number; z: number }): Promise<void>;
  /** Clear offset */
  clearOffset(params: { featureIds: any }): Promise<void>;
  /** Feature rotation (degrees) */
  rotate(params: { featureIds: any; x: number; y: number; z: number; angle: number }): Promise<void>;
  /** Clear rotation */
  clearRotate(params: { featureIds: any }): Promise<void>;
  /** Feature positioning (camera flies to the feature position) */
  zoomTo(params: { featureIds: any }): Promise<void>;
  /** Per-frame update (must be called in the animation loop) */
  update(): void;
  /** Destroy and release resources */
  dispose(): void;
}

declare class OptRapid3dLoader {
  constructor(options: OptLoaderOptions);
  interface: OptLoaderInterface;
}

export default OptRapid3dLoader;
