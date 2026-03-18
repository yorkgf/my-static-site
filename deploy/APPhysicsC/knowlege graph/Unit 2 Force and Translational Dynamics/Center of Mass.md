# Center of Mass

The **center of mass (CM)** is the average position of mass in a system of objects. In AP Physics C, you need to be able to calculate the center of mass for continuous objects using integration.

## Discrete System of Particles

$$\vec{r}_{\text{CM}} = \frac{\sum m_i \vec{r}_i}{\sum m_i}$$

## Continuous Object

$$\vec{r}_{\text{CM}} = \frac{\int \vec{r} \, dm}{\int dm}$$

## Mass Density

- **Linear density**: $\lambda = \frac{dm}{dl}$, $M = \int \lambda \, dl$
- **Area density**: $\sigma = \frac{dm}{dA}$, $M = \int \sigma \, dA$
- **Volume density**: $\rho = \frac{dm}{dV}$, $M = \int \rho \, dV$

## Center of Mass Theorem

The **net external force** on a system equals the total mass times the acceleration of the center of mass:

$$\vec{F}_{\text{net, external}} = M_{\text{total}} \vec{a}_{\text{CM}}$$

## Example Problem

**Example:** A uniform rod has length $L$ and constant linear density $\lambda$. Find the center of mass position.

**Solution:** Take the left end as origin:
$$x_{\text{CM}} = \frac{\int_0^L x \lambda \, dx}{\int_0^L \lambda \, dx} = \frac{\lambda \cdot \frac{L^2}{2}}{\lambda L} = \frac{L}{2}$$

The center of mass is at the midpoint of the rod, as expected for a uniform rod.

## Related Concepts
- [[Universal Gravitation]]
