import * as THREE from 'three';
import './style.css';

const $ = id => document.getElementById(id);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x090713);
scene.fog = new THREE.FogExp2(0x090713, 0.014);

const camera = new THREE.PerspectiveCamera(65, innerWidth/innerHeight, .1, 220);
camera.position.set(0,5,10);

const renderer = new THREE.WebGLRenderer({antialias:true, powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xbabaff,0x18091f,2));
const moonLight=new THREE.DirectionalLight(0xc9caff,2.5);
moonLight.position.set(-8,15,5);
moonLight.castShadow=true;
scene.add(moonLight);

const pink=new THREE.MeshStandardMaterial({color:0xff35bf,emissive:0xd90088,emissiveIntensity:2});
const blue=new THREE.MeshStandardMaterial({color:0x20d9ff,emissive:0x0088bb,emissiveIntensity:1.8});
const concrete=new THREE.MeshStandardMaterial({color:0x30283e,roughness:.85});
const dark=new THREE.MeshStandardMaterial({color:0x15111e,roughness:.65});
const black=new THREE.MeshStandardMaterial({color:0x100d17});
const bone=new THREE.MeshStandardMaterial({color:0xded4d4});
const capeMat=new THREE.MeshStandardMaterial({color:0x570e3d,roughness:.8});

function box(parent,size,material,pos,rot=[0,0,0]){
 const m=new THREE.Mesh(new THREE.BoxGeometry(...size),material);
 m.position.set(...pos);m.rotation.set(...rot);
 m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
}
function cyl(parent,r,h,material,pos,rot=[0,0,0]){
 const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,12),material);
 m.position.set(...pos);m.rotation.set(...rot);m.castShadow=true;parent.add(m);return m;
}

// Skate lane
box(scene,[14,.4,190],dark,[0,-.4,-75]);
box(scene,[12,.12,180],concrete,[0,-.14,-75]);
for(const x of [-6,6])box(scene,[.08,.04,180],pink,[x,-.05,-75]);
for(let z=5;z>-160;z-=8)box(scene,[.06,.025,1.5],blue,[0,-.06,z]);

// Moon and gothic skyline
const moon=new THREE.Mesh(new THREE.SphereGeometry(2.7,24,16),new THREE.MeshBasicMaterial({color:0xc8c4ff}));
moon.position.set(-12,14,-60);scene.add(moon);

for(let i=0;i<32;i++){
 const side=i%2?1:-1,z=4-Math.floor(i/2)*9;
 const x=side*(9+Math.random()*5),h=4+Math.random()*8,w=3+Math.random()*3;
 box(scene,[w,h,4],i%3?dark:concrete,[x,h/2-.2,z]);
 const roof=new THREE.Mesh(new THREE.ConeGeometry(w*.7,2,4),black);
 roof.position.set(x,h+.7,z);roof.rotation.y=Math.PI/4;scene.add(roof);
 if(i%4===0){
  const glow=new THREE.PointLight(side>0?0xff22b8:0x20cfff,3,12);
  glow.position.set(x,2,z);scene.add(glow);
 }
}
for(let z=4;z>-150;z-=14){
 for(const side of [-1,1]){
  const x=side*7.2;
  cyl(scene,.06,3,dark,[x,1.4,z]);
  box(scene,[.65,.12,.18],side<0?blue:pink,[x,2.9,z]);
 }
}

// Tombstones
for(let z=0;z>-145;z-=12){
 for(const x of [-7.4,7.4]){
  box(scene,[.7,.9,.22],concrete,[x,.45,z+(x<0?0:-4)]);
  const top=new THREE.Mesh(new THREE.SphereGeometry(.35,10,8),concrete);
  top.scale.y=.7;top.position.set(x,.9,z+(x<0?0:-4));scene.add(top);
 }
}

// Skateboard
const skater=new THREE.Group();scene.add(skater);
const board=new THREE.Group();skater.add(board);
box(board,[.7,.12,1.8],black,[0,.1,0]);
box(board,[.62,.025,1.6],pink,[0,.17,0]);
for(const x of [-.28,.28])for(const z of [-.58,.58]){
 cyl(board,.13,.12,black,[x,-.05,z],[0,0,Math.PI/2]);
 cyl(board,.05,.12,blue,[x,-.05,z],[0,0,Math.PI/2]);
}

// Stylized vampire skater
const body=new THREE.Group();body.position.y=.3;skater.add(body);
box(body,[.58,.7,.35],black,[0,.8,0],[0,0,-.08]);
box(body,[.7,.85,.12],capeMat,[0,.72,-.25],[.1,0,.04]);
cyl(body,.23,.32,bone,[0,1.28,0]);
const head=new THREE.Mesh(new THREE.SphereGeometry(.28,16,12),bone);
head.position.set(0,1.63,.03);body.add(head);
box(body,[.55,.12,.42],black,[0,1.85,0]);
for(const side of [-1,1]){
 const ear=new THREE.Mesh(new THREE.ConeGeometry(.08,.22,6),bone);
 ear.position.set(side*.27,1.7,0);ear.rotation.z=-side*.3;body.add(ear);
 const eye=new THREE.Mesh(new THREE.SphereGeometry(.045,8,6),pink);
 eye.position.set(side*.1,1.64,.27);body.add(eye);
}
for(const side of [-1,1]){
 const arm=new THREE.Mesh(new THREE.CylinderGeometry(.075,.09,.48,8),black);
 arm.position.set(side*.38,.88,.05);arm.rotation.z=-side*.5;body.add(arm);
 const leg=new THREE.Mesh(new THREE.CylinderGeometry(.09,.12,.5,8),black);
 leg.position.set(side*.17,.22,.08);leg.rotation.z=side*.12;body.add(leg);
}
skater.position.set(0,0,3);

// Obstacles
const obstacles=[];
function obstacle(type,x,z){
 const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
 let width=1.3,depth=1.2,height=1;
 if(type==='rail'){
  cyl(g,.07,5,blue,[0,1,0],[Math.PI/2,0,0]);
  for(const dz of [-2,2])cyl(g,.06,1,dark,[0,.5,dz]);
  width=.7;depth=2.5;height=1.1;
 }else if(type==='ramp'){
  box(g,[3.2,.25,4],concrete,[0,.35,0],[.18,0,0]);
  box(g,[3.15,.06,3.9],pink,[0,.5,0],[.18,0,0]);
  width=1.8;depth=2;height=.7;
 }else{
  box(g,[2,.85,1.6],concrete,[0,.43,0]);
  box(g,[2.02,.07,1.62],blue,[0,.88,0]);
  width=1.2;depth=1;height=.95;
 }
 obstacles.push({g,type,x,z,width,depth,height,hit:false});
}
obstacle('ramp',-2.8,-12);
obstacle('rail',2.4,-25);
obstacle('box',-1.7,-38);
obstacle('rail',-3,-51);
obstacle('ramp',2.8,-64);
obstacle('box',1.5,-77);
obstacle('rail',-2.5,-90);
obstacle('ramp',-2.7,-103);
obstacle('box',2.3,-117);
obstacle('rail',2.7,-131);
obstacle('ramp',0,-145);

// Floating mist particles
const count=500,positions=new Float32Array(count*3);
for(let i=0;i<count;i++){
 positions[i*3]=(Math.random()-.5)*22;
 positions[i*3+1]=Math.random()*5;
 positions[i*3+2]=-Math.random()*160;
}
const fogGeo=new THREE.BufferGeometry();
fogGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));
const fog=new THREE.Points(fogGeo,new THREE.PointsMaterial({color:0xa67bc7,size:.07,transparent:true,opacity:.55}));
scene.add(fog);

const state={running:false,lane:0,jump:0,jumpV:0,speed:0,score:0,distance:0};
const keys=new Set(),touch={left:false,right:false,jump:false,boost:false,brake:false};
window.addEventListener('keydown',e=>{
 keys.add(e.code);
 if(['Space','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.code))e.preventDefault();
 if(e.code==='Space'&&state.running&&state.jump===0)state.jumpV=7.5;
});
window.addEventListener('keyup',e=>keys.delete(e.code));
window.addEventListener('blur',()=>{keys.clear();Object.keys(touch).forEach(k=>touch[k]=false)});

document.querySelectorAll('[data-key]').forEach(b=>{
 const a=b.dataset.key;
 const down=e=>{e.preventDefault();touch[a]=true;if(a==='jump'&&state.running&&state.jump===0)state.jumpV=7.5};
 const up=e=>{e.preventDefault();touch[a]=false};
 b.addEventListener('pointerdown',down);
 b.addEventListener('pointerup',up);
 b.addEventListener('pointercancel',up);
 b.addEventListener('pointerleave',up);
});

function start(){
 state.running=true;state.lane=0;state.jump=0;state.jumpV=0;state.speed=8;state.score=0;state.distance=0;
 obstacles.forEach(o=>{o.g.position.z=o.z;o.hit=false});
 skater.position.set(0,0,3);
 $('intro').classList.add('hidden');
}
$('start').addEventListener('click',start);

function update(dt){
 if(!state.running)return;
 const left=keys.has('KeyA')||keys.has('ArrowLeft')||touch.left;
 const right=keys.has('KeyD')||keys.has('ArrowRight')||touch.right;
 const boost=keys.has('ShiftLeft')||keys.has('ShiftRight')||touch.boost;
 const brake=keys.has('KeyS')||keys.has('ArrowDown')||touch.brake;
 state.speed=THREE.MathUtils.damp(state.speed,boost?17:brake?4:10,2,dt);
 if(left&&!right)state.lane-=dt*7;
 if(right&&!left)state.lane+=dt*7;
 state.lane=THREE.MathUtils.clamp(state.lane,-4.8,4.8);
 state.jumpV-=18*dt;
 state.jump=Math.max(0,state.jump+state.jumpV*dt);
 if(state.jump===0)state.jumpV=0;
 skater.position.x=THREE.MathUtils.damp(skater.position.x,state.lane,8,dt);
 skater.position.y=state.jump;
 skater.rotation.z=THREE.MathUtils.damp(skater.rotation.z,right?-.16:left?.16:0,5,dt);
 body.rotation.x=state.jump>.2?-.15:Math.sin(performance.now()*.008)*.025;
 board.rotation.z=skater.rotation.z*.5;

 for(const o of obstacles){
  o.g.position.z+=state.speed*dt;
  if(o.g.position.z>10){o.g.position.z-=155;o.hit=false}
  if(!o.hit&&Math.abs(o.g.position.z-skater.position.z)<o.depth*.5+.55&&Math.abs(o.x-skater.position.x)<o.width*.5+.38){
   if(state.jump<o.height+.15){
    state.running=false;
    $('intro').classList.remove('hidden');
    $('intro').querySelector('h1').innerHTML='CURSED<br><em>WIPEOUT</em>';
    $('intro').querySelector('p').textContent='Ночь победила. Попробуй ещё раз.';
    $('start').textContent='TRY AGAIN';
   }else{
    o.hit=true;state.score+=500;
    $('toast').textContent='CLEAN TRICK +500';
    $('toast').animate([{opacity:0,transform:'translate(-50%,12px)'},{opacity:1,transform:'translate(-50%,0)'},{opacity:0}],{duration:1000});
   }
  }
 }
 state.distance+=state.speed*dt;
 state.score+=Math.floor(state.speed*dt*2);
 $('score').textContent=String(state.score).padStart(6,'0');
 $('speed').textContent=String(Math.round(state.speed*3.6));
 camera.position.x=THREE.MathUtils.damp(camera.position.x,skater.position.x*.3,2,dt);
 camera.position.y=5+state.jump*.15;
 camera.lookAt(skater.position.x*.35,1.2+state.jump*.2,-4);
 fog.rotation.y=Math.sin(performance.now()*.0001)*.03;
}

const clock=new THREE.Clock();
function animate(){
 requestAnimationFrame(animate);
 const dt=Math.min(clock.getDelta(),.035);
 update(dt);
 renderer.render(scene,camera);
}
animate();

window.addEventListener('resize',()=>{
 camera.aspect=innerWidth/innerHeight;
 camera.updateProjectionMatrix();
 renderer.setSize(innerWidth,innerHeight);
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
});
