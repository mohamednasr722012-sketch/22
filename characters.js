import * as THREE from 'three';

const std = (color, roughness = 0.7) => new THREE.MeshStandardMaterial({ color, roughness });

export class Human {
  constructor(o = {}) {
    const {
      skin = 0xd2a679, hair = 0x1a1a1a, shirt = 0xffffff, pants = 0x2a2a2a,
      shoes = 0x111111, female = false, long = false, heavy = false,
    } = o;

    const skinM = std(skin, 0.55), hairM = std(hair, 0.45), shirtM = std(shirt, 0.85);
    const pantsM = std(pants, 0.8), shoeM = std(shoes, 0.55);
    const whiteM = std(0xfaf8f4, 0.15), irisM = std(0x4a2818, 0.2), blackM = std(0x0a0a0a, 0.6);
    const lipM = std(female ? 0xc4566a : 0x8a5a4a, 0.35);

    this.group = new THREE.Group();
    const add = (mesh, parent = this.group) => { mesh.castShadow = true; parent.add(mesh); return mesh; };

    // Head (pivot at neck)
    this.head = new THREE.Group();
    this.head.position.y = 1.62;
    this.group.add(this.head);

    const face = add(new THREE.Mesh(new THREE.SphereGeometry(0.21, 32, 32), skinM), this.head);
    face.scale.set(1, 1.08, 0.92);

    const jaw = add(new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 20), skinM), this.head);
    jaw.scale.set(1, 0.72, 0.85);
    jaw.position.set(0, -0.09, 0.03);

    for (const side of [-1, 1]) {
      const ear = add(new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 12), skinM), this.head);
      ear.scale.set(0.5, 1.1, 0.7);
      ear.position.set(side * 0.2, 0.02, 0);

      const white = add(new THREE.Mesh(new THREE.SphereGeometry(0.042, 20, 20), whiteM), this.head);
      white.scale.set(1, 1.15, 0.55);
      white.position.set(side * 0.072, 0.04, 0.183);

      const iris = add(new THREE.Mesh(new THREE.SphereGeometry(0.026, 16, 16), irisM), this.head);
      iris.scale.set(1, 1, 0.4);
      iris.position.set(side * 0.072, 0.04, 0.201);

      const pupil = add(new THREE.Mesh(new THREE.SphereGeometry(0.014, 12, 12), blackM), this.head);
      pupil.scale.set(1, 1, 0.4);
      pupil.position.set(side * 0.072, 0.04, 0.209);

      const brow = add(new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.011, 0.012), hairM), this.head);
      brow.position.set(side * 0.072, 0.098, 0.18);
      brow.rotation.z = -side * 0.18;

      if (female) {
        const lash = add(new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.008, 0.012), blackM), this.head);
        lash.position.set(side * 0.072, 0.068, 0.191);
        lash.rotation.z = -side * 0.15;
      }
    }

    const nose = add(new THREE.Mesh(new THREE.SphereGeometry(0.026, 14, 14), skinM), this.head);
    nose.scale.set(1, 0.85, 1.15);
    nose.position.set(0, -0.064, 0.196);

    const upLip = add(new THREE.Mesh(new THREE.SphereGeometry(0.032, 14, 12), lipM), this.head);
    upLip.scale.set(1.45, 0.32, 0.55);
    upLip.position.set(0, -0.07, 0.195);

    const lowLip = add(new THREE.Mesh(new THREE.SphereGeometry(0.032, 14, 12), lipM), this.head);
    lowLip.scale.set(1.25, 0.42, 0.55);
    lowLip.position.set(0, -0.087, 0.193);

    // Hair
    const hairTop = add(new THREE.Mesh(
      new THREE.SphereGeometry(0.218, 28, 24, 0, Math.PI * 2, 0, Math.PI * 0.42), hairM
    ), this.head);
    hairTop.position.y = 0.01;
    hairTop.scale.set(1, 1.05, 0.96);

    if (long) {
      const back = add(new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.32, 6, 12), hairM), this.head);
      back.position.set(0, -0.2, -0.12);
      back.scale.set(1.1, 1, 0.55);
    }

    // Neck and torso
    const neck = add(new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.16, 16), skinM));
    neck.position.y = 1.5;

    const collar = add(new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.105, 0.05, 16), shirtM));
    collar.position.y = 1.4;

    const torsoTop = female ? 0.14 : heavy ? 0.26 : 0.2;
    const torsoBot = female ? 0.17 : heavy ? 0.25 : 0.18;
    const torso = add(new THREE.Mesh(new THREE.CylinderGeometry(torsoTop, torsoBot, 0.6, 24), shirtM));
    torso.position.y = 1.08;
    torso.scale.z = female ? 0.75 : heavy ? 0.85 : 0.7;

    const pelvisR = female ? 0.17 : heavy ? 0.24 : 0.17;
    const pelvis = add(new THREE.Mesh(new THREE.CylinderGeometry(pelvisR, pelvisR * 0.95, 0.16, 24), pantsM));
    pelvis.position.y = 0.8;
    pelvis.scale.z = female ? 0.75 : heavy ? 0.85 : 0.7;

    // Arms
    const shoulderW = female ? 0.18 : heavy ? 0.32 : 0.28;
    const hipW = female ? 0.1 : heavy ? 0.14 : 0.12;
    const armR = female ? 0.075 : heavy ? 0.12 : 0.1;
    const legR = female ? 0.1 : heavy ? 0.15 : 0.12;

    const mkArm = (side) => {
      const pivot = new THREE.Group();
      pivot.position.set(side * shoulderW, 1.38, 0);
      this.group.add(pivot);

      add(new THREE.Mesh(new THREE.CylinderGeometry(armR * 1.15, armR * 1.02, 0.16, 16), shirtM), pivot).position.y = -0.08;
      add(new THREE.Mesh(new THREE.CylinderGeometry(armR, armR * 0.88, 0.3, 16), skinM), pivot).position.y = -0.22;

      const elbow = new THREE.Group();
      elbow.position.y = -0.36;
      pivot.add(elbow);

      add(new THREE.Mesh(new THREE.SphereGeometry(armR * 0.9, 14, 14), skinM), elbow);
      add(new THREE.Mesh(new THREE.CylinderGeometry(armR * 0.88, armR * 0.72, 0.28, 16), skinM), elbow).position.y = -0.14;

      const hand = add(new THREE.Mesh(new THREE.SphereGeometry(armR * 0.88, 14, 14), skinM), elbow);
      hand.scale.set(1, 1.15, 0.7);
      hand.position.y = -0.33;

      return { pivot, elbow };
    };

    // Legs
    const mkLeg = (side) => {
      const pivot = new THREE.Group();
      pivot.position.set(side * hipW, 0.78, 0);
      this.group.add(pivot);

      add(new THREE.Mesh(new THREE.CylinderGeometry(legR * 1.1, legR * 0.9, 0.36, 16), pantsM), pivot).position.y = -0.18;

      const knee = new THREE.Group();
      knee.position.y = -0.36;
      pivot.add(knee);

      add(new THREE.Mesh(new THREE.CylinderGeometry(legR * 0.9, legR * 0.72, 0.34, 16), pantsM), knee).position.y = -0.17;

      const shoe = add(new THREE.Mesh(new THREE.BoxGeometry(legR * 1.5, 0.1, legR * 2.1), shoeM), knee);
      shoe.position.set(0, -0.37, 0.04);

      return { pivot, knee };
    };

    this.leftArm = mkArm(-1);
    this.rightArm = mkArm(1);
    this.leftLeg = mkLeg(-1);
    this.rightLeg = mkLeg(1);
  }
}

const reset = (h) => {
  h.group.position.y = 0;
  h.group.rotation.x = 0;
  h.group.rotation.z = 0;
  h.head.rotation.set(0, 0, 0);
  for (const a of [h.leftArm, h.rightArm]) {
    a.pivot.rotation.set(0, 0, 0);
    a.elbow.rotation.set(-0.05, 0, 0);
  }
  for (const l of [h.leftLeg, h.rightLeg]) {
    l.pivot.rotation.set(0, 0, 0);
    l.knee.rotation.set(0, 0, 0);
  }
};

export const POSES = {
  idle(h, t) {
    reset(h);
    h.group.position.y = Math.sin(t * 1.4) * 0.012;
    h.leftArm.pivot.rotation.z = 0.08;
    h.rightArm.pivot.rotation.z = -0.08;
  },

  walk(h, t) {
    reset(h);
    const s = Math.sin(t * 6);
    h.leftLeg.pivot.rotation.x = s * 0.5;
    h.rightLeg.pivot.rotation.x = -s * 0.5;
    h.leftLeg.knee.rotation.x = Math.max(0, -s) * 0.6;
    h.rightLeg.knee.rotation.x = Math.max(0, s) * 0.6;
    h.leftArm.pivot.rotation.x = -s * 0.4;
    h.rightArm.pivot.rotation.x = s * 0.4;
    h.group.position.y = Math.abs(s) * 0.03;
  },

  talk(h, t) {
    reset(h);
    h.rightArm.pivot.rotation.x = -0.5;
    h.rightArm.elbow.rotation.x = -1.1 + Math.sin(t * 5) * 0.25;
    h.leftArm.pivot.rotation.z = 0.08;
    h.head.rotation.x = Math.sin(t * 4) * 0.03;
    h.group.position.y = Math.sin(t * 1.4) * 0.01;
  },

  cook(h, t) {
    reset(h);
    const s = Math.sin(t * 5);
    h.rightArm.pivot.rotation.x = -1.1 + s * 0.25;
    h.rightArm.pivot.rotation.z = -0.15;
    h.rightArm.elbow.rotation.x = -1.3;
    h.leftArm.pivot.rotation.z = 0.08;
    h.head.rotation.x = 0.2;
  },
};
