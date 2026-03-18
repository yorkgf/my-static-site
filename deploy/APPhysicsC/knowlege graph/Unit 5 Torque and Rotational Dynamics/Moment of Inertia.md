# Moment of Inertia

**Moment of Inertia** is a core topic in AP Physics C. You need to master calculation by integration and the parallel axis theorem.

## Definition

$$I = \int r^2 \, dm$$

Where $r$ is the perpendicular distance from the mass element to the axis of rotation.

## Common Moments of Inertia

| Shape | Axis | Moment of Inertia |
|------|------|-------------------|
| Thin rod (length $L$) | Perpendicular through end | $I = \frac{1}{3}mL^2$ |
| Thin rod (length $L$) | Perpendicular through center | $I = \frac{1}{12}mL^2$ |
| Disk/Cylinder (radius $R$) | Symmetry axis | $I = \frac{1}{2}mR^2$ |
| Solid sphere (radius $R$) | Diameter | $I = \frac{2}{5}mR^2$ |
| Spherical shell (radius $R$) | Diameter | $I = \frac{2}{3}mR^2$ |
| Thin-walled cylinder (radius $R$) | Symmetry axis | $I = mR^2$ |

## Parallel Axis Theorem

$$I = I_{\text{cm}} + md^2$$

Where $d$ is the distance from the new axis to the center of mass axis.

## Example Problem

**Example 1:** Find the moment of inertia of a uniform thin rod (length $L$, mass $m$) rotating about a perpendicular axis located $L/3$ from one end.

**Solution:**
Given $I_{\text{cm}} = \frac{1}{12}mL^2$ (about center)
$$I = I_{\text{cm}} + m\left(\frac{L}{3} - \frac{L}{2}\right)^2 = \frac{1}{12}mL^2 + m\left(\frac{L}{6}\right)^2$$
$$= \frac{1}{12}mL^2 + \frac{1}{36}mL^2 = \frac{3}{36}mL^2 + \frac{1}{36}mL^2 = \frac{1}{9}mL^2$$

---

## Worked Examples

- [[Example 12 - Disk Pulled by String]] - Uses $I = \frac{1}{2}MR^2$ for a solid disk
- [[Example 13 - Billiard Ball Sweet Spot]] - Uses $I = \frac{2}{5}MR^2$ for a solid sphere
- [[Example 14 - Block and Cylinder on Incline]] - Uses $I = \frac{1}{2}MR^2$ for a solid cylinder

## Related Concepts
- [[Torque]]
- [[Angular Momentum]]
- [[Rotational Kinetic Energy]]
