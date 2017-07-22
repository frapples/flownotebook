import flask
from flask import request, session
import sqlalchemy
from ..models import db, User

blueprint = flask.Blueprint('json_api', __name__)


@blueprint.route("/user/register", methods=["POST"])
def user_register():
    username = request.form.get('username', "")
    password = request.form.get('password', "")
    if username and password:
        if User.query.filter_by(name=username).count() == 0:
            db.session.add(User(username, password))
            db.session.commit()
            return flask.jsonify(success=True)
        else:
            return flask.jsonify(success=False, reason="USERNAME_EXISTED")
    else:
        return flask.jsonify(success=False, reason="DATA_ERROR")


@blueprint.route("/user/login", methods=["POST"])
def user_login():
    username = request.form.get('username', "")
    password = request.form.get('password', "")

    try:
        user = User.query.filter_by(name=username).one()
        if user.check(password):
            session['login_user_id'] = user.id
            return flask.jsonify(success=True)
        else:
            return flask.jsonify(success=False, reason="PASSWORD_INCORRECT")
    except sqlalchemy.orm.exc.NoResultFound:
        return flask.jsonify(success=False, reason="USERNAME_NOT_EXISTS")


@blueprint.route("/user/is_login", methods=["POST"])
def is_login():
    if 'login_user_id' in session:
        return flask.jsonify(is_login=True, login_id=session["login_user_id"])
    else:
        return flask.jsonify(is_login=False)
