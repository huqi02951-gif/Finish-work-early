import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/*! @license Island profile adapted from ProfRino/tideline. Copyright (c) 2026 Rino Lovreglio. MIT: /licenses/tideline-MIT.txt */
// The cosine shoreline profile is adapted from ProfRino/tideline (MIT).
// Copyright (c) 2026 Rino Lovreglio. Full notice: licenses/tideline-MIT.txt.
// Shape, vegetation, materials, framing and integration below are original.
export const ISLAND = Object.freeze({ x:0, z:-500, radius:148 });
export function islandHeight(x,z) {
  const dx=(x-ISLAND.x)/ISLAND.radius,dz=(z-ISLAND.z)/ISLAND.radius;
  const angle=Math.atan2(dz,dx),shore=1+.065*Math.sin(angle*3)+.04*Math.sin(angle*7+.4);
  const d=Math.hypot(dx,dz*.88)/shore;
  if(d>=1.14)return -12;
  const base=d<1?Math.pow(Math.cos(d*Math.PI*.5),1.7)*31:0;
  const ridge=Math.exp(-((dx+.3)**2/.095+(dz-.14)**2/.16))*31;
  const lagoon=Math.exp(-((dx-.43)**2/.12+(dz+.36)**2/.11))*29;
  const texture=Math.sin(x*.19+z*.08)*Math.sin(z*.22-x*.04)*Math.min(1,base/6)*.22;
  return -9+base+ridge-lagoon+texture;
}
export function islandView(camera,time=0,reducedMotion=false) {
  const portrait=camera.aspect<1,distance=390*Math.max(1,.80/camera.aspect);
  const drift=reducedMotion?0:Math.sin(time*.065)*.025;
  camera.position.set(ISLAND.x+distance*(.55+drift),distance*.57,ISLAND.z+distance*.78);
  camera.fov=50;camera.lookAt(ISLAND.x-(portrait?0:115),portrait?-95:-5,ISLAND.z);
  camera.updateProjectionMatrix();camera.updateMatrixWorld();
}
function frondGeometry(length,width,bend) {
  const positions=[],indices=[],steps=14;
  for(let j=0;j<=steps;j++){
    const t=j/steps,spread=Math.sin(t*Math.PI)*width*(1+.11*Math.sin(t*45));
    const y=Math.sin(t*Math.PI)*length*.26-bend*t*t,z=length*t;
    positions.push(-spread,y,z,0,y+.08*Math.sin(t*Math.PI),z+.03,spread,y,z);
    if(j<steps){const a=j*3;indices.push(a,a+3,a+1,a+1,a+3,a+4,a+1,a+4,a+2,a+2,a+4,a+5);}
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}
export class ConchIsland {
  constructor() {
    this.root=new THREE.Group();this.root.name='LittleConchIsland';
    const geometry=new THREE.PlaneGeometry(360,360,144,144),pos=geometry.attributes.position,colors=[];
    const sand=new THREE.Color(0xefce8e),moss=new THREE.Color(0x286f3e),rock=new THREE.Color(0x496354),deep=new THREE.Color(0x305d61);
    for(let i=0;i<pos.count;i++){
      const x=pos.getX(i),z=-pos.getY(i)+ISLAND.z,h=islandHeight(x,z);pos.setZ(i,h);
      const color=h<0?deep.clone().lerp(sand,THREE.MathUtils.smoothstep(h,-9,0)):sand.clone().lerp(moss,THREE.MathUtils.smoothstep(h,2,11));
      if(h>24)color.lerp(rock,THREE.MathUtils.smoothstep(h,24,48)*.78);
      color.multiplyScalar(.94+.055*Math.sin(x*.42+z*.17));colors.push(color.r,color.g,color.b);
    }
    geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.computeVertexNormals();
    const material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95});
    // World-space sand grains and rock striations; no low-resolution picture stretched over a mesh.
    material.onBeforeCompile=shader=>{
      shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 islandWorld;').replace('#include <begin_vertex>','#include <begin_vertex>\nislandWorld=(modelMatrix*vec4(position,1.)).xyz;');
      shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 islandWorld;').replace('#include <color_fragment>',`#include <color_fragment>
        float grain=fract(sin(dot(floor(islandWorld.xz*7.),vec2(127.1,311.7)))*43758.5453);
        float strata=sin(islandWorld.y*2.5+sin(islandWorld.x*.17)*2.);
        diffuseColor.rgb*=.91+.10*grain+.025*strata;`);
    };
    const terrain=new THREE.Mesh(geometry,material);terrain.rotation.x=-Math.PI/2;terrain.position.z=ISLAND.z;terrain.receiveShadow=true;this.root.add(terrain);this.terrain=terrain;
    const trunkMaterial=new THREE.MeshStandardMaterial({color:0x827053,roughness:.95});
    const leafMaterial=new THREE.MeshStandardMaterial({color:0x307d3f,roughness:.82,side:THREE.DoubleSide});
    const trunks=[],leaves=[],rocks=[];
    for(let i=0;i<96;i++){
      const angle=i*2.399963,r=25+Math.sqrt(i/96)*100,x=Math.cos(angle)*r,z=ISLAND.z+Math.sin(angle)*r*.82,h=islandHeight(x,z);
      if(h<2.7||h>36)continue;
      const height=8.5+(i%5)*1.4,lean=Math.sin(i*7)*1.2;
      const path=new THREE.CatmullRomCurve3([new THREE.Vector3(x,h,z),new THREE.Vector3(x+lean*.3,h+height*.5,z+.5),new THREE.Vector3(x+lean,h+height,z+.7)]);
      trunks.push(new THREE.TubeGeometry(path,8,.18+(i%3)*.035,6,false));
      for(let j=0;j<9;j++){
        const frond=frondGeometry(4.8+(i%4)*.4,.42+(j%2)*.12,1.85);
        const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(.04+Math.sin(j)*.05,j*Math.PI*2/9+i*.17,.05));
        frond.applyQuaternion(q);frond.translate(x+lean,h+height,z+.7);leaves.push(frond);
      }
    }
    for(const [parts,mat] of [[trunks,trunkMaterial],[leaves,leafMaterial]]){
      if(!parts.length)continue;const merged=mergeGeometries(parts);parts.forEach(g=>g.dispose());const mesh=new THREE.Mesh(merged,mat);mesh.castShadow=true;mesh.receiveShadow=true;this.root.add(mesh);
    }
    const rockGeo=new THREE.IcosahedronGeometry(1,1),rockMat=new THREE.MeshStandardMaterial({color:0x64706a,roughness:1});
    const boulders=new THREE.InstancedMesh(rockGeo,rockMat,48),dummy=new THREE.Object3D();
    for(let i=0;i<48;i++){
      const a=i*2.399963,r=85+i%6*7,x=Math.cos(a)*r,z=ISLAND.z+Math.sin(a)*r*.84,h=islandHeight(x,z);
      dummy.position.set(x,Math.max(-.7,h),z);dummy.rotation.set(i*.4,i*1.7,i*.1);dummy.scale.setScalar(h<-.2?0:1);dummy.scale.multiply(new THREE.Vector3(1.7+i%4,1.2+i%3,2+i%4));dummy.updateMatrix();boulders.setMatrixAt(i,dummy.matrix);
    }
    boulders.castShadow=true;boulders.receiveShadow=true;this.root.add(boulders);
  }
  update(state) { this.root.visible=state.y>-3; }
}
