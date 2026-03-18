# Example 14: Block and Cylinder on Inclined Plane

## Problem Statement

A cord connected at one end to a block which can slide on an inclined plane has its other end wrapped around a cylinder resting in a depression at the top of the plane. Determine the speed of the block after it has traveled $d = 1.80$ m along the plane, starting from rest.

**Given:**
- Mass of block: $m = 3.0$ kg
- Mass of cylinder: $M = 33$ kg
- Radius of cylinder: $R = 0.20$ m
- Incline angle: $\theta = 27°$ (from horizontal)
- Distance traveled: $d = 1.80$ m

<img src="../Assets/Figure14.jpeg" width="300%" alt="Figure 14" />
*Figure 14: Block on inclined plane connected to cylinder*

**Assume:**
- **(a)** There is no friction
- **(b)** The coefficient of friction between all surfaces is $\mu = 0.035$

*Hint: In part (b) first determine the normal force on the cylinder, and make any reasonable assumptions needed.*

---

## Part (a): No Friction

### Setup

As the block slides down the incline, it pulls the cord, causing the cylinder to rotate. Since the cylinder is in a depression (not rolling on a surface), it rotates about its fixed center.

**Key relationships:**
- The block's speed $v$ equals the tangential speed of the cylinder's rim: $v = R\omega$
- The block loses gravitational potential energy and gains kinetic energy
- The cylinder gains rotational kinetic energy

### Energy Conservation

**Initial energy (at rest at top):**
$$E_i = U_i = mgd\sin\theta$$
(Taking $U = 0$ at the bottom of the block's travel)

**Final energy:**
$$E_f = K_{block} + K_{cylinder}$$

$$E_f = \frac{1}{2}mv^2 + \frac{1}{2}I\omega^2$$

For a solid cylinder rotating about its center:
$$I = \frac{1}{2}MR^2$$

Using $\omega = \frac{v}{R}$:
$$K_{cylinder} = \frac{1}{2}\left(\frac{1}{2}MR^2\right)\left(\frac{v}{R}\right)^2 = \frac{1}{4}Mv^2$$

### Solving for Speed

By energy conservation:
$$mgd\sin\theta = \frac{1}{2}mv^2 + \frac{1}{4}Mv^2$$

$$mgd\sin\theta = v^2\left(\frac{m}{2} + \frac{M}{4}\right)$$

$$v^2 = \frac{mgd\sin\theta}{\frac{m}{2} + \frac{M}{4}}$$

$$v = \sqrt{\frac{4mgd\sin\theta}{2m + M}}$$

### Numerical Calculation

Substituting values:
- $m = 3.0$ kg
- $M = 33$ kg
- $g = 9.8$ m/s²
- $d = 1.80$ m
- $\theta = 27°$
- $\sin(27°) = 0.454$

$$v = \sqrt{\frac{4 \times 3.0 \times 9.8 \times 1.80 \times 0.454}{2 \times 3.0 + 33}}$$

$$v = \sqrt{\frac{95.9}{39}} = \sqrt{2.46} \approx 1.57 \text{ m/s}$$

$$\boxed{v \approx 1.6 \text{ m/s (part a)}}$$

---

## Part (b): With Friction ($\mu = 0.035$)

### Setup

Now we must account for:
1. Friction between the block and the incline
2. Friction in the cylinder's bearing (the cylinder rotates in a depression)

**Assumptions:**
- The cylinder rotates about a fixed axis through its center
- Friction in the bearing provides a resisting torque
- The normal force on the cylinder equals its weight (simplified assumption)

### Forces on the Block

**Normal force:**
$$N = mg\cos\theta$$

**Friction force:**
$$f_k = \mu N = \mu mg\cos\theta$$

**Net force down the incline:**
$$F_{net} = mg\sin\theta - T - f_k = ma$$

where $T$ is the tension in the cord.

### Torque on the Cylinder

The tension $T$ provides a torque that causes angular acceleration:
$$\tau = TR = I\alpha$$

The angular acceleration relates to linear acceleration:
$$a = R\alpha$$

So:
$$TR = I\frac{a}{R} = \frac{1}{2}MR^2 \cdot \frac{a}{R} = \frac{1}{2}MRa$$

$$T = \frac{1}{2}Ma$$

### Bearing Friction (Additional Assumption)

The problem mentions friction "between all surfaces" which includes the bearing of the cylinder. Let's assume the bearing friction provides an additional resisting torque.

A reasonable assumption: The bearing friction torque is proportional to the normal force on the cylinder. If we assume the normal force equals the cylinder's weight $Mg$:

$$\tau_{friction} = \mu Mg \cdot r_{bearing}$$

But we don't know $r_{bearing}$. A simpler approach is to assume the bearing friction is negligible compared to other effects, or that it's included in an effective friction coefficient.

Actually, let's interpret the problem differently. The "friction between all surfaces" might primarily refer to:
1. Block-incline friction
2. Friction in the cylinder's contact with the depression

If the cylinder is fixed and only rotates (doesn't roll), the main friction is in the bearing.

Let me use a simpler model: assume the bearing friction torque is $\tau_f$ and find the relationship, or use energy methods with work done by friction.

### Energy Method with Friction

**Work done by friction on the block:**
$$W_{friction, block} = -f_k \cdot d = -\mu mg\cos\theta \cdot d$$

**Work done by bearing friction:**
Assuming a bearing friction torque $\tau_f$ acts through angle $\theta_{rot} = d/R$:
$$W_{bearing} = -\tau_f \cdot \frac{d}{R}$$

If we assume the bearing friction force is $\mu$ times the normal force on the bearing, and the effective radius is approximately $R$ (simplified):
$$\tau_f \approx \mu Mg \cdot R$$

$$W_{bearing} = -\mu Mg \cdot d$$

**Energy equation:**
$$mgd\sin\theta + W_{friction, block} + W_{bearing} = \frac{1}{2}mv^2 + \frac{1}{2}I\omega^2$$

$$mgd\sin\theta - \mu mg\cos\theta \cdot d - \mu Mg \cdot d = \frac{1}{2}mv^2 + \frac{1}{4}Mv^2$$

$$mgd(\sin\theta - \mu\cos\theta) - \mu Mgd = v^2\left(\frac{m}{2} + \frac{M}{4}\right)$$

### Numerical Calculation

Substituting values:
- $\mu = 0.035$
- $\cos(27°) = 0.891$

$$v^2 = \frac{4[mgd(\sin\theta - \mu\cos\theta) - \mu Mgd]}{2m + M}$$

Calculate the terms:
- $\sin\theta - \mu\cos\theta = 0.454 - 0.035 \times 0.891 = 0.454 - 0.031 = 0.423$
- $mgd(\sin\theta - \mu\cos\theta) = 3.0 \times 9.8 \times 1.80 \times 0.423 = 22.4$ J
- $\mu Mgd = 0.035 \times 33 \times 9.8 \times 1.80 = 20.4$ J

Numerator:
$$4(22.4 - 20.4) = 4 \times 2.0 = 8.0$$

Denominator:
$$2m + M = 6 + 33 = 39$$

$$v^2 = \frac{8.0}{39} = 0.205$$

$$v = \sqrt{0.205} \approx 0.45 \text{ m/s}$$

$$\boxed{v \approx 0.45 \text{ m/s (part b)}}$$

**Note:** The friction significantly reduces the speed from 1.6 m/s to about 0.45 m/s.

---

## Alternative Approach Using Forces (Verification)

For the block:
$$mg\sin\theta - T - \mu mg\cos\theta = ma$$

For the cylinder (including bearing friction torque):
$$TR - \tau_f = I\alpha = \frac{1}{2}MR^2 \cdot \frac{a}{R} = \frac{1}{2}MRa$$

With $\tau_f = \mu MgR$:
$$TR - \mu MgR = \frac{1}{2}MRa$$

$$T = \frac{1}{2}Ma + \mu Mg$$

Substituting into block equation:
$$mg\sin\theta - \frac{1}{2}Ma - \mu Mg - \mu mg\cos\theta = ma$$

$$mg(\sin\theta - \mu\cos\theta) - \mu Mg = a\left(m + \frac{M}{2}\right)$$

$$a = \frac{mg(\sin\theta - \mu\cos\theta) - \mu Mg}{m + \frac{M}{2}}$$

Using kinematics:
$$v^2 = 2ad = \frac{2d[mg(\sin\theta - \mu\cos\theta) - \mu Mg]}{m + \frac{M}{2}} = \frac{4d[mg(\sin\theta - \mu\cos\theta) - \mu Mg]}{2m + M}$$

This matches the energy method result.

---

## Summary of Results

| Case | Speed |
|------|-------|
| (a) No friction | $v \approx 1.6$ m/s |
| (b) With friction ($\mu = 0.035$) | $v \approx 0.45$ m/s |

---

## Key Concepts

1. **Combined Translation and Rotation:** The system involves both translational motion of the block and rotational motion of the cylinder
2. **Energy Methods:** Conservation of energy (part a) and work-energy with friction (part b)
3. **Constraint:** The cord connects the block's linear motion to the cylinder's rotation: $v = R\omega$
4. **Friction Effects:** Both sliding friction and bearing friction dissipate energy

---

## Related Concepts
- [[Moment of Inertia]]
- Rolling Motion
- [[Conservation of Energy]]
- [[Friction Forces]]
- Work-Energy Theorem

## Related Units
- [[Unit 5 Torque and Rotational Dynamics Index]]
- [[Unit 6 Energy and Momentum of Rotating Systems Index]]
- [[Unit 2 Force and Translational Dynamics Index]]

## Source
AP Physics C - Mechanics (Textbook Problem)
