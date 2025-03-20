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









serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
