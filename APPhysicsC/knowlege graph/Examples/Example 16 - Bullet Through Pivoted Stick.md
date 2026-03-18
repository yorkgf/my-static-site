# Example 16: Bullet Through Pivoted Stick

## Problem Statement

A uniform stick 1.0 m long with a total mass of 270 g is pivoted at its center. A 3.5-g bullet is shot through the stick midway between the pivot and one end. The bullet approaches at 250 m/s and leaves at 140 m/s. 

<img src="../Assets/Figure16.jpeg" width="300%" alt="Figure 16" />
*Figure 16: Bullet passing through a pivoted stick*

**With what angular speed is the stick spinning after the collision?**

---

## Solution

### Given Information
- Stick length: $L = 1.0$ m
- Stick mass: $M = 270$ g $= 0.270$ kg
- Bullet mass: $m = 3.5$ g $= 0.0035$ kg
- Bullet initial velocity: $v_i = 250$ m/s
- Bullet final velocity: $v_f = 140$ m/s
- Bullet hits at: $r = L/4 = 0.25$ m from pivot (midway between center and end)

### Conservation of Angular Momentum

Since the stick is pivoted at its center and there's no external torque about the pivot (gravity acts through the pivot), angular momentum about the pivot is conserved.

**Initial angular momentum:**
$$L_i = m v_i r$$

(The stick is initially at rest, so it contributes zero angular momentum)

**Final angular momentum:**
$$L_f = m v_f r + I_{stick}\omega$$

The bullet still has angular momentum after passing through (it's moving at $v_f$), and the stick now rotates with angular velocity $\omega$.

**Moment of inertia of the stick about its center:**
$$I_{stick} = \frac{1}{12}ML^2 = \frac{1}{12}(0.270)(1.0)^2 = 0.0225 \text{ kg·m}^2$$

### Setting up the equation

$$L_i = L_f$$

$$m v_i r = m v_f r + I_{stick}\omega$$

Solving for $\omega$:
$$I_{stick}\omega = m r (v_i - v_f)$$

$$\omega = \frac{m r (v_i - v_f)}{I_{stick}}$$

### Numerical Calculation

Substituting values:
$$\omega = \frac{(0.0035)(0.25)(250 - 140)}{0.0225}$$

$$\omega = \frac{0.0035 \times 0.25 \times 110}{0.0225}$$

$$\omega = \frac{0.09625}{0.0225}$$

$$\omega = 4.28 \text{ rad/s}$$

$$\boxed{\omega \approx 4.3 \text{ rad/s}}$$

---

## Alternative Interpretation

If the problem intends for the bullet to exit with velocity 140 m/s relative to the stick (unlikely given the phrasing), the calculation would differ. But based on the standard interpretation where velocities are measured in the lab frame, the answer is $\omega \approx 4.3$ rad/s.

**Direction:** The stick rotates in the same direction as the bullet's initial angular momentum (counterclockwise if bullet moves right to left above the pivot).

---

## Key Concepts

1. **Conservation of Angular Momentum:** About a fixed pivot with no external torques
2. **Inelastic Collision:** The bullet loses energy but angular momentum is conserved
3. **Moment of Inertia of a Rod:** $I = \frac{1}{12}ML^2$ about the center
4. **Angular Momentum of a Particle:** $L = mvr$ for motion perpendicular to radius

---

## Related Concepts
- [[Conservation of Angular Momentum]]
- [[Moment of Inertia]]
- Collisions and Impulse

## Related Units
- [[Unit 5 Torque and Rotational Dynamics Index]]
- [[Unit 6 Energy and Momentum of Rotating Systems Index]]

## Source
AP Physics C - Mechanics (Textbook Problem)
