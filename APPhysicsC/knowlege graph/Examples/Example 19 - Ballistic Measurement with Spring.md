# Example 19: Ballistic Measurement with Spring

## Problem Statement

Agent Arlene devised the following method of measuring the muzzle velocity of a rifle. She fires a bullet into a 4.148-kg wooden block resting on a smooth surface, and attached to a spring of spring constant $k = 162.7$ N/m. The bullet, whose mass is 7.450 g, remains embedded in the wooden block. She measures the maximum distance that the block compresses the spring to be 9.460 cm.

<img src="../Assets/Figure19.jpeg" width="300%" alt="Figure 19" />
*Figure 19: Bullet embedding in block attached to spring*

**What is the speed $v$ of the bullet?**

---

## Solution

### Given Information
- Mass of wooden block: $M = 4.148$ kg
- Mass of bullet: $m = 7.450$ g $= 0.007450$ kg
- Spring constant: $k = 162.7$ N/m
- Maximum spring compression: $x_{max} = 9.460$ cm $= 0.09460$ m

### Two-Stage Analysis

This problem involves two distinct physical processes:

**Stage 1: Collision (Inelastic)**
- Bullet embeds in block
- Linear momentum is conserved (no external horizontal forces during the brief collision)
- Kinetic energy is NOT conserved (inelastic collision)

**Stage 2: Spring Compression**  
- Block+bullet compresses spring
- Mechanical energy is conserved (spring force is conservative, surface is smooth)
- Maximum compression occurs when all kinetic energy is converted to spring potential energy

### Stage 2: Finding Velocity Just After Collision

At maximum compression, all kinetic energy has been converted to spring potential energy:

$$\frac{1}{2}(M+m)V^2 = \frac{1}{2}kx_{max}^2$$

where $V$ is the velocity of the block+bullet system immediately after the collision.

Solving for $V$:
$$V = \sqrt{\frac{kx_{max}^2}{M+m}} = x_{max}\sqrt{\frac{k}{M+m}}$$

**Numerical calculation:**
$$M + m = 4.148 + 0.007450 = 4.15545 \text{ kg}$$

$$V = 0.09460 \times \sqrt{\frac{162.7}{4.15545}}$$

$$V = 0.09460 \times \sqrt{39.15}$$

$$V = 0.09460 \times 6.257$$

$$V = 0.5919 \text{ m/s}$$

### Stage 1: Conservation of Momentum

During the collision, momentum is conserved:

$$mv = (M+m)V$$

where $v$ is the initial speed of the bullet.

Solving for $v$:
$$v = \frac{(M+m)V}{m} = \frac{M+m}{m} \cdot V$$

**Numerical calculation:**
$$v = \frac{4.15545}{0.007450} \times 0.5919$$

$$v = 557.8 \times 0.5919$$

$$v = 330.2 \text{ m/s}$$

$$\boxed{v \approx 330 \text{ m/s}}$$

Or with appropriate significant figures:
$$\boxed{v = 3.30 \times 10^2 \text{ m/s} = 330 \text{ m/s}}$$

---

## Combined Formula

We can also combine the two stages into a single formula:

From Stage 2: $V = x_{max}\sqrt{\frac{k}{M+m}}$

From Stage 1: $v = \frac{M+m}{m} \cdot V$

Combining:
$$v = \frac{M+m}{m} \cdot x_{max}\sqrt{\frac{k}{M+m}}$$

$$v = \frac{x_{max}}{m}\sqrt{k(M+m)}$$

**Verification:**
$$v = \frac{0.09460}{0.007450}\sqrt{162.7 \times 4.15545}$$

$$v = 12.70 \times \sqrt{676.1}$$

$$v = 12.70 \times 26.0$$

$$v = 330 \text{ m/s} \checkmark$$

---

## Key Concepts

1. **Two-Stage Problem:** Collision + energy conservation
2. **Inelastic Collision:** Momentum conserved, kinetic energy NOT conserved
3. **Energy Conservation:** After collision, mechanical energy is conserved
4. **Maximum Compression:** All kinetic energy converted to spring potential energy

---

## Comparison with Traditional Ballistic Pendulum

Traditional ballistic pendulum:
- Uses conservation of momentum + conservation of energy (gravitational potential)
- Measures height $h$ that block rises
- Formula: $v = \frac{M+m}{m}\sqrt{2gh}$

This spring method:
- Uses conservation of momentum + spring potential energy
- Measures compression distance $x$
- Formula: $v = \frac{M+m}{m}\sqrt{\frac{k}{M+m}}x = \frac{x}{m}\sqrt{k(M+m)}$

---

## Related Concepts
- [[Conservation of Energy]]
- Conservation of Linear Momentum
- Collisions (Inelastic)
- Springs and Elastic Potential Energy

## Related Units
- [[Unit 2 Force and Translational Dynamics Index]]
- [[Unit 6 Energy and Momentum of Rotating Systems Index]]

## Source
AP Physics C - Mechanics (Textbook Problem)
