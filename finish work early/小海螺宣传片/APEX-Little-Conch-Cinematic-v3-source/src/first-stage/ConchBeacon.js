import * as THREE from 'three';
import { smooth } from './FreefallSequence.js';

// Adapted from the owner's Gemini M2 logarithmic shell. Real geometry, one
// renderer and the existing camera; no second canvas or legacy CDN dependency.
export function createConchGeometry() {
  const positions=[], colors=[], indices=[], uSteps=140, vSteps=32;
  const gold=new THREE.Color(0xedce9f), cyan=new THREE.Color(0x7ce8f5), deep=new THREE.Color(0x0c2d48);
  for(let i=0;i<=uSteps;i++) {
    const u=i/uSteps*4.8*Math.PI*2, growth=Math.exp(.115*u)*.085, tube=growth*.56;
    for(let j=0;j<=vSteps;j++) {
      const v=j/vSteps*Math.PI*2, ridge=1+.08*Math.sin(v*7)*Math.sin(u*2);
      const r=(growth+tube*Math.cos(v))*ridge;
      positions.push(r*Math.cos(u),-.135*u+1.35+tube*Math.sin(v)*ridge,r*Math.sin(u));
      const color=deep.clone().lerp(cyan,Math.sin(v*.5)*.55+.25).lerp(gold,Math.pow(i/uSteps,1.4));
      colors.push(color.r,color.g,color.b);
      if(i<uSteps&&j<vSteps){const a=i*(vSteps+1)+j,b=a+vSteps+1;indices.push(a,b,a+1,b,b+1,a+1);}
    }
  }
  const geometry=new THREE.BufferGeometry();geometry.setIndex(indices);
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  geometry.computeVertexNormals();geometry.center();geometry.computeBoundingSphere();
  return geometry;
}
export class ConchBeacon {
  constructor() {
    this.root=new THREE.Group();this.root.name='M2ConchBeacon';this.shell=new THREE.Group();this.root.add(this.shell);
    const geometry=createConchGeometry();this.radius=geometry.boundingSphere.radius;
    this.shell.add(new THREE.Mesh(geometry,new THREE.MeshPhysicalMaterial({vertexColors:true,metalness:.28,roughness:.28,clearcoat:.7,clearcoatRoughness:.2,side:THREE.DoubleSide})));
    const ringMaterial=new THREE.MeshBasicMaterial({color:0x7ce8f5,transparent:true,opacity:.25,side:THREE.DoubleSide,depthWrite:false});
    this.ring=new THREE.Mesh(new THREE.RingGeometry(this.radius*1.15,this.radius*1.16,80),ringMaterial);this.ring.rotation.x=-Math.PI*.35;this.shell.add(this.ring);
    this.nodes=new THREE.Group();this.shell.add(this.nodes);
    for(let i=0;i<4;i++){
      const node=new THREE.Mesh(new THREE.OctahedronGeometry(.12,1),new THREE.MeshBasicMaterial({color:[0x7ce8f5,0xedce9f,0x34d399,0xfbbf24][i]}));
      node.position.set(Math.cos(i*Math.PI/2)*this.radius*1.3,(i-1.5)*.25,Math.sin(i*Math.PI/2)*this.radius*1.3);this.nodes.add(node);
    }
    this.light=new THREE.PointLight(0x7ce8f5,12,30,2);this.light.position.set(-2,3,4);this.root.add(this.light);
    this.localPosition=new THREE.Vector3();
  }
  update(state,progress,camera,time,reducedMotion) {
    const reveal=1-smooth(.10,.14,progress)+smooth(.87,.90,progress)*(1-smooth(.965,.975,progress));
    this.root.visible=state.t>=18.5&&reveal>.01;
    if(!this.root.visible)return;
    const distance=16,halfHeight=distance*Math.tan(camera.fov*Math.PI/360),portrait=camera.aspect<1,compact=portrait&&camera.aspect>.52;
    this.localPosition.set(portrait?0:halfHeight*camera.aspect*.46,halfHeight*(compact?.32:portrait?.45:.10),-distance);
    this.root.position.copy(camera.localToWorld(this.localPosition));this.root.quaternion.copy(camera.quaternion);
    const size=halfHeight*(portrait?.24:.36)/this.radius;
    this.shell.scale.setScalar(size*reveal);
    this.shell.rotation.set(.20,reducedMotion?.4:.4+time*.10, -.16);
    this.nodes.rotation.y=reducedMotion?0:-time*.18;
  }
}
