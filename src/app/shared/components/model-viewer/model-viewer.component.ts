import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-model-viewer',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './model-viewer.component.html',
})
// 封裝 three.js / GLTFLoader，讓外部只要提供模型網址就能顯示 3D 預覽。
export class ModelViewerComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @Input() fileUrl = '';
  @Input() viewerHeight = 560;
  @Input() showResetButton = true;

  // three.js renderer 會把 canvas 掛到這個容器上。
  @ViewChild('viewerHost', { static: true })
  private viewerHost?: ElementRef<HTMLDivElement>;

  // 控制 template 中的 loading 與 error overlay。
  protected isLoading = true;
  protected errorMessage = '';

  // 只有在 host DOM 準備好後，才允許初始化 viewer 或重新載模。
  private isViewReady = false;
  // 保存動畫迴圈與尺寸監聽器，方便元件銷毀時完整清理。
  private animationFrameId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;

  // three.js 核心物件會在 initializeViewer() 中建立。
  private renderer: any = null;
  private scene: any = null;
  private camera: any = null;
  private controls: any = null;
  private currentModel: any = null;

  constructor(private readonly ngZone: NgZone) {}

  // 等畫面容器建立完成後，先初始化 viewer，再載入模型。
  async ngAfterViewInit(): Promise<void> {
    this.isViewReady = true;
    await this.initializeViewer();
    await this.loadModel();
  }

  // 監聽模型網址與高度變更，必要時更新尺寸並重新載入模型。
  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (!this.isViewReady) {
      return;
    }

    if (
      (changes['fileUrl'] && !changes['fileUrl'].firstChange) ||
      (changes['viewerHeight'] && !changes['viewerHeight'].firstChange)
    ) {
      this.handleResize();
      await this.loadModel();
    }
  }

  // 停止動畫、釋放控制器與模型資源，避免 WebGL / 記憶體殘留。
  ngOnDestroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.controls?.dispose?.();
    this.resizeObserver?.disconnect();

    if (this.currentModel) {
      this.disposeObject(this.currentModel);
      this.scene?.remove?.(this.currentModel);
      this.currentModel = null;
    }

    this.renderer?.dispose?.();

    const host = this.viewerHost?.nativeElement;
    if (host && this.renderer?.domElement?.parentNode === host) {
      host.removeChild(this.renderer.domElement);
    }
  }

  // 回到 OrbitControls 紀錄的初始視角。
  protected resetView(): void {
    this.controls?.reset?.();
    this.controls?.update?.();
  }

  // 建立 scene、camera、renderer、控制器與基礎燈光，只做一次。
  private async initializeViewer(): Promise<void> {
    if (!this.viewerHost) {
      this.errorMessage = 'Viewer container not found.';
      this.isLoading = false;
      return;
    }

    const THREE = await import('three');
    const { OrbitControls } =
      await import('three/examples/jsm/controls/OrbitControls.js');

    const host = this.viewerHost.nativeElement;
    const width = host.clientWidth || 800;
    const height = this.viewerHeight;

    // 場景、相機與 renderer 是 three.js viewer 的最小骨架。
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#f8fafc');

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 5000);
    this.camera.position.set(3, 2, 5);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    host.innerHTML = '';
    host.appendChild(this.renderer.domElement);

    // OrbitControls 提供拖曳旋轉、縮放與平移能力。
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 0.5;
    this.controls.maxDistance = 100;

    // 補一組環境光、主光與輔助格線，讓模型更容易辨識方向與比例。
    const ambientLight = new THREE.HemisphereLight('#ffffff', '#cbd5e1', 1.35);
    const keyLight = new THREE.DirectionalLight('#ffffff', 2.2);
    keyLight.position.set(8, 12, 10);

    const fillLight = new THREE.DirectionalLight('#ffffff', 1.1);
    fillLight.position.set(-6, 4, -8);

    const ground = new THREE.GridHelper(10, 10, '#cbd5e1', '#e2e8f0');
    ground.position.y = -1.5;

    this.scene.add(ambientLight, keyLight, fillLight, ground);

    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(host);

    // 持續渲染放到 Angular 區域外，避免每一幀都觸發變更檢測。
    this.ngZone.runOutsideAngular(() => this.animate());
  }

  // 使用 GLTFLoader 載入目前網址，並把舊模型替換成新模型。
  private async loadModel(): Promise<void> {
    if (!this.fileUrl) {
      this.errorMessage = 'Model URL is required.';
      this.isLoading = false;
      return;
    }

    if (!this.scene) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      // three 與 loader 都延後載入，避免首頁初始 bundle 過大。
      const THREE = await import('three');
      const { GLTFLoader } =
        await import('three/examples/jsm/loaders/GLTFLoader.js');
      const loader = new GLTFLoader();
      const gltf = await loader.loadAsync(this.fileUrl);

      // 若已有舊模型，先從場景移除並釋放幾何與材質資源。
      if (this.currentModel) {
        this.disposeObject(this.currentModel);
        this.scene.remove(this.currentModel);
      }

      const model = gltf.scene;
      // 為 mesh 打開投影與受光，讓立體感更明顯。
      model.traverse((child: any) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      this.currentModel = model;
      this.scene.add(model);
      // 載入完成後，自動把相機調整到可完整看到模型的位置。
      this.fitCameraToObject(model, THREE);
    } catch (error) {
      this.errorMessage =
        error instanceof Error ? error.message : 'Failed to load GLB model.';
    } finally {
      this.isLoading = false;
    }
  }

  // 依照模型包圍盒大小重新設定相機遠近與位置，並更新控制器目標點。
  private fitCameraToObject(object: any, THREE: any): void {
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const fov = this.camera.fov * (Math.PI / 180);
    const distance = maxDim / (2 * Math.tan(fov / 2));

    this.camera.near = Math.max(0.1, distance / 100);
    this.camera.far = distance * 100;
    this.camera.position.set(
      center.x + distance * 0.9,
      center.y + distance * 0.45,
      center.z + distance * 1.2,
    );
    this.camera.updateProjectionMatrix();

    this.controls.target.copy(center);
    this.controls.update();
    this.controls.saveState?.();
  }

  // 當容器尺寸或設定高度變更時，同步更新相機比例與 renderer 畫布尺寸。
  private handleResize(): void {
    if (!this.viewerHost || !this.camera || !this.renderer) {
      return;
    }

    const host = this.viewerHost.nativeElement;
    const width = host.clientWidth || 800;
    const height = this.viewerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  // 保持 controls damping 與場景重繪持續進行。
  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    this.controls?.update?.();
    this.renderer?.render?.(this.scene, this.camera);
  };

  // 釋放 three.js 幾何與材質，避免模型切換後累積 GPU 資源。
  private disposeObject(object: any): void {
    object.traverse?.((child: any) => {
      if (child.geometry) {
        child.geometry.dispose?.();
      }

      if (Array.isArray(child.material)) {
        child.material.forEach((material: any) => material.dispose?.());
        return;
      }

      child.material?.dispose?.();
    });
  }
}
