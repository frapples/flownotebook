import flask
from datetime import timedelta
from flask.ext.session import Session
from . import models
from .blueprints import jsonapi
from .blueprints import notepage

sess = Session()


def create_app():
    app = flask.Flask(__name__)

    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_ECHO'] = True  # 回显SQL语句

    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)
    app.config['SESSION_SQLALCHEMY'] = models.db
    app.config['SESSION_TYPE'] = 'sqlalchemy'
    sess.init_app(app)
    models.init_db(app)

    app.register_blueprint(jsonapi.blueprint, url_prefix='/json_api')
    app.register_blueprint(notepage.blueprint)

    return app


app = create_app()
