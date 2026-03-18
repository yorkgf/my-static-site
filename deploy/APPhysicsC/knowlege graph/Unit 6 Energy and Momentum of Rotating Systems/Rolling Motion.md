# Rolling Motion

**Pure rolling** is motion where a rigid body undergoes both translation and rotation **without slipping**.

## Condition for Pure Rolling

$$v_{\text{CM}} = R\omega$$

or

$$a_{\text{CM}} = R\alpha$$

Where:
- $v_{\text{CM}}$ = velocity of **center of mass**
- $a_{\text{CM}}$ = acceleration of center of mass
- $R$ = radius of the rigid body
- $\omega$ = **angular velocity**
- $\alpha$ = **angular acceleration**

## Acceleration Down an Incline

The acceleration of a rigid body rolling without slipping down an inclined plane:

$$a = \frac{g\sin\theta}{1 + \frac{I_{CM}}{mR^2}}$$

Where $I_{CM}$ is the **moment of inertia** about the center of mass axis.

## Values for Common Rigid Bodies

| Body | $\frac{I_{CM}}{mR^2}$ | Acceleration $a$ |
|------|------------|-----|
| Solid sphere | $2/5$ | $\frac{5}{7}g\sin\theta$ |
| Solid disk/cylinder | $1/2$ | $\frac{2}{3}g\sin\theta$ |
| Spherical shell | $2/3$ | $\frac{3}{5}g\sin\theta$ |
| Hollow cylinder | $1$ | $\frac{1}{2}g\sin\theta$ |

## Example

**Example:** Compare the acceleration of a solid sphere and a solid cylinder rolling down the same incline from rest.

**Solution:**
- Solid sphere: $a = \frac{g\sin\theta}{1 + 2/5} = \frac{5}{7}g\sin\theta \approx 0.714g\sin\theta$
- Solid cylinder: $a = \frac{g\sin\theta}{1 + 1/2} = \frac{2}{3}g\sin\theta \approx 0.667g\sin\theta$

The solid sphere has greater acceleration because more of its total kinetic energy goes into translational motion rather than rotational motion.

## Related Concepts
- [[Rotational Kinetic Energy]]
- [[Rotational Form of Newton's Second Law]]
- [[Conservation of Rotational Energy]]
