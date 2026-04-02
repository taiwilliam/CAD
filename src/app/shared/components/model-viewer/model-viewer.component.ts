import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild
} from '@angular/core';

@Component({
  selector: 'app-model-viewer',
  standalone: true,
  templateUrl: './model-viewer.component.html'
})
export class ModelViewerComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() fileUrl = '';
  @Input() viewerHeight = 560;

  @ViewChild('viewerHost', { static: true })
  private viewerHost?: ElementRef<HTMLDivElement>;

  protected isLoading = true;
  protected errorMessage = '';

  private isViewReady = false;
  private animationFrameId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;

  private renderer: any = null;
  private scene: any = null;
  private camera: any = null;
  private controls: any = null;
  private currentModel: any = null;

  constructor(private readonly ngZone: NgZone) {}

  async ngAfterViewInit(): Promise<void> {
    this.isViewReady = true;
    await this.initializeViewer();
    await this.loadModel();
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (!this.isViewReady) {
      return;
    }

    if ((changes['fileUrl'] && !changes['fileUrl'].firstChange) ||
        (changes['viewerHeight'] && !changes['viewerHeight'].firstChange)) {
      this.handleResize();
      await this.loadModel();
    }
  }

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

  private async initializeViewer(): Promise<void> {
    if (!this.viewerHost) {
      this.errorMessage = 'Viewer container not found.';
      this.isLoading = false;
      return;
    }

    const THREE = await import('three');
    const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');

    const host = this.viewerHost.nativeElement;
    const width = host.clientWidth || 800;
    const height = this.viewerHeight;

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

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 0.5;
    this.controls.maxDistance = 100;

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

    this.ngZone.runOutsideAngular(() => this.animate());
  }

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
      const THREE = await import('three');
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
      const loader = new GLTFLoader();
      const gltf = await loader.loadAsync(this.fileUrl);

      if (this.currentModel) {
        this.disposeObject(this.currentModel);
        this.scene.remove(this.currentModel);
      }

      const model = gltf.scene;
      model.traverse((child: any) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      this.currentModel = model;
      this.scene.add(model);
      this.fitCameraToObject(model, THREE);
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to load GLB model.';
    } finally {
      this.isLoading = false;
    }
  }

  private fitCameraToObject(object: any, THREE: any): void {
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const fov = this.camera.fov * (Math.PI / 180);
    const distance = maxDim / (2 * Math.tan(fov / 2));

    this.camera.near = Math.max(0.1, distance / 100);
    this.camera.far = distance * 100;
    this.camera.position.set(center.x + distance * 0.9, center.y + distance * 0.45, center.z + distance * 1.2);
    this.camera.updateProjectionMatrix();

    this.controls.target.copy(center);
    this.controls.update();
  }

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

  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    this.controls?.update?.();
    this.renderer?.render?.(this.scene, this.camera);
  };

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
