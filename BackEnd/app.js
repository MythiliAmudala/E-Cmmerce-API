const express = require('express')
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const path = require('path')

const app = express()
const port = process.env.PORT || 3000
const secretKey = 'your_secret_key'

// Sample data (replace with DB in real apps)
let products = [
  {id: 1, name: 'Product A', category: 'Category X', price: 10.99},
  {id: 2, name: 'Product B', category: 'Category Y', price: 19.99},
]

let carts = {}
let orders = []

let users = {
  customer1: {password: 'password1', role: 'customer'},
  admin1: {password: 'adminpass', role: 'admin'},
}

// Middleware
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname))) // Serve static files

// Serve HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

// Auth middleware
function authenticateToken(req, res, next) {
  const token = req.headers['authorization']
  if (!token) return res.sendStatus(401)

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

function authorizeRoles(roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.sendStatus(403)
    next()
  }
}

// User Authentication
app.post('/login', (req, res) => {
  const {username, password} = req.body
  const user = users[username]

  if (!user || user.password !== password) {
    return res.status(401).send('Invalid credentials')
  }

  const accessToken = jwt.sign({username, role: user.role}, secretKey)
  res.json({accessToken})
})

// Product Listings
app.get('/products', (req, res) => {
  const {category, name, page = 1, limit = 10} = req.query
  let filteredProducts = products

  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category === category)
  }

  if (name) {
    filteredProducts = filteredProducts.filter(p => p.name.includes(name))
  }

  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

  res.json({
    products: paginatedProducts,
    total: filteredProducts.length,
    page: parseInt(page),
    limit: parseInt(limit),
  })
})

// Cart Management
app.post(
  '/cart/add',
  authenticateToken,
  authorizeRoles(['customer']),
  (req, res) => {
    const {productId, quantity} = req.body
    const product = products.find(p => p.id === productId)
    if (!product) return res.status(404).send('Product not found')

    if (!carts[req.user.username]) carts[req.user.username] = []

    const cartItem = carts[req.user.username].find(
      item => item.productId === productId,
    )

    if (cartItem) {
      cartItem.quantity += quantity
    } else {
      carts[req.user.username].push({productId, quantity})
    }

    res.json(carts[req.user.username])
  },
)

app.put(
  '/cart/update',
  authenticateToken,
  authorizeRoles(['customer']),
  (req, res) => {
    const {productId, quantity} = req.body
    const cartItem = carts[req.user.username]?.find(
      item => item.productId === productId,
    )
    if (!cartItem) return res.status(404).send('Item not found in cart')

    cartItem.quantity = quantity
    res.json(carts[req.user.username])
  },
)

app.delete(
  '/cart/remove',
  authenticateToken,
  authorizeRoles(['customer']),
  (req, res) => {
    const {productId} = req.body
    if (!carts[req.user.username]) return res.status(404).send('Cart not found')

    carts[req.user.username] = carts[req.user.username].filter(
      item => item.productId !== productId,
    )
    res.json(carts[req.user.username])
  },
)

// Order Creation
app.post(
  '/order',
  authenticateToken,
  authorizeRoles(['customer']),
  (req, res) => {
    const userCart = carts[req.user.username]
    if (!userCart || userCart.length === 0)
      return res.status(400).send('Cart is empty')

    const order = {
      orderId: orders.length + 1,
      customer: req.user.username,
      items: userCart,
      orderDate: new Date(),
    }

    orders.push(order)
    delete carts[req.user.username]

    res.status(201).json(order)
  },
)

// Admin Product Management
app.post(
  '/admin/products',
  authenticateToken,
  authorizeRoles(['admin']),
  (req, res) => {
    const {name, category, price} = req.body
    const newProduct = {id: products.length + 1, name, category, price}

    products.push(newProduct)
    res.status(201).json(newProduct)
  },
)

app.put(
  '/admin/products/:id',
  authenticateToken,
  authorizeRoles(['admin']),
  (req, res) => {
    const productId = parseInt(req.params.id)
    const {name, category, price} = req.body
    const productIndex = products.findIndex(p => p.id === productId)

    if (productIndex === -1) return res.status(404).send('Product not found')

    products[productIndex] = {...products[productIndex], name, category, price}
    res.json(products[productIndex])
  },
)

app.delete(
  '/admin/products/:id',
  authenticateToken,
  authorizeRoles(['admin']),
  (req, res) => {
    const productId = parseInt(req.params.id)
    const productIndex = products.findIndex(p => p.id === productId)

    if (productIndex === -1) return res.status(404).send('Product not found')

    products = products.filter(p => p.id !== productId)
    res.sendStatus(204)
  },
)

// Start Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
module.exports = app