import { PrismaClient } from '@prisma/client'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono()
const prisma = new PrismaClient()

//post customer data
app.post('/customer', async (c) => {
  const {name, email, phoneNumber, address} = await c.req.json()
  try{
    const customer = await prisma.customers.create({
      data: {
        name: name,
        email: email,
        phoneNumber: phoneNumber,
        address: address,
      }
    })
    return c.json(customer)
  }catch{
    return c.json({error: "Error creating customer"})
  }
});

//get all customers
app.get('/customer', async (c) => {
  try{
    const customers = await prisma.customers.findMany()
    return c.json(customers)
  }catch{
    return c.json({error: "Error getting customers"})
  }
});

//post resturant data
app.post('/resturant', async (c) => {
  const {name, location} = await c.req.json();
  try{
    const resturant = await prisma.resturants.create({
      data: {
        name: name,
        location: location,
      }
    })
    return c.json(resturant);
  }catch{
    return c.json({error: "Error creating resturant"});
  }
});

//get resturant data
app.get('/resturants/:id/menu', async (c) => {
  try{
    const menuItems = await prisma.menuItems.findMany({
      where: {
        resturentId: c.req.param('id')
      }
    })
    return c.json(menuItems);
  }catch{
    return c.json({error: "Error getting menu items"});
  }
});

//post menuitems
app.post('/resturant/:id/menu', async (c) => {
  const { id } = c.req.param();
  const {name, price , resturantId} = await c.req.json();
  try{
    const menuItem = await prisma.menuItems.create({
      data: {
        name: name,
        price: price,
        resturentId: id,
      }
    })
    return c.json(menuItem);
  }catch{
    return c.json({error: "Error creating menu item"});
  }
});

//patch menuitems
app.patch("/menu/:id", async (context) => {
  const { id } = context.req.param();
  const { price, isAvailable } = await context.req.json();
  try {
    const menuItem = await prisma.menuItems.findUnique({ where: { id } });
    if (!menuItem) {
      return context.json({ message: "Menu item not found" }, 404);
    }

    const updateMenuItem = await prisma.menuItems.update({
      where: {
        id,
      },
      data: {
        price: price,
        isAvailable: isAvailable,
      },
    });
    return context.json({ message: "Menu item updated", updateMenuItem }, 200);
  } catch (error) {
    console.error("Unable to update menu item", error);
    return context.json({ message: "Unable to update menu item" }, 500);
  }
});

//post orders
app.post("/orders", async (c) => {
  try {
    const { customerId, restaurantId, items } = await c.req.json();

    // Validate customer and restaurant
    const customer = await prisma.customers.findUnique({
      where: { id: customerId },
    });
    const restaurant = await prisma.resturants.findUnique({
      where: { id: String(restaurantId) },
    });

    if (!customer) return c.json({ message: "Customer does not exist" }, 400);
    if (!restaurant)
      return c.json({ message: "Restaurant does not exist" }, 400);

    //  Create an Order
    const order = await prisma.orders.create({
      data: {
        customerId: String(customerId),
        resturentId: String(restaurantId),
        status: "PLACED",
        totalPrice: 0,
      },
    });

    let totalPrice = 0;

    for (const item of items) {
      const menuItem = await prisma.menuItems.findUnique({
        where: { id: String(item.menuItemId) },
      });

      if (!menuItem || !menuItem.isAvailable) {
        return c.json(
          {
            message: `Menu item ID ${item.menuItemId} not found or unavailable`,
          },
          400
        );
      }

      const itemTotal = Number(menuItem.price) * item.quantity;
      totalPrice += itemTotal;

      // Create OrderItem table
      await prisma.orderItems.create({
        data: {
          id: crypto.randomUUID(), // Generate a unique ID
          orderId: order.id,
          menuItemId: menuItem.id,
          quantity: item.quantity,
        },
      });
    }

    // Step 3: Update  totalPrice
    const updatedOrder = await prisma.orders.update({
      where: { id: order.id },
      data: {
        totalPrice: totalPrice,
        status: "PLACED",
      },
    });

    return c.json({ message: updatedOrder }, 201);
  } catch (error) {
    console.error(error);
    return c.json({ message: "Failed to place order" }, 500);
  }
});


app.get("/orders/:id", async (context) => {
  const { id } = context.req.param();
  try {
    const order = await prisma.orders.findUnique({
      where: { id },
      include: {
        customers: true,
        resturants: true,
        orderitems: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    if (!order) {
      return context.json({ message: "Order not found" }, 404);
    }

    return context.json(order, 200);
  } catch (error) {
    console.error("Error retrieving order", error);
    return context.json({ message: "Error retrieving order" }, 500);
  }
});

app.patch("/orders/:id/status", async (context) => {
  const { id } = context.req.param();
  const { status } = await context.req.json();
  try {
    const order = await prisma.orders.findUnique({ where: { id } });

    if (!order) {
      return context.json({ message: "Order not found" }, 404);
    }

    const updatedOrder = await prisma.orders.update({
      where: { id },
      data: { status },
    });

    return context.json({ message: "Order status updated", updatedOrder }, 200);
  } catch (error) {
    console.error("Error updating order status", error);
    return context.json({ message: "Error updating order status" }, 500);
  }
});

app.get("/restaurants/:id/revenue", async (context) => {
  const { id } = context.req.param();
  try {
    // Check if the restaurant exists
    const restaurant = await prisma.resturants.findUnique({
      where: { id },
    });

    if (!restaurant) {
      return context.json({ message: "Restaurant not found" }, 404);
    }

    // Calculate the total revenue generated by the restaurant
    const orders = await prisma.orders.findMany({
      where: { resturentId: id },
    });

    const totalRevenue = orders.reduce(
      (acc, order) => acc + Number(order.totalPrice),
      0
    );

    return context.json({ restaurantName: restaurant.name, totalRevenue }, 200);
  } catch (error) {
    console.error("Error calculating revenue", error);
    return context.json({ message: "Error calculating revenue" }, 500);
  }
});

app.get("/menu/top-items", async (context) => {
  try {
    // Group by menuItemId and count the occurrences
    const topItems = await prisma.orderItems.groupBy({
      by: ["menuItemId"],
      _count: {
        menuItemId: true,
      },
      orderBy: {
        _count: {
          menuItemId: "desc",
        },
      },
      take: 1, // Get the top item
    });

    if (topItems.length === 0) {
      return context.json({ message: "No menu items found" }, 404);
    }

    // Get the details of the top menu item
    const topMenuItem = await prisma.menuItems.findUnique({
      where: { id: topItems[0].menuItemId },
    });

    return context.json(topMenuItem, 200);
  } catch (error) {
    console.error("Error retrieving top menu item", error);
    return context.json({ message: "Error retrieving top menu item" }, 500);
  }
});

app.get("/customers/top", async (context) => {
  try {
    // Group by customerId and count the occurrences
    const topCustomers = await prisma.orders.groupBy({
      by: ["customerId"],
      _count: {
        customerId: true,
      },
      orderBy: {
        _count: {
          customerId: "desc",
        },
      },
      take: 5, // Get the top 5 customers
    });

    if (topCustomers.length === 0) {
      return context.json({ message: "No customers found" }, 404);
    }

    // Get the details of the top customers sequentially
    const customers = [];
    for (const item of topCustomers) {
      const customer = await prisma.customers.findUnique({
        where: { id: item.customerId },
      });
      if (customer) {
        customers.push(customer);
      }
    }

    return context.json(customers, 200);
  } catch (error) {
    console.error("Error retrieving top customers", error);
    return context.json({ message: "Error retrieving top customers" }, 500);
  }
});

app.get("/customers/:id/orders", async (context) => {
  const id = context.req.param("id");
  try {
    // Check if the customer exists
    const customer = await prisma.customers.findUnique({
      where: { id },
    });

    if (!customer) {
      return context.json({ message: "Customer not found" }, 404);
    }

    // Retrieve all orders placed by the customer
    const orders = await prisma.orders.findMany({
      where: { customerId: id },
      include: {
        resturants: true,
        orderitems: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    return context.json(orders, 200);
  } catch (error) {
    console.error("Error retrieving orders", error);
    return context.json({ message: "Error retrieving orders" }, 500);
  }
});
serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
