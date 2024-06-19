const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const { SessionsClient } = require('@google-cloud/dialogflow');
const cors = require('cors');
const uuid = require('uuid');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8000;
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
  }
});

// CORS setup
var whitelist = ['http://localhost:5173', 'https://restaurant-chatbot.netlify.app/'];
var corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Allow non-browser requests
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,// Allow credentials
};

app.use(cors(corsOptions)); 


app.use(bodyParser.json());
app.use(express.json());

const projectId = process.env.GOOGLE_PROJECT_ID;
const sessionClient = new SessionsClient();
const sessionPath = sessionClient.projectAgentSessionPath(projectId, uuid.v4());

let orders = {};
let orderHistory = {};

// Restaurant menu items with options
const restaurantMenu = [
  {
    name: "Pizza Margherita",
  },
  {
    name: "Pizza Pepperoni",
  },
  {
    name: "Pizza Vegetarian",
  },
  {
    name: "Cheeseburger",
  },
  {
    name: "Veggie Burger",
  },
  {
    name: "BBQ Burger",
  }
 
];

// Function to list restaurant menu
function listRestaurantMenu() {
  let menuList = "Select an item to order:\n";
  restaurantMenu.forEach((item, index) => {
    menuList += `${index + 1}. ${item.name}\n`;
  });
  return menuList;
}

// Function to handle number selection for ordering
function handleNumberSelection(selection, sessionId) {
  const menuItemIndex = parseInt(selection) - 1;
  if (menuItemIndex >= 0 && menuItemIndex < restaurantMenu.length) {
    const selectedMenuItem = restaurantMenu[menuItemIndex];
    orders[sessionId] = orders[sessionId] || [];
    orders[sessionId].push(selectedMenuItem);
    return `You have selected: ${selectedMenuItem.name}. Anything else you would like to order? (Type '1' to see menu again or '99' to checkout your order.)`;
  } else {
    return 'Invalid selection. Please select a valid item number from the menu.';
  }
}

// Function to get all placed orders
function getAllPlacedOrders(sessionId) {
  if (orderHistory[sessionId]) {
    return orderHistory[sessionId].map(order => order.name).join(', ');
  }
  return 'No order history.';
}

// Function to return current order
function getCurrentOrder(sessionId) {
  if (orders[sessionId]) {
    return orders[sessionId].map(order => order.name).join(', ');
  }
  return 'No current order.';
}

// Function to cancel current order
function cancelCurrentOrder(sessionId) {
  if (orders[sessionId]) {
    orders[sessionId] = [];
    return 'Current order canceled.';
  }
  return 'No current order to cancel.';
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);

  // Send initial message
  socket.emit('message', 'Welcome! Please select an option:\n View Menu (1)\n Checkout Order (99)\n Order History (98)\n Current Order (97)\n Cancel Order (0)');

  socket.on('message', async (message) => {
    console.log(`Message from client ${socket.id}: ${message}`);
    let response;

    switch (message) {
      case '1':
        response = listRestaurantMenu();
        break;
      case '99':
        if (orders[socket.id] && orders[socket.id].length > 0) {
          orderHistory[socket.id] = orderHistory[socket.id] || [];
          orderHistory[socket.id].push(...orders[socket.id]);
          orders[socket.id] = [];
          response = 'Order placed. Would you like to place a new order? (Type 1 to view menu)';
        } else {
          response = 'No order to place. Would you like to place a new order? (Type 1 to view menu)';
        }
        break;
      case '98':
        response = `Order History:\n${getAllPlacedOrders(socket.id)}`;
        break;
      case '97':
        response = `Current Order:\n${getCurrentOrder(socket.id)}`;
        break;
      case '0':
        response = cancelCurrentOrder(socket.id);
        break;
      default:
        if (/^\d+$/.test(message)) { // If the message is a number
            response = handleNumberSelection(message, socket.id);
          } else {
            response = await detectIntent(message, socket.id);
          }
    }

    console.log(`Response to client ${socket.id}: ${response}`);
    socket.emit('message', response);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Dialogflow integration
async function detectIntent(message, sessionId) {
  console.log('detectIntent called with message:', message);

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode: 'en-US'
      }
    }
  };

  try {
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;

    if (result.intent.displayName === '1') {
      // Handle placing orders based on Dialogflow intent
      orders[sessionId] = orders[sessionId] || [];
      const fulfillmentText = result.fulfillmentText || 'No items found in order.';
      orders[sessionId].push({ name: fulfillmentText }); // Assuming fulfillmentText represents the ordered item
      return `You have ordered: ${fulfillmentText}. Anything else you would like to order? (Type '1' to see menu again or 'Checkout Order' to place your order.)`;
    } else if (result.intent.displayName === '0') {
      // Handle canceling current orders
      orders[sessionId] = [];
      return 'Current order canceled.';
    }

    return result.fulfillmentText || 'No response from Dialogflow.';
  } catch (error) {
    console.error('Dialogflow API error:', error);
    return 'Error processing request';
  }
}


//server connection
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});



