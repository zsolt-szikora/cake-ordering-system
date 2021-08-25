'use strict'

module.exports.deliveryOrder = ordersFulfilled => {
    console.log('Delivery Order was called');

    return new Promise(resolve => {
        setTimeout(() => {
            console.log('foo');
            resolve('foo')
        }, 300);
    });
}