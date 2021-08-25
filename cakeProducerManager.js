'use strict'

const AWS = require('aws-sdk');
const ses = new AWS.SESV2({
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
        FromEmailAddress: ORDERING_SYSTEM_EMAIL,
        Destination: {
            ToAddresses: [CAKE_PRODUCER_EMAIL]
        },
        Content: {
            Simple: {
                Body: {
                    Text: {
                        Data: JSON.stringify(order)
                    }
                },
                Subject: {
                    Data: 'New cake order'
                }
            }
        }
    };
    console.info('SES PARAMS' + JSON.stringify(params, null, 2));
    console.info('process.env.region: ' + process.env.region);

    return ses.sendEmail(params, function (err, data) {
        if (err) {
            console.info('SESCLIENT_SEND REJECTED\n' + JSON.stringify(err, null, 2));
            return Promise.reject(new Error(err));
        } else {
            console.info('SESCLIENT_SEND FULFILLED2\n' + JSON.stringify(data, null, 2));
            return new Promise(data);
        };
    });
}
