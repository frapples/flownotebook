import flask
from . import models
from .blueprints import jsonapi
from .blueprints import notepage

app = flask.Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
app.config['SQLALCHEMY_ECHO'] = True  # 回显SQL语句
models.init_db(app)
app.register_blueprint(jsonapi.blueprint)
app.register_blueprint(notepage.blueprint)
