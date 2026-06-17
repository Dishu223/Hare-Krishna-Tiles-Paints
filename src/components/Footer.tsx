import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from './ThemeProvider';
import { usePaintMode } from './PaintModeContext';
import { businessInfo } from '../data';

// --- SHADERS ---

const simVertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}
`;

const simFragmentShader = `
uniform sampler2D uPrevTex;
uniform vec2 uResolution;
uniform vec2 uMousePos;
uniform float uMouseForce;
uniform float uMouseSize;
varying vec2 vUv;

void main() {
    vec2 texel = 1.0 / uResolution;

    vec4 prev = texture2D(uPrevTex, vUv);
    float currentHeight = prev.r;
    float previousHeight = prev.g;

    float up = texture2D(uPrevTex, vUv + vec2(0.0, texel.y)).r;
    float down = texture2D(uPrevTex, vUv - vec2(0.0, texel.y)).r;
    float left = texture2D(uPrevTex, vUv - vec2(texel.x, 0.0)).r;
    float right = texture2D(uPrevTex, vUv + vec2(texel.x, 0.0)).r;

    float newHeight = (up + down + left + right) / 2.0 - previousHeight;
    newHeight *= 0.99; // Damping

    // Mouse interaction
    float dist = distance(vUv, uMousePos);
    if (dist < uMouseSize && uMouseForce > 0.0) {
        newHeight += uMouseForce * (1.0 - smoothstep(0.0, uMouseSize, dist));
    }

    // Output: R = current (becomes previous next frame), G = old current
    gl_FragColor = vec4(newHeight, currentHeight, 0.0, 1.0);
}
`;

const renderVertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}
`;

const renderFragmentShader = `
uniform sampler2D uDisplacementMap;
uniform sampler2D uTextTex;
uniform vec2 uResolution;
uniform vec3 uColorBg;
uniform vec3 uColorText;
uniform int uIsPaintMode;
varying vec2 vUv;

void main() {
    vec2 texel = 1.0 / uResolution;

    // Read height
    float cur = texture2D(uDisplacementMap, vUv).r;
    
    // Calculate normal
    float dx = texture2D(uDisplacementMap, vUv + vec2(texel.x * 2.0, 0.0)).r - texture2D(uDisplacementMap, vUv - vec2(texel.x * 2.0, 0.0)).r;
    float dy = texture2D(uDisplacementMap, vUv + vec2(0.0, texel.y * 2.0)).r - texture2D(uDisplacementMap, vUv - vec2(0.0, texel.y * 2.0)).r;
    vec2 normal2d = vec2(dx, dy);

    // Refract UVs
    vec2 refractedUv = vUv - normal2d * 4.0;
    
    // Chromatic aberration (RGB channel separation)
    float r = texture2D(uTextTex, refractedUv + normal2d * 2.0).r;
    float g = texture2D(uTextTex, refractedUv + normal2d * 1.0).g;
    float b = texture2D(uTextTex, refractedUv + normal2d * 0.0).b;
    float textMask = clamp(r + g + b, 0.0, 1.0);
    
    // Final text color with chromatic separation
    vec3 textColor = vec3(r, g, b) * uColorText;

    vec3 bg;
    if (uIsPaintMode == 1) {
        float t = clamp(cur * 2.0, 0.0, 1.0);
        float t2 = clamp((cur - 0.33) * 2.0, 0.0, 1.0);
        float t3 = clamp((cur - 0.66) * 2.0, 0.0, 1.0);
        
        vec3 c1 = vec3(1.0, 0.0, 0.5); // Magenta
        vec3 c2 = vec3(0.0, 1.0, 1.0); // Cyan
        vec3 c3 = vec3(1.0, 1.0, 0.0); // Yellow
        vec3 c4 = vec3(0.0, 1.0, 0.0); // Green
        vec3 c5 = vec3(1.0, 0.5, 0.0); // Orange
        
        vec3 paint = mix(c1, c2, t);
        paint = mix(paint, c3, t2);
        paint = mix(paint, c5, t3);
        
        bg = mix(uColorBg, paint, clamp(cur * 4.0, 0.0, 1.0));
    } else {
        vec3 uColorWaterTint = vec3(0.11, 0.05, 0.19); // #1c0d30
        bg = mix(uColorBg, uColorWaterTint, clamp(cur * 1.5, 0.0, 1.0));
    }
    
    // Specular highlight
    vec2 lightDir = normalize(vec2(1.0, 1.0));
    float specular = pow(max(0.0, dot(normal2d * 3.0, lightDir)), 2.5) * 0.8;

    vec3 finalColor = mix(bg, textColor, textMask) + specular;
    gl_FragColor = vec4(finalColor, 1.0);
}
`;

export function Footer() {
  const { isPaintMode } = usePaintMode();
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // Setup Scene
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    let width = container.clientWidth;
    let height = container.clientHeight;
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    // Setup Ping-Pong Buffers
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const type = isMobile ? THREE.HalfFloatType : THREE.FloatType;

    let simTargetA = new THREE.WebGLRenderTarget(width, height, {
      type,
      format: THREE.RGBAFormat,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
    });
    let simTargetB = simTargetA.clone();

    // Materials
    const simMaterial = new THREE.ShaderMaterial({
      vertexShader: simVertexShader,
      fragmentShader: simFragmentShader,
      uniforms: {
        uPrevTex: { value: null },
        uResolution: { value: new THREE.Vector2(width, height) },
        uMousePos: { value: new THREE.Vector2(-1, -1) },
        uMouseForce: { value: 0.0 },
        uMouseSize: { value: 0.015 },
      }
    });

    const drawTextTexture = (w: number, h: number) => {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      let fontSize = 240;
      ctx.font = `900 ${fontSize}px 'Cinzel', serif`;
      let metrics = ctx.measureText("हरे कृष्ण");

      while (metrics.width > w * 0.85 && fontSize > 20) {
        fontSize -= 5;
        ctx.font = `900 ${fontSize}px 'Cinzel', serif`;
        metrics = ctx.measureText("हरे कृष्ण");
      }

      ctx.fillText("हरे कृष्ण", w / 2, h / 2);

      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      return texture;
    };

    let textTex = drawTextTexture(width, height);

    const renderMaterial = new THREE.ShaderMaterial({
      vertexShader: renderVertexShader,
      fragmentShader: renderFragmentShader,
      uniforms: {
        uDisplacementMap: { value: null },
        uTextTex: { value: textTex },
        uResolution: { value: new THREE.Vector2(width, height) },
        uColorBg: { value: new THREE.Color(isPaintMode ? '#ffffff' : (theme === 'dark' ? '#111111' : '#0a0412')) },
        uColorText: { value: new THREE.Color('#ff8c00') }, // Bright orange in both modes
        uIsPaintMode: { value: isPaintMode ? 1 : 0 },
      }
    });
    (materialRef as any).current = renderMaterial;

    const geometry = new THREE.PlaneGeometry(2, 2);
    const plane = new THREE.Mesh(geometry, renderMaterial);
    scene.add(plane);

    const simScene = new THREE.Scene();
    const simPlane = new THREE.Mesh(geometry, simMaterial);
    simScene.add(simPlane);

    // Interaction handling
    let currentForce = 0.0;

    const handleInteract = (clientX: number, clientY: number, force: number, size: number) => {
      const rect = container.getBoundingClientRect();
      const x = (clientX - rect.left) / width;
      const y = 1.0 - ((clientY - rect.top) / height);
      simMaterial.uniforms.uMousePos.value.set(x, y);
      currentForce = force;
      simMaterial.uniforms.uMouseSize.value = size;
    };

    const onMouseMove = (e: MouseEvent) => handleInteract(e.clientX, e.clientY, 0.06, 0.015);
    const onTouchMove = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault();
      handleInteract(e.touches[0].clientX, e.touches[0].clientY, 0.04, 0.02);
    };
    const onMouseDown = (e: MouseEvent) => handleInteract(e.clientX, e.clientY, 0.6, 0.03);
    const onTouchStart = (e: TouchEvent) => {
      handleInteract(e.touches[0].clientX, e.touches[0].clientY, 0.3, 0.03);
    };

    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('touchstart', onTouchStart, { passive: false });

    // Resize handling
    const onResize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      renderer.setSize(width, height);
      simTargetA.setSize(width, height);
      simTargetB.setSize(width, height);
      simMaterial.uniforms.uResolution.value.set(width, height);
      renderMaterial.uniforms.uResolution.value.set(width, height);

      textTex.dispose();
      textTex = drawTextTexture(width, height);
      renderMaterial.uniforms.uTextTex.value = textTex;
    };
    window.addEventListener('resize', onResize);

    // Render Loop
    let animationId: number;

    const render = () => {
      simMaterial.uniforms.uMouseForce.value = currentForce;
      simMaterial.uniforms.uPrevTex.value = simTargetA.texture;
      renderer.setRenderTarget(simTargetB);
      renderer.render(simScene, camera);

      const temp = simTargetA;
      simTargetA = simTargetB;
      simTargetB = temp;

      currentForce = 0.0;

      renderMaterial.uniforms.uDisplacementMap.value = simTargetA.texture;
      renderer.setRenderTarget(null);
      renderer.render(scene, camera);

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onResize);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('mousedown', onMouseDown);
      container.removeEventListener('touchstart', onTouchStart);

      geometry.dispose();
      simMaterial.dispose();
      renderMaterial.dispose();
      simTargetA.dispose();
      simTargetB.dispose();
      textTex.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isPaintMode, theme]);

  return (
    <footer className="relative w-full h-[50vh] md:h-[65vh] bg-[#0a0412] overflow-hidden" style={{ touchAction: 'none' }}>
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-pointer" />

      <div className="absolute bottom-6 left-0 right-0 pointer-events-none flex justify-center z-10 px-4">
        <div className={`font-sans text-[0.55rem] md:text-xs tracking-[0.3em] uppercase text-center mt-6 transition-colors duration-500 ${isPaintMode ? 'text-black/60' : 'text-white/50 dark:text-white/40'}`}>
          <span>&copy; 2026</span>
            <span className="ml-2 font-bold text-divine-gold drop-shadow-[0_0_8px_rgba(212,168,67,0.5)]">H</span><span>ARE </span>
            <span className="font-bold text-divine-gold drop-shadow-[0_0_8px_rgba(212,168,67,0.5)]">KR</span><span>ISHNA TILES & PAINTS</span>
          <span className="ml-2">. ALL RIGHTS RESERVED.</span>
        </div>
      </div>
    </footer>
  );
}
