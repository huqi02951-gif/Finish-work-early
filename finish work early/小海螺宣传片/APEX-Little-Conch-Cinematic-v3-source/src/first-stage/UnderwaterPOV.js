import * as THREE from 'three';
import { diveDepth } from './DiveNavigation.js';
export function createBackdropGeometry() {
  const positions=[], uvs=[], indices=[], nx=64, ny=40;
  for(let j=0;j<=ny;j++) for(let i=0;i<=nx;i++) {
    const u=i/nx,v=j/ny,yaw=(u-.5)*Math.PI*1.35,pitch=(v-.5)*2.7,r=220;
    positions.push(Math.sin(yaw)*Math.cos(pitch)*r, Math.sin(pitch)*r, -Math.cos(yaw)*Math.cos(pitch)*r);
    uvs.push(u,v);
    if(i<nx&&j<ny){const a=j*(nx+1)+i,b=a+1,c=a+nx+1,d=c+1;indices.push(a,b,c,b,d,c);}
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);
  // Rotate the whole patch. Offsetting latitude past -PI/2 folds the last rows
  // back over themselves, producing a pinched reef and a visible triangular gap.
  geometry.rotateX(-.48); geometry.translate(0,-18,-12);
  return geometry;
}
export class UnderwaterPOV {
  constructor(texture, mobile) {
    this.root = new THREE.Group();
    const material = new THREE.MeshBasicMaterial({ map: texture, color: 0xbce1d9 });
    // A world-space curved cyclorama covers the entire camera arc. The original
    // photographic V3 seabed is a distant plate, not falsely labelled a 3D reef.
    const domeGeometry=createBackdropGeometry();
    material.side=THREE.DoubleSide;
    this.root.add(new THREE.Mesh(domeGeometry,material));
    const count = mobile ? 110 : 210, positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = Math.sin(i * 87.31) * 50;
      positions[i * 3 + 1] = -1 - (i * 11.34 % 85);
      positions[i * 3 + 2] = 7 - (i * 17.97 % 110);
    }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pointMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false,
      uniforms: { time: { value: 0 }, pixelRatio: { value: Math.min(devicePixelRatio, 1.5) } },
      vertexShader: `uniform float time;uniform float pixelRatio;varying float alpha;
        void main(){vec3 p=position;p.y+=mod(time*.55+position.x*.1,9.);p.x+=sin(time*.3+p.z)*.4;
          vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(65.*pixelRatio/-mv.z,1.5,13.);alpha=clamp(1.-length(mv.xyz)/90.,0.,1.);}`,
      fragmentShader: `varying float alpha;void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;float ring=exp(-pow((r-.73)*9.,2.));gl_FragColor=vec4(.63,.87,.9,(ring*.33+(1.-r)*.12)*alpha);}`,
    });
    this.particles = new THREE.Points(geometry, pointMat); this.root.add(this.particles);
  }
  update(s, progress = 0) { this.root.position.y = -(diveDepth(progress) - 18)*.68; this.root.visible = s.y < 3; this.particles.material.uniforms.time.value = s.t; }
}
