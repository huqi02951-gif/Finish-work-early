import { ISLAND } from './ConchIsland.js';
import * as THREE from 'three';
import { SUN } from './SceneLayout.js';
// Multi-scale geometric swells + derivative normals. Both sides of this same mesh
// are rendered: entering water is a camera crossing, never a background swap.
export class OceanSurface {
  constructor() {
    this.material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide, transparent: true, depthWrite: false,
      uniforms: { sunDirection: { value: new THREE.Vector3(...SUN.direction).normalize() }, time: { value: 0 }, eye: { value: new THREE.Vector3() }, island: {value:new THREE.Vector3(ISLAND.x,ISLAND.z,ISLAND.radius)} },
      vertexShader: `
        uniform float time;
        varying vec3 world;
        float wave(vec2 p) {
          return sin(p.x*.12+p.y*.075+time*.9)*.12
            + sin(p.x*.29-p.y*.18-time*1.1)*.06
            + sin(p.y*.54+p.x*.18+time*1.4)*.028;
        }
        void main(){vec3 p=position; p.z=wave(p.xy); world=(modelMatrix*vec4(p,1.)).xyz;
          gl_Position=projectionMatrix*viewMatrix*vec4(world,1.);}
      `,
      fragmentShader: `
        precision highp float;
        uniform float time; uniform vec3 eye; uniform vec3 sunDirection; uniform vec3 island; varying vec3 world;
        float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
        float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
        float surface(vec2 p){return sin(p.x*.21+p.y*.13+time)*.15+sin(p.x*.57-p.y*.32-time*1.3)*.07+noise(p*1.7+time*.17)*.015;}
        void main(){
          vec2 p=world.xz;
          float eps=.06, h=surface(p);
          float footprint=max(length(dFdx(p)),length(dFdy(p)));
          float detail=1./(1.+footprint*3.);
          vec3 n=normalize(vec3((h-surface(p+vec2(eps,0.)))/eps*detail,1.,(h-surface(p+vec2(0.,eps)))/eps*detail));
          vec3 view=normalize(eye-world); if(eye.y<0.) n=-n;
          vec3 sun=normalize(sunDirection);
          float fres=pow(1.-abs(dot(n,view)),4.);
          float spec=pow(max(dot(reflect(-sun,n),view),0.),32.);
          float broad=pow(max(dot(reflect(-sun,n),view),0.),8.);
          float swell=noise(p*.022)+noise(p*.08)*.36;
          vec3 col=mix(vec3(.004,.085,.19),vec3(.012,.30,.40),clamp(swell*.62,0.,1.));
          col=mix(col,vec3(.15,.40,.55),fres*.32);
          col+=vec3(1.,.86,.65)*(spec*.28+broad*.055);
          float foam=smoothstep(.89,.98,noise(p*.9+time*.14))*smoothstep(.65,.92,noise(p*.04));
          col+=foam*.12;
          vec2 local=(p-island.xy)/island.z;
          float angle=atan(local.y,local.x),coast=1.+.065*sin(angle*3.)+.04*sin(angle*7.+.4);
          float radius=length(local*vec2(1.,.88))/coast;
          float land=radius<1.?pow(cos(radius*1.5707963),1.7)*31.:0.;
          land+=exp(-(pow(local.x+.3,2.)/.095+pow(local.y-.14,2.)/.16))*31.;
          land-=exp(-(pow(local.x-.43,2.)/.12+pow(local.y+.36,2.)/.11))*29.;
          float bed=-9.+land;
          float shallows=1.-smoothstep(1.,10.,-bed);
          col=mix(col,vec3(.035,.52,.42),shallows*.86);
          float shoreFoam=exp(-pow((bed+.6)*1.3,2.))*(.35+.65*noise(p*.24+time*.17));
          col+=vec3(.61,.74,.67)*shoreFoam*.25;
          float haze=1.-exp(-length(p-eye.xz)*.00085);
          col=mix(col,vec3(.08,.36,.52),haze*.20);
          if(eye.y<0.) col=mix(vec3(.028,.19,.24),vec3(.3,.72,.72),fres*.8+spec*.2);
          // Below water, the distant ceiling loses contrast through the water column.
          float visibility=eye.y<0. ? exp(-max(-eye.y-2.,0.)*.20) : 1.;
          gl_FragColor=vec4(col,visibility);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `,
    });
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000, 180, 180), this.material);
    this.mesh.rotation.x = -Math.PI / 2;
  }
  update(s, camera) { this.material.uniforms.time.value = s.t; this.material.uniforms.eye.value.copy(camera.position); }
}
