// One-off test: verify seller access control on order status updates.
// Creates: owner-seller, other-seller, buyer -> places an order with the
// owner's product, then tries updating its status from each role.
const mongoose = require('mongoose');
const API = 'http://localhost:5000';

async function reg(email) {
  const r = await fetch(API + '/api/auth/register', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName: 'F', lastName: 'L', email, password: 'test123456' })
  });
  return (await r.json()).data;
}
async function j(url, opts) {
  const r = await fetch(url, opts);
  const body = await r.json();
  return { status: r.status, body };
}

(async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/vendorverse');
  const db = mongoose.connection.db;
  const promote = email => db.collection('users').updateOne({ email }, { $set: { role: 'seller' } });

  const owner = await reg('owner@test.com');
  const other = await reg('other@test.com');
  await promote('owner@test.com');
  await promote('other@test.com');

  const buyer = await reg('buyer@test.com');
  const bTok = buyer.token;

  // Owner creates a product
  const prod = await j(API + '/api/products', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + owner.token },
    body: JSON.stringify({ title: 'ACL Product', description: 'desc', price: { mrp: 100, sellingPrice: 50 }, category: 'electronics', inventory: { quantity: 10 } })
  });
  const prodId = prod.body.data._id;
  console.log('created product:', prodId);

  // Buyer adds to DB cart and places order (createOrder uses the DB cart)
  await j(API + '/api/cart/items', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + bTok },
    body: JSON.stringify({ productId: prodId, quantity: 1 })
  });
  const orderRes = await j(API + '/api/orders', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + bTok },
    body: JSON.stringify({ shippingAddress: { fullName: 'B', phone: '1111111111', addressLine1: 'x', city: 'c', state: 's', pincode: '1' }, paymentMethod: 'cod' })
  });
  const orderId = orderRes.body.data?._id || orderRes.body.data?.orderId || orderRes.body.data;
  console.log('order created:', orderId, '| res:', orderRes.status);

  // Owner (item seller) tries to update status -> should be allowed
  const asOwner = await j(API + '/api/orders/' + orderId + '/status', {
    method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + owner.token },
    body: JSON.stringify({ status: 'shipped' })
  });
  console.log('OWNER updates status ->', asOwner.status, asOwner.body.message || '(ok)');

  // Other seller (not associated) tries -> should be 403
  const asOther = await j(API + '/api/orders/' + orderId + '/status', {
    method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + other.token },
    body: JSON.stringify({ status: 'delivered' })
  });
  console.log('OTHER seller updates status ->', asOther.status, asOther.body.message || '(ok)');

  // Cleanup
  await db.collection('orders').deleteMany({ user: buyer._id });
  await db.collection('products').deleteMany({ title: 'ACL Product' });
  await db.collection('users').deleteMany({ email: { $in: ['owner@test.com', 'other@test.com', 'buyer@test.com'] } });
  await db.collection('carts').deleteMany({ user: buyer._id });
  console.log('cleanup done');
  await mongoose.disconnect();
})().catch(e => { console.error('TEST ERROR:', e.message); process.exit(1); });
