import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
export class WaterTransition {
  constructor(renderer, scene, camera) {
    this.composer = new EffectComposer(renderer);
    this.composer.addPass(new RenderPass(scene, camera));
    this.pass = new ShaderPass({
      uniforms: { tDiffuse: { value: null }, time: { value: 0 }, impact: { value: 0 }, submerged: { value: 0 }, blur: { value: 0 }, shell: { value: 0 }, aspect: { value: 1 }, pulse: { value: -10 }, reduced: { value: 0 } },
      vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader: `
        precision highp float;
        uniform sampler2D tDiffuse;uniform float time,impact,submerged,blur,shell,aspect,pulse,reduced;varying vec2 vUv;
        float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
        float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
        void main(){
          vec2 uv=vUv, q=(uv-.5)*vec2(aspect,1.);float r=length(q);
          float phase=time-10.8;
          // A slanted, turbulent sheet crosses the lens, instead of exposing the
          // sea/reef change in a single unoccluded frame at Y=0. No scene crossfade.
          float entryWindow=smoothstep(-.18,-.07,phase)*(1.-smoothstep(.18,.48,phase));
          float front=mix(1.32,-.35,smoothstep(-.15,.36,phase));
          float sheetNoise=noise(vec2(uv.x*12.,uv.y*5.-phase*11.));
          float sheet=exp(-pow((uv.y-front+(uv.x-.5)*.22+sheetNoise*.14)*2.3,2.))*entryWindow;
          vec2 refract=vec2(sin(uv.y*36.+time*3.8),cos(uv.x*41.-time*3.))*submerged*.0014;
          refract+=normalize(q+.0001)*sin(r*36.-phase*20.)*impact*.021;
          refract+=vec2(sin(uv.y*28.+sheetNoise*5.),cos(uv.x*23.-phase*19.))*sheet*.055;
          refract*=1.-reduced*.8;
          uv=clamp(uv+refract,vec2(.003),vec2(.997));
          vec3 col=vec3(0.);float spread=blur+impact*.012+sheet*.095*(1.-reduced*.75);
          for(int i=0;i<7;i++){float k=float(i)/6.-.5;col+=texture2D(tDiffuse,clamp(uv+(uv-.5)*k*spread,vec2(.002),vec2(.998))).rgb/7.;}
          // Irregular foam advects outward around a clear centre; no full-frame white flash.
          float wave=phase*1.75;
          float turbulent=noise(q*17.+time*2.)*.19;
          float rim=exp(-pow((r-wave+turbulent)*13.,2.))*step(0.,phase);
          float foam=clamp(impact*.055+rim*.55,0.,.77)*(.4+noise(q*68.+time)*.6);
          col=mix(col,vec3(.68,.87,.88),foam);
          float filaments=pow(.5+.5*sin(uv.x*64.+sheetNoise*16.),8.);
          col=mix(col,col*vec3(.47,.76,.85)+vec3(.035,.11,.14),sheet*.74);
          col+=sheet*filaments*vec3(.16,.27,.28);
          // Small refractive bubbles at the lens following actual surface entry.
          float bubbles=0.;
          for(int i=0;i<14;i++){
            float seed=float(i);vec2 pos=vec2(hash(vec2(seed,2.)),hash(vec2(seed,4.)));
            pos.y=fract(pos.y+max(phase,0.)*(.07+pos.x*.11));
            float br=.004+pos.x*.012;float d=length((vUv-pos)*vec2(aspect,1.));
            bubbles+=exp(-pow((d-br)*440.,2.))*.16;
          }
          col+=bubbles*submerged*exp(-max(phase-1.,0.)*.52)*vec3(.45,.66,.7);
          col=mix(col,col*vec3(.59,.88,.95)+vec3(.004,.025,.033),submerged*.5);
          // A small nacre lip, never a full helmet or cartoon character.
          vec2 edge=vec2((vUv.x-1.13)*aspect,vUv.y+.24);
          float er=length(edge);
          float lip=exp(-pow((er-.50)*95.,2.))*shell;
          vec3 pearl=.5+.28*cos(vec3(0.,1.6,3.)+er*110.+time*.21);
          col+=pearl*lip*.21;
          float sonar=exp(-pow((r-(time-pulse)*.43)*90.,2.))*exp(-max(time-pulse,0.)*.7)*step(pulse,time)*submerged;
          col+=vec3(.05,.18,.2)*sonar;
          col*=1.-smoothstep(.3,1.3,r)*.18;
          gl_FragColor=vec4(col,1.);
        }
      `,
    });
    this.composer.addPass(this.pass); this.composer.addPass(new OutputPass());
  }
  update(s, reducedMotion) {
    const u = this.pass.uniforms;
    u.time.value = s.t; u.impact.value = s.impact; u.submerged.value = s.water;
    u.blur.value = s.blur; u.shell.value = s.shell; u.reduced.value = Number(reducedMotion);
  }
  resize(w, h, dpr) { this.composer.setPixelRatio(dpr); this.composer.setSize(w, h); this.pass.uniforms.aspect.value = w / h; }
  render() { this.composer.render(); }
  dispose() { this.composer.dispose(); this.pass.material.dispose(); }
}
