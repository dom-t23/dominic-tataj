// Planar quadrotor and its cascaded PD controller (DESIGN_PLAN.md 1.2). No DOM: the hover test
// rig drives it, and it runs on its own too. State: horizontal position x and height z (m),
// tilt th (rad, positive tips the thrust towards +x), their rates, and the thrust T (N) and
// torque tau (N m) the motors are actually producing, a first-order lag behind the commands.

export var M = 0.246;                      // kg, the real drone's all-up mass
export var G = 9.81;
export var I = 3.5e-4;                     // kg m², a 130 mm frame as a uniform bar
export var T_MAX = 4 * M * G;              // thrust-to-weight 4
export var TAU_MAX = 0.065 * T_MAX / 2;    // differential thrust on 65 mm arms
export var TAU_MOTOR = 0.03;               // s, motor and ESC response
export var DRAG = 0.06;                    // N per m/s
export var TILT_MAX = 35 * Math.PI / 180;
export var HALF_H = 0.03;                  // m, body half-height: on the ground z = HALF_H
export var CRASH_SPEED = 1.6;              // m/s down, or tilted past ~57°, and it crashes
// Attitude (inner) loop, fixed: natural frequency 20 rad/s, damping ratio 0.7.
export var KP_ATT = 400, KD_ATT = 28;

function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

export function hovering(x, z) { return { x: x, z: z, th: 0, vx: 0, vz: 0, w: 0, T: M * G, tau: 0 }; }
export function landed(x) { return { x: x, z: HALF_H, th: 0, vx: 0, vz: 0, w: 0, T: 0, tau: 0 }; }

// Advance by dt (keep it near 1/240 s). sp: setpoint {x, z}; g: gains {kp, kd} of the
// position loop; on: motors running; f: external force {x, z} in N.
export function step(q, dt, sp, g, on, f) {
  var Tc = 0, tc = 0;
  if (on) {
    // outer loop: position error to a wanted acceleration, then the thrust vector that gives it
    var ax = g.kp * (sp.x - q.x) - g.kd * q.vx, az = g.kp * (sp.z - q.z) - g.kd * q.vz;
    var fx = M * ax, fz = M * (az + G);
    var thc = clamp(Math.atan2(fx, Math.max(fz, 1e-3)), -TILT_MAX, TILT_MAX);
    Tc = fz > 0 ? clamp(fz / Math.cos(thc), 0, T_MAX) : 0;   // height comes first when tilt saturates
    // inner loop: tilt error to torque
    tc = clamp(I * (KP_ATT * (thc - q.th) - KD_ATT * q.w), -TAU_MAX, TAU_MAX);
  }
  var k = dt / TAU_MOTOR;
  q.T += (Tc - q.T) * k; q.tau += (tc - q.tau) * k;
  var ax2 = (q.T * Math.sin(q.th) + f.x - DRAG * q.vx) / M;
  var az2 = (q.T * Math.cos(q.th) - M * G + f.z - DRAG * q.vz) / M;
  q.vx += ax2 * dt; q.vz += az2 * dt; q.w += (q.tau / I) * dt;   // semi-implicit Euler
  q.x += q.vx * dt; q.z += q.vz * dt; q.th += q.w * dt;
}

// Ground contact at z = 0. Returns the impact speed if the drone came down hard enough (or
// tilted enough) to crash, else 0. A gentle touchdown just rests, and the gear rights it.
export function contact(q, dt) {
  if (q.z >= HALF_H) return 0;
  var speed = Math.hypot(q.vx, q.vz), hard = q.vz < -CRASH_SPEED || Math.abs(q.th) > 1;
  q.z = HALF_H;
  if (q.vz < 0) q.vz = 0;
  q.vx *= Math.exp(-6 * dt); q.w *= Math.exp(-12 * dt);
  if (!hard) q.th *= Math.exp(-12 * dt);
  return hard ? speed : 0;
}

// Linearised about hover (small angles, motor lag ignored), the horizontal axis is
//   s⁴ + KD_ATT s³ + KP_ATT s² + KP_ATT kd s + KP_ATT kp = 0.
// Routh–Hurwitz on it: stable if and only if 0 < kd < KD_ATT and kp < kpLimit(kd).
export function kpLimit(kd) { return kd > 0 && kd < KD_ATT ? kd * (KD_ATT - kd) * KP_ATT / (KD_ATT * KD_ATT) : 0; }
// The stable range of kd for a given kp, or null if there is none.
export function kdRange(kp) {
  var d = 1 - 4 * kp / KP_ATT;
  if (kp <= 0 || d <= 0) return null;
  return [KD_ATT / 2 * (1 - Math.sqrt(d)), KD_ATT / 2 * (1 + Math.sqrt(d))];
}

// The four closed-loop poles [re, im] of that quartic (Durand–Kerner iteration).
export function poles(kp, kd) {
  var c = [KD_ATT, KP_ATT, KP_ATT * kd, KP_ATT * kp];
  var r = Math.max(1, Math.pow(Math.abs(c[3]) + 1, 0.25)), z = [];
  for (var i = 0; i < 4; i++) { var a = 0.4 + 1.2 * i; z.push([r * Math.cos(a), r * Math.sin(a)]); }
  function poly(s) {   // s⁴ + c0 s³ + c1 s² + c2 s + c3 by Horner
    var re = 1, im = 0;
    for (var j = 0; j < 4; j++) { var t = re * s[0] - im * s[1] + c[j]; im = re * s[1] + im * s[0]; re = t; }
    return [re, im];
  }
  for (var it = 0; it < 300; it++) {
    for (var k = 0; k < 4; k++) {
      var num = poly(z[k]), den = [1, 0];
      for (var m = 0; m < 4; m++) {
        if (m === k) continue;
        var d0 = z[k][0] - z[m][0], d1 = z[k][1] - z[m][1];
        den = [den[0] * d0 - den[1] * d1, den[0] * d1 + den[1] * d0];
      }
      var dd = den[0] * den[0] + den[1] * den[1] || 1e-12;
      z[k] = [z[k][0] - (num[0] * den[0] + num[1] * den[1]) / dd, z[k][1] - (num[1] * den[0] - num[0] * den[1]) / dd];
    }
  }
  return z;
}
