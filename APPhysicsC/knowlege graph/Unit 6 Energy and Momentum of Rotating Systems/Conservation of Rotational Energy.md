# Conservation of Rotational Energy

**Conservation of Energy** still holds for rigid body rotating systems—you just need to include **rotational kinetic energy** in the total energy calculation.

## Total Energy Expression

For a rigid body with both translation and rotation:

$$E_{total} = K_{trans} + K_{rot} + U$$

Where:
- $K_{trans} = \frac{1}{2}mv_{CM}^2$ **translational kinetic energy** of center of mass
- $K_{rot} = \frac{1}{2}I_{CM}\omega^2$ **rotational kinetic energy** about center of mass
- $U$ **potential energy** (gravitational, elastic, etc.)

## Conservation of Energy

When only **conservative forces** do work:

$$E_{total} = \text{constant}$$
$$\Delta K_{trans} + \Delta K_{rot} + \Delta U = 0$$

## Applications

- Rolling without slipping on an incline
- Rotating pendulums
- Satellite orbital transfer (mechanical energy conservation)
- Rotation + translation after collisions

## Example: Pure Rolling Down an Incline

**Example:** A solid cylinder of radius $R$ and mass $m$ rolls down an incline from rest. Find the acceleration of the center of mass.

**Solution (Energy Method):**

Let the vertical drop be $h$. **Condition for pure rolling**: $v_{CM} = R\omega$

Conservation of mechanical energy: $mgh = \frac{1}{2}mv_{CM}^2 + \frac{1}{2}I\omega^2$

For a solid cylinder, $I = \frac{1}{2}mR^2$. Substituting:

$$mgh = \frac{1}{2}mv^2 + \frac{1}{2}(\frac{1}{2}mR^2)(\frac{v^2}{R^2}) = \frac{3}{4}mv^2$$

$$v^2 = \frac{4}{3}gh$$

From kinematics $v^2 = 2ah$, we get $a = \frac{2}{3}g\sin\theta$

## Related Concepts
- [[Conservation of Energy]]
- [[Rotational Kinetic Energy]]
- [[Rolling Motion]]
