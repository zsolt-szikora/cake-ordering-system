'use strict'

const AWS = require('aws-sdk');
const ses = new AWS.SES({
    region: process.env.region
});

const CAKE_PRODUCER_EMAIL = process.env.cakeProducerEmail;
const ORDERING_SYSTEM_EMAIL = process.env.orderingSystemEmail;

module.exports.handlePlacedOrders = ordersPlaced => {
    var ordersPlacedPromises = [];

    for (let order of ordersPlaced) {
        const temp = notifyCakeProducerByEmail(order);
        ordersPlacedPromises.push(temp);
    }

    return Promise.all(ordersPlacedPromises);
}

function notifyCakeProducerByEmail(order) {
    const params = {
        Destination: {
            ToAddresses: [CAKE_PRODUCER_EMAIL]
        },
        Message: {
            Body: {
                Text: {
                    Data: JSON.stringify(order)
                }
            },
            Subject: {
                Data: 'New cake order'
            }
        },
        Source: ORDERING_SYSTEM_EMAIL
    };
    console.info('SES PARAMS' + JSON.stringify(params, null, 2));
    console.info('process.env.region: ' + process.env.region);

    return ses.sendEmail(params).promise().then(data => {
        console.info('SENDEMAIL RETURNED DATA\n' + JSON.stringify(data, null, 2));
        return data;
    }).catch(error => {
        console.info('SENDEMAIL RETURNED ERROR\n' + JSON.stringify(error, null, 2));
        return error;
    });
}