from marshmallow import Schema, fields
class CartItemsSchema(Schema):
    id = fields.Int(dump_only=True)
    cart_id = fields.Int(required=True)
    product_id=fields.Int(required=True)
    quantity=fields.Int(required=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    product = fields.Nested('ProductSchema', dump_only=True)