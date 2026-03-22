# Example 34: Force on a Current Loop in a Diverging Magnetic Field

## Problem Statement

A circular loop of wire, of radius $r$, carries current $I$. It is placed in a magnetic field whose straight lines seem to diverge from a point a distance $d$ below the loop on its axis. (That is, the field makes an angle $\theta$ with the loop at all points, where $\tan\theta = r/d$.) Determine the force on the loop.

<img src="../Assets/Figure34.png" width="100%" alt="Figure 34" />
*Figure 34: Circular current loop (radius r, current I) in a diverging magnetic field. At the rim, B makes angle θ with the plane of the loop, where tan θ = r/d.*

---

## Solution

### Setup: Field Decomposition at the Loop Rim

The magnetic field $\vec{B}$ at the rim of the loop has magnitude $B$ and makes angle $\theta$ with the **plane** of the loop (horizontal). Decomposing:

- **Radial component** (in the plane, pointing outward): $B_r = B\cos\theta$
- **Axial component** (perpendicular to plane, pointing upward): $B_z = B\sin\theta$

where $\tan\theta = r/d$, so:
$$\sin\theta = \frac{r}{\sqrt{r^2+d^2}}, \quad \cos\theta = \frac{d}{\sqrt{r^2+d^2}}$$

### Force on a Current Element

Consider a current element $Id\vec{\ell}$ at the rim. The element is tangential: $d\vec{\ell} = r\,d\varphi\,\hat{\varphi}$ (in cylindrical coordinates, with $\hat{\varphi}$ tangent to the circle).

$$d\vec{F} = I\,d\vec{\ell} \times \vec{B} = Ir\,d\varphi\,\hat{\varphi} \times (B_r\hat{r} + B_z\hat{z})$$

Using $\hat{\varphi}\times\hat{r} = -\hat{z}$ and $\hat{\varphi}\times\hat{z} = \hat{r}$:

$$d\vec{F} = Ir\,d\varphi\,\left[B_r(-\hat{z}) + B_z\hat{r}\right]$$

### Integration Over Full Loop

**Axial (z) component:**
$$F_z = -\oint Ir B_r\,d\varphi = -Ir B_r \cdot 2\pi = -2\pi I r B\cos\theta$$

The minus sign means the force is directed **downward** if current is clockwise (by right-hand rule), or **upward** if counterclockwise. We take the magnitude:

$$|F_z| = 2\pi I r B\cos\theta$$

**Radial component:**
$$F_r = \oint Ir B_z \cos(\text{angle from x-axis})\,d\varphi = 0$$

The radial forces cancel when integrated around the full circle (by symmetry, each direction is equally represented).

### Net Force

The net force is purely **axial** (along the axis of the loop):

$$\boxed{F = 2\pi I r B\cos\theta}$$

where $\cos\theta = d/\sqrt{r^2+d^2}$, giving:

$$F = 2\pi I r B \cdot \frac{d}{\sqrt{r^2 + d^2}} = \frac{2\pi I r B d}{\sqrt{r^2 + d^2}}$$

**Direction**: By Lenz's law / right-hand rule, the force is directed **toward** the divergence point (downward, toward the source of the diverging field) if the current circulates such that the dipole moment points toward the source.

### Special Cases

**Small loop** ($r \ll d$): $\theta \to 0$, $\cos\theta \to 1$:
$$F \approx 2\pi I r B$$

This represents a very uniform (radial) field with the loop pulled toward the source.

**Connection to Magnetic Dipole Force**:

A magnetic dipole $\vec{m} = I\pi r^2\,\hat{z}$ in a non-uniform field experiences:
$$F = m\frac{dB_z}{dz}$$

For the diverging field geometry, $dB_z/dz \approx -B\sin\theta/d$ (field weakens as we move away from the source). Then:
$$F \approx I\pi r^2 \cdot \frac{B\sin\theta}{r} \cdot r/d = \frac{I\pi r^2 B\sin\theta}{d}... $$

The two approaches agree in the limit $r \ll d$.

---

## Key Concepts

1. **Force on current loop in non-uniform field**: $F = 2\pi IrB\cos\theta$ (purely axial)
2. **Field decomposition**: radial and axial components have different effects
3. **Symmetry**: radial force components integrate to zero around a full loop
4. **Magnetic dipole force**: $F = \nabla(m\cdot B)$ — loops experience net force in non-uniform fields

---

## Related Concepts
- [[Magnetic-Fields-and-Forces/Magnetic-Moments|Magnetic Moments]]
- [[Magnetic-Fields-and-Forces/Magnetic-Force-on-Current-Carrying-Wires|Magnetic Force on Current-Carrying Wires]]
- [[Magnetic-Fields-and-Forces/Magnetic-Field|Magnetic Field]]

## Related Units
- [[Magnetic-Fields-and-Forces/index|Magnetic Fields and Forces]]

## Source
Giancoli, Physics for Scientists and Engineers, Chapter 27, Problem 45
