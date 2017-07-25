from werkzeug.security import generate_password_hash, check_password_hash
from .db import db


class User(db.Model):
    __tablename__ = "user"

    name = db.Column(db.String(15), unique=True, nullable=False)
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    password_hash = db.Column(db.BINARY(8 + 1 + 40), nullable=False)
    register_time = db.Column(db.DateTime, nullable=False,
                              default=db.func.now())

    category = db.relationship('Category')

    hash_salt_method = "pbkdf2:sha1:10000"

    def __init__(self, name, password):
        self.name = name
        method, salt, hash = generate_password_hash(
            password,
            method=self.hash_salt_method,
            salt_length=8).split("$", 2)

        self.password_hash = (salt + "$" + hash).encode()

    def check(self, password):
        hash_ = self.hash_salt_method + "$" + self.password_hash.decode()
        return check_password_hash(hash_, password)

    def __repr__(self):
        return '<User id=%d name=%s>' % (self.id, self.name)
