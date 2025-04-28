from marshmallow import Schema, fields

class CartSchema(Schema):
    id = fields.Int(dump_only=True)
    user_id = fields.Int(required=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    #Define relationship fields
    cart_items = fields.Nested('CartItemSchema', many=True, dump_only=True)