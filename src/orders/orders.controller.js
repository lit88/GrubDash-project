const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

// handlers

function list(req, res, next){
    res.json({ data: orders })
}

function create(req, res, next) {
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body
    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        status,
        dishes
    }
    orders.push(newOrder)
    res.status(201).json({ data: newOrder })
}

function read(req, res, next) {
    res.json({ data: res.locals.order })
}

// verifications

function bodyDataHas(propertyName) {
    return function (req, res, next) {
      const { data = {} } = req.body
      if (data[propertyName] && data[propertyName] !== "") {
        return next();
      }
      next({ status: 400, message: `Order must include a ${propertyName}` })
    }
}

function dishesVerify(req, res, next) {
    const { data: { dishes } = {} } = req.body
    if (Array.isArray(dishes) && dishes.length > 0) {
        return next()
    }
    next({
        status: 400,
        message: `Order must include at least one dish`,
    })
}

function quantityVerify(req, res, next) {
    const { data: { dishes } = {} } = req.body
    dishes.map((dish, index) => {
        if( !dish.quantity || dish.quantity <= 0 || !Number.isInteger(dish.quantity)) {
        return next({
            status: 400,
            message: `Dish ${index} must have a quantity that is an integer greater than 0`,
        })
    }})
    next()
}

function orderExists(req, res, next) {
    const { orderId } = req.params
    const foundOrder = orders.find((order)=> order.id === orderId)
    if(foundOrder) {
        res.locals.order = foundOrder
        next()
    }
    next({
        status: 404,
        message: `Order does not exist: ${orderId}.`
    })
}


module.exports = {
    list,
    create: [
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        bodyDataHas("dishes"),
        dishesVerify,
        quantityVerify,
        create
    ],
    read: [orderExists,
        read],
}