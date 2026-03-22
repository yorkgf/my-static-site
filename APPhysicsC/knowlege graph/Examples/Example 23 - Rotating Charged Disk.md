# Example 23: Rotating Charged Disk

## Problem Statement

A nonconducting circular disk, of radius $R$, carries a uniformly distributed electric charge $Q$. The plate is set spinning with angular velocity $\omega$ about an axis perpendicular to the plate through its center. Determine:
- (a) Its magnetic dipole moment
- (b) The magnetic field at points on its axis a distance $x$ from its center
- (c) Does the far-field dipole approximation apply for $x \gg R$?

<img src="../Assets/Figure23.png" width="100%" alt="Figure 23" />
*Figure 23: Charged disk of radius R rotating with angular velocity ω about the x-axis through its center.*

---

## Solution

### Setup: Ring Element

Divide the disk into thin rings of radius $r$ and width $dr$. Each ring has:
- Charge: $dq = \dfrac{Q}{\pi R^2} \cdot 2\pi r\, dr = \dfrac{2Q r\, dr}{R^2}$
- The ring makes $f = \omega/(2\pi)$ revolutions per second, so it acts as a current loop:
$$dI = dq \cdot f = \frac{2Qr\,dr}{R^2} \cdot \frac{\omega}{2\pi} = \frac{Q\omega r\,dr}{\pi R^2}$$

### Part (a): Magnetic Dipole Moment

The magnetic moment of a current loop: $d\mu = dI \cdot \pi r^2$

$$d\mu = \frac{Q\omega r\,dr}{\pi R^2} \cdot \pi r^2 = \frac{Q\omega r^3\,dr}{R^2}$$

Integrating over the full disk:
$$\mu = \int_0^R \frac{Q\omega r^3}{R^2}\,dr = \frac{Q\omega}{R^2} \cdot \frac{r^4}{4}\Bigg|_0^R$$

$$\boxed{\mu = \frac{1}{4}Q\omega R^2}$$

The magnetic dipole moment is directed along the rotation axis.

### Part (b): Axial Magnetic Field

The on-axis field from a circular current loop of radius $r$ at distance $x$ from its center:
$$dB = \frac{\mu_0\,dI\,r^2}{2(r^2 + x^2)^{3/2}}$$

Substituting $dI$:
$$dB = \frac{\mu_0 Q\omega r^3\,dr}{2\pi R^2 (r^2 + x^2)^{3/2}}$$

Integrating using the substitution $u = r^2 + x^2$:

$$\int_0^R \frac{r^3}{(r^2+x^2)^{3/2}}\,dr = \left[\sqrt{r^2+x^2} + \frac{x^2}{\sqrt{r^2+x^2}}\right]_0^R - \frac{2x^3}{\cdots}$$

After careful evaluation (substituting $u = r^2 + x^2$, $r^2 = u - x^2$):

$$\int_0^R \frac{r^3\,dr}{(r^2+x^2)^{3/2}} = \frac{R^2 + 2x^2}{\sqrt{R^2+x^2}} - 2x$$

Therefore:

$$\boxed{B(x) = \frac{\mu_0 Q\omega}{2\pi R^2}\left[\frac{R^2 + 2x^2}{\sqrt{R^2+x^2}} - 2x\right]}$$

**Check at $x = 0$** (center of disk):
$$B(0) = \frac{\mu_0 Q\omega}{2\pi R^2}[R - 0] = \frac{\mu_0 Q\omega}{2\pi R}$$

This matches the result from integrating ring fields at the center of the disk ✓

### Part (c): Dipole Approximation for $x \gg R$

Expanding for $x \gg R$:
$$\frac{R^2+2x^2}{\sqrt{R^2+x^2}} = \frac{2x^2+R^2}{x\sqrt{1+R^2/x^2}} \approx \frac{2x^2+R^2}{x}\left(1 - \frac{R^2}{2x^2}\right)$$
$$\approx 2x + \frac{R^2}{x} - R^2/x = 2x + \frac{R^4}{4x^3} + \cdots$$

Wait — to second order:
$$\frac{R^2+2x^2}{\sqrt{R^2+x^2}} - 2x \approx \frac{R^4}{4x^3} + O(x^{-5})$$

So for $x \gg R$:
$$B(x) \approx \frac{\mu_0 Q\omega}{2\pi R^2} \cdot \frac{R^4}{4x^3} = \frac{\mu_0 Q\omega R^2}{8\pi x^3}$$

Comparing with the dipole formula $B_{dipole} = \dfrac{\mu_0 \mu}{2\pi x^3}$:

$$B_{dipole} = \frac{\mu_0}{2\pi x^3} \cdot \frac{Q\omega R^2}{4} = \frac{\mu_0 Q\omega R^2}{8\pi x^3}$$

**Yes**, the dipole approximation applies for $x \gg R$:

$$\boxed{B(x) \xrightarrow{x \gg R} \frac{\mu_0 \mu}{2\pi x^3} = \frac{\mu_0 Q\omega R^2}{8\pi x^3}}$$

The disk behaves as a magnetic dipole in the far field.

---

## Key Concepts

1. **Rotating charge = current**: each ring element acts as a loop current $dI = dq \cdot \omega/(2\pi)$
2. **Magnetic dipole moment**: $\mu = \frac{1}{4}Q\omega R^2$ — depends on $R^2$ and $\omega$
3. **On-axis field**: integrate contributions from all rings
4. **Far-field dipole behavior**: $B \propto 1/x^3$, identical to a pure magnetic dipole

---

## Related Concepts
- [[Magnetic-Fields-and-Forces/Magnetic-Field|Magnetic Field]]
- [[Magnetic-Fields-and-Forces/Magnetic-Moments|Magnetic Moments]]
- [[Magnetic-Fields-and-Forces/Ampère's-Law|Ampère's Law]]

## Related Units
- [[Magnetic-Fields-and-Forces/index|Magnetic Fields and Forces]]

## Source
Giancoli, Physics for Scientists and Engineers, Chapter 28, Problem 50
