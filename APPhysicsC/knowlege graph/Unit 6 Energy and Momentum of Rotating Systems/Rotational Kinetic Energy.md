# Rotational Kinetic Energy

**Rotational kinetic energy** is the kinetic energy possessed by a rigid body rotating about a fixed axis. In AP Physics C, you need to master calculations combining both translational and rotational motion.

## Formula

$$K_{\text{rot}} = \frac{1}{2}I\omega^2$$

Where:
- $I$ = **moment of inertia** about the axis of rotation
- $\omega$ = **angular velocity**

## Pure Rolling Motion

When a rigid body rolls without slipping, the **total kinetic energy** is the sum of translational kinetic energy of the center of mass and rotational kinetic energy about the center of mass:

$$K = \frac{1}{2}mv_{\text{CM}}^2 + \frac{1}{2}I_{\text{CM}}\omega^2$$

With the **pure rolling condition**: $v_{\text{CM}} = R\omega$

## Example

**Example:** A solid sphere with mass $m = 1$ kg and radius $R = 0.2$ m rolls without slipping from rest down an incline of height $h = 1$ m. Find its speed at the bottom. Given $I_{\text{CM}} = \frac{2}{5}mR^2$.

**Solution:**
Conservation of mechanical energy: $mgh = \frac{1}{2}mv^2 + \frac{1}{2}I\omega^2$

Substitute $I = \frac{2}{5}mR^2$ and $\omega = v/R$:
$$mgh = \frac{1}{2}mv^2 + \frac{1}{2}\left(\frac{2}{5}mR^2\right)\left(\frac{v}{R}\right)^2$$
$$gh = \frac{1}{2}v^2 + \frac{1}{5}v^2 = \frac{7}{10}v^2$$
$$v = \sqrt{\frac{10gh}{7}} = \sqrt{\frac{10 \times 9.8 \times 1}{7}} \approx 3.74 \text{ m/s}$$

## Related Concepts
- [[Moment of Inertia]]
- [[Rolling Motion]]
- [[Conservation of Rotational Energy]]
