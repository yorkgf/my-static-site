# Rotational Form of Newton's Second Law

Newton's second law for translation is $\sum \vec{F} = m\vec{a}_{CM}$. Rotational motion has an analogous form.

## Rotational Equation

For rotation about a fixed axis:

$$\sum \tau = I \alpha$$

Where:
- $\sum \tau$ = **net external torque** about the axis
- $I$ = **moment of inertia** about the same axis
- $\alpha$ = **angular acceleration**

## General Form (Planar Motion of Rigid Bodies)

For general planar motion of a rigid body, use **two independent equations**:

1. **Translation of center of mass**: $\sum \vec{F}_{ext} = m\vec{a}_{CM}$
2. **Rotation about center of mass**: $\sum \tau_{CM} = I_{CM} \alpha$

These two equations together completely describe the motion.

## Sign Convention

- Counterclockwise torques are positive, clockwise torques are negative (or follow right-hand rule for your coordinate system)
- The sign of $\alpha$ matches the sign of the net torque

## Application: Rolling Down an Incline

For pure rolling motion down an incline, we combine translational and rotational equations:

Translational: $mg\sin\theta - f_s = ma$
Rotational: $f_s R = I\alpha = I\frac{a}{R}$ → $f_s = \frac{Ia}{R^2}$

Solving simultaneously:
$$a = \frac{g\sin\theta}{1 + \frac{I}{mR^2}}$$

For a solid cylinder with $I = \frac{1}{2}mR^2$, we get $a = \frac{2}{3}g\sin\theta$, which matches the result from energy conservation.

## Key Points

- All torques must be calculated about **the same axis**
- $I$ must also be the moment of inertia about that same axis
- The relationship between $\alpha$ and linear acceleration is given by the pure rolling condition

## Related Concepts
- [[Torque]] (Unit 5)
- [[Moment of Inertia]] (Unit 5)
- [[Angular Acceleration]]
- [[Rolling Motion]]
- [[Conservation of Rotational Energy]]
