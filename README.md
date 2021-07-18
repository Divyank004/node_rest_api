# How to run the API

- Set the environment variables NODE_ENV (to determine the server environment), PORT, corresponding password in custom-environment-variable config file.
- Run the server by using the command "DEBUG=app:\* nodemon index.js"

# Coding Challenge

Coding Challenge for new backend candidates at P.S. Cooperation GmbH

## What's the task?

Create a REST-API with the given data for the following endpoints.

All endpoints should be used from the customer perspective (organization.id = 1).

- [x] Get open positions for a specified organization
- [x] Get revenue per month for a specified organization
- [x] Get article list for a specified organization
- [x] Post a new order based on a provided JSON-body.

## Further information to the data

- The baseprice will always be the price per 100 quantity
- The articleId should be the Id of the article-table of the articlecustomer
- The SupplierId is the Id of the organization for the articlesupplier in the articlecontract-table
- The SupplierName is the name of the organization for the articlesupplier in the articlecontract-table
- PositionInOrder is a serial per ordering starting each time with one
- ArticleLable and ArticleName should always be the attributes of the articlecustomer
- Open Positions are positions without delivery.
- Delivered goods have a value in the delivery field of positions.

The endpoints are referenced in the swagger.json. You can read it using https://editor.swagger.io or set up your own instance locally.

## Technology

You are free to choose your favorite backend library in Javascript.

Please be prepared to show your solution live in the second meeting with your API Testing Tool of choice.

## Setup

- Create a new database in your SQL-Instance of choice.
  - If you use MYSQL change numeric to numeric(5,2).
- Run the commands from db-init.sql to populate the database.

Now you are ready to go to start implementing the webserver.

If any problems arise, you can send me a message at any time under mh@ps-cooperation.com
