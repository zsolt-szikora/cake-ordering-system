'use strict';

const orderManager = require('./oderManager');
const kinesisHelper = require('./kinesisHelper');
const cakeProducerManager = require('./cakeProducerManager');

function createResponse(statusCode, message) {
  return {
    statusCode: statusCode,
    body: JSON.stringify(message)
  };
}

module.exports.createOrder = async (event) => {

  const body = JSON.parse(event.body);
  const order = orderManager.createOrder(body);

  return orderManager.placeNewOrder(order).then(() => {
    return createResponse(200, order);
  }).catch(error => {
    return createResponse(400, error);
  })
};

module.exports.fulfillOrder = async (event) => {
  const body = JSON.parse(event.body);
  const orderId = body.orderId;
  const fulfillmentId = body.fulfillmentId;

  return orderManager.fulfillOrder(orderId, fulfillmentId).then(() => {
    return createResponse(200, `Order with orderId:${orderId} was sent to delivery`);
  }).catch(error => {
    return createResponse(400, error);
  })
};

module.exports.notifyCakeProducer = async (event) => {
  console.info('NOTIFY_CAKE_PRODUCER_CALLED with event\n' + JSON.stringify(event, null, 2));

  const records = kinesisHelper.getRecords(event);
  console.info('RECORDS TO PROCESS\n' + JSON.stringify(records, null, 2));

  const ordersPlaced = records.filter(r => r.eventType === 'order_placed');
  console.info('ORDERS PLACED\n' + JSON.stringify(ordersPlaced, null, 2));

  if (ordersPlaced <= 0) {
    return 'there is nothing';
  }
  console.info('ABOUT TO CALL HANDLE_PLACED_ORDERS');
  cakeProducerManager.handlePlacedOrders(ordersPlaced).then(result => {
    console.info('HANDLE_PLACED_ORDERS RETURNED DATA\n' + JSON.stringify(result, null, 2));
    return result;
  }).catch(error => {
    console.info('HANDLE_PLACED_ORDERS RETURNED ERROR\n' + JSON.stringify(error, null, 2));
    return error;
  });

}
