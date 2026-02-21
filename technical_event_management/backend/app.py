from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///event_management.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'mysecretkey123'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

db = SQLAlchemy(app)
jwt = JWTManager(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default='user')
    phone = db.Column(db.String(20))
    is_active = db.Column(db.Boolean, default=True)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Integer, default=0)
    category = db.Column(db.String(100))
    vendor_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    status = db.Column(db.String(20), default='available')
    vendor = db.relationship('User', backref='products')

class Cart(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    quantity = db.Column(db.Integer, default=1)
    product = db.relationship('Product')

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    total_amount = db.Column(db.Float, nullable=False)
    payment_method = db.Column(db.String(20))
    status = db.Column(db.String(30), default='Pending')
    created_at = db.Column(db.DateTime, default=db.func.now())
    user = db.relationship('User', backref='orders')

class OrderItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    quantity = db.Column(db.Integer)
    price = db.Column(db.Float)
    product = db.relationship('Product')
    order = db.relationship('Order', backref='items')

class ItemRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    vendor_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    item_name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.String(30), default='Pending')
    user = db.relationship('User', foreign_keys=[user_id])

def get_identity():
    identity_str = get_jwt_identity()
    uid, role = identity_str.split('|')
    return int(uid), role

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    user = User(
        name=data['name'], email=data['email'],
        password=generate_password_hash(data['password']),
        role=data.get('role', 'user'), phone=data.get('phone', '')
    )
    db.session.add(user)
    db.session.commit()
    token = create_access_token(identity=str(user.id) + '|' + user.role)
    return jsonify({'token': token, 'user': {'id': user.id, 'name': user.name, 'role': user.role}})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    if not user.is_active:
        return jsonify({'error': 'Account deactivated'}), 403
    token = create_access_token(identity=str(user.id) + '|' + user.role)
    return jsonify({'token': token, 'user': {'id': user.id, 'name': user.name, 'role': user.role, 'email': user.email}})

@app.route('/api/products', methods=['GET'])
def get_products():
    products = Product.query.filter_by(status='available').all()
    return jsonify([{
        'id': p.id, 'name': p.name, 'description': p.description,
        'price': p.price, 'quantity': p.quantity, 'category': p.category,
        'vendor': p.vendor.name, 'vendor_id': p.vendor_id
    } for p in products])

@app.route('/api/products', methods=['POST'])
@jwt_required()
def add_product():
    uid, role = get_identity()
    if role != 'vendor':
        return jsonify({'error': 'Only vendors can add products'}), 403
    data = request.json
    product = Product(
        name=data['name'], description=data.get('description', ''),
        price=data['price'], quantity=data['quantity'],
        category=data.get('category', ''), vendor_id=uid
    )
    db.session.add(product)
    db.session.commit()
    return jsonify({'message': 'Product added', 'id': product.id}), 201

@app.route('/api/products/<int:pid>', methods=['PUT'])
@jwt_required()
def update_product(pid):
    uid, role = get_identity()
    product = Product.query.get_or_404(pid)
    if role == 'vendor' and product.vendor_id != uid:
        return jsonify({'error': 'Unauthorized'}), 403
    data = request.json
    for field in ['name', 'description', 'price', 'quantity', 'category', 'status']:
        if field in data:
            setattr(product, field, data[field])
    db.session.commit()
    return jsonify({'message': 'Product updated'})

@app.route('/api/products/<int:pid>', methods=['DELETE'])
@jwt_required()
def delete_product(pid):
    uid, role = get_identity()
    product = Product.query.get_or_404(pid)
    if role not in ['admin'] and product.vendor_id != uid:
        return jsonify({'error': 'Unauthorized'}), 403
    db.session.delete(product)
    db.session.commit()
    return jsonify({'message': 'Product deleted'})

@app.route('/api/vendor/products', methods=['GET'])
@jwt_required()
def vendor_products():
    uid, role = get_identity()
    products = Product.query.filter_by(vendor_id=uid).all()
    return jsonify([{
        'id': p.id, 'name': p.name, 'price': p.price,
        'quantity': p.quantity, 'status': p.status, 'category': p.category
    } for p in products])

@app.route('/api/cart', methods=['GET'])
@jwt_required()
def get_cart():
    uid, role = get_identity()
    items = Cart.query.filter_by(user_id=uid).all()
    return jsonify([{
        'id': i.id, 'product_id': i.product_id, 'quantity': i.quantity,
        'name': i.product.name, 'price': i.product.price,
        'total': i.product.price * i.quantity
    } for i in items])

@app.route('/api/cart', methods=['POST'])
@jwt_required()
def add_to_cart():
    uid, role = get_identity()
    data = request.json
    existing = Cart.query.filter_by(user_id=uid, product_id=data['product_id']).first()
    if existing:
        existing.quantity += data.get('quantity', 1)
    else:
        item = Cart(user_id=uid, product_id=data['product_id'], quantity=data.get('quantity', 1))
        db.session.add(item)
    db.session.commit()
    return jsonify({'message': 'Added to cart'})

@app.route('/api/cart/<int:item_id>', methods=['DELETE'])
@jwt_required()
def remove_from_cart(item_id):
    uid, role = get_identity()
    item = Cart.query.filter_by(id=item_id, user_id=uid).first_or_404()
    db.session.delete(item)
    db.session.commit()
    return jsonify({'message': 'Removed from cart'})

@app.route('/api/checkout', methods=['POST'])
@jwt_required()
def checkout():
    uid, role = get_identity()
    data = request.json
    cart_items = Cart.query.filter_by(user_id=uid).all()
    if not cart_items:
        return jsonify({'error': 'Cart is empty'}), 400
    total = sum(i.product.price * i.quantity for i in cart_items)
    order = Order(user_id=uid, total_amount=total, payment_method=data.get('payment_method', 'Cash'))
    db.session.add(order)
    db.session.flush()
    for i in cart_items:
        oi = OrderItem(order_id=order.id, product_id=i.product_id, quantity=i.quantity, price=i.product.price)
        db.session.add(oi)
        db.session.delete(i)
    db.session.commit()
    return jsonify({'message': 'Order placed successfully', 'order_id': order.id})

@app.route('/api/orders', methods=['GET'])
@jwt_required()
def get_orders():
    uid, role = get_identity()
    if role == 'admin':
        orders = Order.query.all()
    else:
        orders = Order.query.filter_by(user_id=uid).all()
    return jsonify([{
        'id': o.id, 'total': o.total_amount, 'status': o.status,
        'payment': o.payment_method,
        'created_at': o.created_at.strftime('%Y-%m-%d %H:%M') if o.created_at else '',
        'user': o.user.name,
        'items': [{'name': i.product.name, 'qty': i.quantity, 'price': i.price} for i in o.items]
    } for o in orders])

@app.route('/api/orders/<int:oid>/status', methods=['PUT'])
@jwt_required()
def update_order_status(oid):
    uid, role = get_identity()
    if role not in ['admin', 'vendor']:
        return jsonify({'error': 'Unauthorized'}), 403
    order = Order.query.get_or_404(oid)
    order.status = request.json['status']
    db.session.commit()
    return jsonify({'message': 'Status updated'})

@app.route('/api/request-item', methods=['POST'])
@jwt_required()
def request_item():
    uid, role = get_identity()
    data = request.json
    req = ItemRequest(
        user_id=uid, vendor_id=data.get('vendor_id'),
        item_name=data['item_name'], description=data.get('description', '')
    )
    db.session.add(req)
    db.session.commit()
    return jsonify({'message': 'Request submitted'})

@app.route('/api/item-requests', methods=['GET'])
@jwt_required()
def get_item_requests():
    uid, role = get_identity()
    if role == 'admin':
        reqs = ItemRequest.query.all()
    elif role == 'vendor':
        reqs = ItemRequest.query.filter_by(vendor_id=uid).all()
    else:
        reqs = ItemRequest.query.filter_by(user_id=uid).all()
    return jsonify([{
        'id': r.id, 'item_name': r.item_name, 'description': r.description,
        'status': r.status, 'user': r.user.name
    } for r in reqs])

@app.route('/api/admin/users', methods=['GET'])
@jwt_required()
def get_users():
    uid, role = get_identity()
    if role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    users = User.query.all()
    return jsonify([{
        'id': u.id, 'name': u.name, 'email': u.email,
        'role': u.role, 'phone': u.phone, 'is_active': u.is_active
    } for u in users])

@app.route('/api/admin/users/<int:uid>/toggle', methods=['PUT'])
@jwt_required()
def toggle_user(uid):
    caller_uid, role = get_identity()
    if role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    user = User.query.get_or_404(uid)
    user.is_active = not user.is_active
    db.session.commit()
    return jsonify({'message': 'Updated', 'is_active': user.is_active})

@app.route('/api/vendors', methods=['GET'])
def get_vendors():
    vendors = User.query.filter_by(role='vendor', is_active=True).all()
    return jsonify([{'id': v.id, 'name': v.name} for v in vendors])

def init_db():
    with app.app_context():
        db.drop_all()
        db.create_all()
        if not User.query.filter_by(email='admin@event.com').first():
            admin = User(name='Admin', email='admin@event.com',
                        password=generate_password_hash('admin123'), role='admin')
            db.session.add(admin)
            db.session.commit()
            print("✅ Database initialized!")
            print("✅ Default admin created: admin@event.com / admin123")

init_db()

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='127.0.0.1')