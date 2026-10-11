import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
export class Atmosphere {
  constructor(mobile) {
    this.root = new THREE.Group();
    const sky = new Sky(); sky.scale.setScalar(4500);
    Object.assign(sky.material.uniforms.turbidity, { value: 2.4 });
    sky.material.uniforms.rayleigh.value = 2.1;
    sky.material.uniforms.mieCoefficient.value = 0.007;
    sky.material.uniforms.mieDirectionalG.value = 0.87;
    sky.material.uniforms.sunPosition.value.set(-0.6, 0.62, -0.5).normalize();
    this.root.add(sky);
    this.clouds = [];
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide,
      uniforms: { time: { value: 0 } },
      vertexShader: `varying vec2 uvv;void main(){uvv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader: `precision highp float; varying vec2 uvv;uniform float time;
        float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
        float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
        void main(){vec2 p=uvv*2.-1.;float f=0.,amp=.5;vec2 q=uvv*4.;for(int i=0;i<5;i++){f+=n(q)*amp;q=q*2.03+7.4;amp*=.5;}
          float mask=1.-smoothstep(.18,1.,length(p*vec2(1.,1.15)));
          float a=smoothstep(.25,.74,f)*mask*.76; if(a<.006)discard;
          vec3 col=mix(vec3(.55,.65,.69),vec3(.94,.94,.88),clamp(f*.8+uvv.y*.35,0.,1.));
          gl_FragColor=vec4(col,a);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    });
    const count = mobile ? 14 : 24;
    for (let i = 0; i < count; i++) {
      const cloud = new THREE.Mesh(geometry, material);
      const side = i % 2 ? -1 : 1;
      cloud.position.set(side * (26 + (i * 43 % 280)), 32 + (i * 31 % 210), -90 - (i * 89 % 800));
      cloud.scale.set(150 + i % 3 * 80, 75 + i % 4 * 30, 1);
      this.root.add(cloud); this.clouds.push(cloud);
    }
  }
  update(s, camera) {
    this.root.visible = s.y > -1;
    for (const cloud of this.clouds) cloud.quaternion.copy(camera.quaternion);
  }
}
