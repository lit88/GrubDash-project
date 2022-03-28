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

function update(req, res, next) {
    const order = res.locals.order
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body
    order.deliverTo = deliverTo
    order.mobileNumber = mobileNumber
    order.status = status
    order.dishes = dishes
    res.json({ data: order })
}

function destroy(req, res, next) {
    const order = res.locals.order
    const deletedOrder = orders.splice(order.index, 1)
    res.sendStatus(204)
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

function matchingId(req, res, next) {
    const { orderId } = req.params
    const { data: { id }  = {} } = req.body
    if ( id === null || id === undefined || id === "" || id === orderId ) {
        return next()
    }
    next({
        status: 400,
        message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`,
    })
}

function statusVerify(req, res, next) {
    const { data: { status }  = {} } = req.body
    if(status !== "delivered" && status !== "pending" && status !== "preparing" && status !== "out-for-delivery"){
        return next({
            status: 400,
            message: `Order must have a status of pending, preparing, out-for-delivery, delivered`,
        })
    }
    if(status === "delivered"){
        return next({
            status: 400,
            message: `A delivered order cannot be changed`
        })
    }
    next()
}

function deletePending(req, res, next){
    const order = res.locals.order
    if ( order.status !== "pending" ){
        return next({
            status: 400,
            message: `An order cannot be deleted unless it is pending`,
        })
    }
    next()
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
    update: [
        orderExists,
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        bodyDataHas("dishes"),
        bodyDataHas("status"),
        dishesVerify,
        quantityVerify,
        matchingId,
        statusVerify,
        update
    ],
    delete: [
        orderExists,
        deletePending,
        destroy,
    ]
}