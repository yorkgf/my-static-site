# Example 26: Force on Triangular Loop Near a Straight Wire

## Problem Statement

A triangular loop of side length $a$ carries a current $I$. If this loop is placed a distance $d$ away from a very long straight wire carrying a current $I'$, determine the force on the loop due to $I'$.

<img src="../Assets/Figure26.png" width="100%" alt="Figure 26" />
*Figure 26: Equilateral triangular loop (side a, current I) above a long straight wire (current I'). The bottom vertex of the triangle is at distance d from the wire. The base of the triangle (side a) is at distance d + (√3/2)a from the wire.*

---

## Solution

### Geometry

From Figure 26, the equilateral triangle is oriented with one **vertex pointing down**, closest to the wire. So:
- The **bottom vertex** (tip) is at distance $d$ from the wire
- The **base** (top side) is at distance $d + h = d + \frac{\sqrt{3}}{2}a$ from the wire
- The two **slanted sides** run from the bottom vertex to the two base vertices

The wire carries current $I'$ to the right. The triangle has current $I$ flowing counterclockwise (viewed from the front): right slanted side goes up-right, base goes left, left slanted side goes down-left.

### Strategy: Integrate Force on Each Segment

**Force per unit length** between a current element and the long wire at distance $y$:
$$\frac{dF}{dl} = \frac{\mu_0 I I'}{2\pi y}$$

#### Force on the Base

The base (horizontal, at $y = d + \frac{\sqrt{3}}{2}a$, current flowing to the left — **opposite** to $I'$):
$$F_{base} = \frac{\mu_0 I I'}{2\pi\left(d + \frac{\sqrt{3}}{2}a\right)} \cdot a \quad \text{(repulsive, away from wire)}$$

#### Force on the Two Slanted Sides

For a slanted side, consider the **left side** (going from bottom vertex to upper-left):
- Parametrize with height $y$ ranging from $d$ to $d + \frac{\sqrt{3}}{2}a$
- Each length element: $dl = \frac{dy}{\sin 60°} = \frac{2\,dy}{\sqrt{3}}$
- Only the **vertical component** ($\hat{y}$) of force survives (horizontal components cancel by symmetry between left and right sides)

Vertical force on left slanted side ($dl_y = dy$, carrying current with $+\hat{y}$ component, so the $y$-component of the force per element is the perpendicular repulsion away from wire):

$$dF_{y, left} = \frac{\mu_0 I I'}{2\pi y} \cdot \left(\frac{1}{\sqrt{3}}\right) \cdot \frac{dy}{\sqrt{3}/\sqrt{3}} \cdot \left(\frac{1}{\sqrt{3}}\right)$$

More carefully: the current direction in the left slanted side has a component to the **right** (in $+x$) and a component **upward** (in $+y$). The $x$-component is parallel to the wire (force in $\pm z$, but we need $y$-component of force):

For current element $Id\vec{l}$ in field $B\hat{z}$ from the straight wire:
$$d\vec{F} = I\,d\vec{l} \times (B\hat{z})$$

If $d\vec{l} = dl_x\hat{x} + dl_y\hat{y}$, then:
$$d\vec{F} = I B\,(dl_x(\hat{x}\times\hat{z}) + dl_y(\hat{y}\times\hat{z}))$$
$$= IB(-dl_x\hat{y} + dl_y\hat{x})$$

Wait — I need to be careful about B direction. The wire carries $I'$ to the right (+x). Above it, $\vec{B}$ points out of the page (+z). Then $\hat{x}\times\hat{z} = -\hat{y}$ and $\hat{y}\times\hat{z} = -\hat{x}$.

Actually, let me redo: $B$ at height $y$ points in $+\hat{z}$ direction (out of page, since $I'$ is to the right and we're above the wire).

$$d\vec{F} = I(dl_x\hat{x} + dl_y\hat{y}) \times B\hat{z} = IB(dl_x(\hat{x}\times\hat{z}) + dl_y(\hat{y}\times\hat{z}))$$
$$= IB(-dl_x\hat{y} - dl_y\hat{x})$$

Hmm: $\hat{x}\times\hat{z} = -\hat{y}$, $\hat{y}\times\hat{z} = -\hat{x}$.

So:
- $x$-component of force: $dF_x = -IBdl_y$
- $y$-component of force: $dF_y = -IBdl_x$

For the **right slanted side** (from $(a/2, d)$ to $(0, d+\frac{\sqrt{3}}{2}a)$):
$dl_x = -\frac{a/2}{a}dl = -\frac{1}{2}dl$, $dl_y = \frac{\sqrt{3}/2}{1}dl = \frac{\sqrt{3}}{2}dl$

Repulsive $y$-force (away from wire) on right side:
$$F_{y,right} = -\int IB(-\tfrac{1}{2}dl) = \frac{I}{2}\int_0^a \frac{\mu_0 I'}{2\pi y} dl$$

Changing variable to $y$: $dy = \frac{\sqrt{3}}{2}dl$, so $dl = \frac{2}{\sqrt{3}}dy$:
$$F_{y,right} = \frac{I}{2} \cdot \frac{2}{\sqrt{3}} \cdot \frac{\mu_0 I'}{2\pi} \int_d^{d+\frac{\sqrt{3}}{2}a} \frac{dy}{y} = \frac{\mu_0 I I'}{2\pi\sqrt{3}} \ln\!\left(\frac{d + \frac{\sqrt{3}}{2}a}{d}\right)$$

By symmetry, $F_{y,left} = F_{y,right}$. Total $y$-force on both slanted sides:
$$F_{slant} = 2F_{y,right} = \frac{\mu_0 I I'}{\pi\sqrt{3}} \ln\!\left(1 + \frac{\sqrt{3}\,a}{2d}\right)$$

Direction: The $y$-component of force on the slanted sides is **away from** the wire (repulsive net effect of the vertical current components).

#### Net Force

Taking toward the wire as positive:

$$\boxed{F_{net} = \frac{\mu_0 I I'}{2\pi}\left[\frac{a}{d + \frac{\sqrt{3}}{2}a} - \frac{2}{\sqrt{3}} \ln\!\left(1 + \frac{\sqrt{3}\,a}{2d}\right)\right]}$$

The sign determines direction: for typical values the slanted-side repulsion exceeds the base repulsion (or vice versa, depending on parameters), giving a net force toward or away from the wire.

**Note**: If the orientation were reversed (base facing the wire), the base would be closer and attract strongly, giving a net attractive force.

---

## Key Concepts

1. **Force between parallel currents**: $F/L = \mu_0 I_1 I_2/(2\pi d)$
2. **Integration** needed for non-parallel current segments
3. **Symmetry**: horizontal force components on symmetric slanted sides cancel
4. The net force depends on the geometric factor $\ln(1 + \sqrt{3}a/2d)$

---

## Related Concepts
- [[Magnetic-Fields-and-Forces/Magnetic-Force-on-Current-Carrying-Wires|Magnetic Force on Current-Carrying Wires]]
- [[Magnetic-Fields-and-Forces/Magnetic-Field|Magnetic Field]]

## Related Units
- [[Magnetic-Fields-and-Forces/index|Magnetic Fields and Forces]]

## Source
Giancoli, Physics for Scientists and Engineers, Chapter 28, Problem 44
