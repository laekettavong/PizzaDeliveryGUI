# PizzaDeliveryAPI

This is a light weight REST API application for a fictious pizza-delivery company. Once the consumer's credenitals are created and authenticated, a "authentication" token is provided where by subsequent RESTful requests can be made with it. Upon authentication, the consumer is presented with a JSON representation of a menu of items available for ordering. The consumer can perform user and shopping cart CRUD operations. Upon filling the shopping cart, the consumer can place an order with a valid Stripe payment token. When an order is placed, the consumer's is charged via Stripe followed by an order notification email powered by Mailgun. Unless extended, the auth token is valid for an hour by defulat. Upon "logout", said token is destroyed.

Apart from leveling Stripe payment and Mailgun messaging services, the app is written purely with raw, out-of-the-box Node.js 8.11.3 LTS release. That is, there is no reliance on any external modules - i.e. express, etc.. The app currently is "wired up" to use file IO for data store, but there are hooks in place for future database integration. Current implemation only supports non-admin operations where an authenticated consumer can only perform requests on itself.

Following are the requirements for the project

Build an API for a pizza-delivery company.

1. New users can be created, their information can be edited, and they can be deleted. The app should store their name, email address (userId), and street address.

2. Users can log in and log out by creating or destroying a token.

3. When a user is logged in, they should be able to GET all the possible menu items.

4. A logged-in user should be able to fill a shopping cart with menu items.

5. A logged-in user should be able to create an order. The app should integrate with the Stripe.com to accept their payment.

6. When an order is placed, a receipt email should be sent out. The app should integrate with the sandbox of Mailgun.com for this.


# USER Services
#### Create user
Endpoint: `<host>`:`<port>`/users  
Method: POST  
Request body: JSON represenatation of user  
Required fields : firstName, lastName, email, password, address, city, state, zip

```
{
	"firstName":"John",
	"lastName":"Doe",
	"email":"johndoe@gmail.com",
	"password":"myPassword123",
	"address":"123 Main Street",
	"city":"Rockville",
	"state":"NY",
	"zip":"12345"
}
```

#### Get user data
Endpoint: `<host>`:`<port>`/users  
Method: GET  
Required request header  
    `token` : authToken  

#### Update user
Endpoint: `<host>`:`<port>`/users  
Method: PUT  
Required request header  
    `token` : authToken  
Request body: JSON representation of user info to update  
Optional user fields to update, must specify at least one field  

```
{
	"address":"567 Main Street",
	"city":"Henrieville",
	"state":"NJ",
	"zip":"56789"
}
```

#### Delete user
Endpoint: `<host>`:`<port>`/users  
Method: DELETE  
Required request header  
    `token` : authToken  


# LOGIN Services
#### Login, get authentication token
Endpoint: `<host>`:`<port>`/login   
Method: POST  
Request body: user credential  
Required fields: email, password  

```
{
    "email":"johndoej@gmail.com",
    "password":"myPassword123"
}
```

#### Get item menu
Endpoint: `<host>`:`<port>`/login  
Method: GET  
Required request header  
    `token` : authToken  

#### Extend auth token expiration date
Endpoint: `<host>`:`<port>`/login  
Method: PUT  
Required request header   
    `token` : authToken  

#### Logout, destroy auth token
Endpoint: `<host>`:`<port>`/login  
Method: DELETE  
Required request header   
    `token` : authToken  

# SHOPPING CART
#### Save shopping cart
Endpoint: `<host>`:`<port>`/shoppingcart  
Method: POST  
Required request header   
    `token` : authToken  
Request body: JSON representation of shopping cart  

```
{
    "items":{
        "pizzas": [
            {
                "category": "pizza",
                "type": "Cheese",
                "size": "med",
                "toppings": [
                    "cheese"
                ],
                "total": "$30.00",
                "qty": 2,
                "id": "m7ocndh7yofh"
            },
            {
                "category": "pizza",
                "type": "Pepperoni",
                "size": "lg",
                "toppings": [
                    "cheese",
                    "pepperoni"
                ],
                "total": "$20.00",
                "qty": 1,
                "id": "vglwo16whtir"
            }
        ],
        "wings": [
            {
                "category": "wings",
                "type": "traditional",
                "seasoning": "bbq",
                "total": "$40.00",
                "qty": 4,
                "id": "6be0mcevmtbr"
            },
            {
                "category": "wings",
                "type": "boneless",
                "seasoning": "parmesan",
                "total": "$10.00",
                "qty": 1,
                "id": "v7ig5qu7w3yx"
            }
        ],
        "breadsticks": [
            {
                "category": "breadsticks",
                "seasoning": "garlic",
                "total": "$14.00",
                "qty": 2,
                "id": "xbgq9trioa87"
            }
        ],
        "sodas": [
            {
                "category": "soda",
                "flavor": "Diet Coke",
                "total": "$5.00",
                "qty": 2,
                "id": "6llx265ck69p"
            },
            {
                "category": "soda",
                "flavor": "Sprite",
                "total": "$2.50",
                "qty": 1,
                "id": "k9ojcxtknlbf"
            }
        ],
        "total": "$121.50"
    }
}
```


#### Get shopping cart
Endpoint: `<host>`:`<port>`/shoppingcart  
Method: GET  
Required request header  
    `token` : authToken  


#### Update shopping cart
Endpoint: `<host>`:`<port>`/shoppingcart  
Method: PUT  
Required request header   
    `token` : authToken  
Request body: JSON represnation of shopping cart to update  

```
{
"items":{
    "pizzas": [
        {
            "category": "pizza",
            "type": "Cheese",
            "size": "med",
            "toppings": [
                "cheese"
            ],
            "total": "$30.00",
            "qty": 2,
            "id": "m7ocndh7yofh"
        },
        {
            "category": "pizza",
            "type": "Pepperoni",
            "size": "lg",
            "toppings": [
                "cheese",
                "pepperoni"
            ],
            "total": "$20.00",
            "qty": 1,
            "id": "vglwo16whtir"
        }
    ],
    "wings": [
        {
            "category": "wings",
            "type": "traditional",
            "seasoning": "bbq",
            "total": "$40.00",
            "qty": 4,
            "id": "6be0mcevmtbr"
        }
    ],
    "breadsticks": [
        {
            "category": "breadsticks",
            "seasoning": "garlic",
            "total": "$14.00",
            "qty": 2,
            "id": "xbgq9trioa87"
        }
    ],
    "sodas": [
        {
            "category": "soda",
            "flavor": "Diet Coke",
            "total": "$5.00",
            "qty": 2,
            "id": "6llx265ck69p"
        },
        {
            "category": "soda",
            "flavor": "Sprite",
            "total": "$2.50",
            "qty": 1,
            "id": "k9ojcxtknlbf"
        }
    ],
    "total": "$110.50"
    }
}
```

#### Empty shopping cart
Endpoint: `<host>`:`<port>`/shoppingcart  
Method: DELETE  
Required request header   
    `token` : authToken  


# ORDER Services
#### Place order processing, process order
Endpoint: `<host>`:`<port>`/orders  
Method: POST  
Required request header   
    `token` : authToken  

#### Get order
Endpoint: `<host>`:`<port>`/orders  
Method: GET  
Required request header  
    `token` : authToken  


# Dev Notes
Locally create a **.data** in the root directory, then create following subdirectories inside it - TODO: introduce script to handle this.
- carts
- orders
- tokens
- users