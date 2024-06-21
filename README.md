![chatbot site](/screenshot/Screenshot%202024-06-21%20103505.png)

<https://restaurant-chatbot.netlify.app/>

# Restaurant Chatbot

This is a restaurant chatbot application that allows users to view menu, place orders, check order history, and cancel orders through a chat interface. The backend is built with Node.js, Express, and Socket.IO, while the frontend is designed to interact with the chatbot through WebSockets. Dialogflow is used for natural language understanding.

### Features

* View Menu: Users can view the restaurant's menu.

* Place Orders: Users can select items from the menu and place orders.

* Order History: Users can view their past orders.

* Current Order: Users can view their current order before checkout.

* Cancel Order: Users can cancel their current order.

## Technologies Used

* React.js
* Node.js
* Express
* Socket.IO
* Dialogflow
* UUID
* CORS
* Body-Parser

## Setup and Installation
### Prerequisites

* Node.js (v14 or higher)
* npm (v6 or higher)
* A Google Cloud project with Dialogflow API enabled
* .env file with the following variables:

 * `PORT`: The port number to run the server on
 * `GOOGLE_PROJECT_ID`: Your Google Cloud project ID for Dialogflow

 ## Installation
 1. clone the repository: 

 `git clone https://github.com/yourusername/restaurant-chatbot.git
cd restaurant-chatbot`

2. Install dependencies:

`npm install`

3. create a `.env` file in the root directory and add your enivornment variables:

`PORT=8000`

`GOOGLE_PROJECT_ID=your-dialogflow-project-id`

4. Start the server:

`npm start`

## Contributing
1. Fork the repository.

2. Create a new branch (git checkout -b feature-branch).

3. Commit your changes (git commit -m 'Add some feature').

4. Push to the branch (git push origin feature-branch).

5. Open a Pull Request.

