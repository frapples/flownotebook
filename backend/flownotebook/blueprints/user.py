import functools
import flask
from flask import request, session
import sqlalchemy
from ..models import db, User
from ..config import NO_LOGIN_PASSWORD, NO_LOGIN_USER_ID


blueprint = flask.Blueprint('api_user', __name__)


def logined_validation(view_func):

    assert callable(view_func)

    @functools.wraps(view_func)
    def wrapper(*args, **kwargs):
        try_auto_login()

        if 'login_user_id' in session:
            return view_func(*args, **kwargs)
        else:
            flask.redirect(flask.url_for("notepage.login"))

    return wrapper


def jsonapi_logined_validation(view_func):

    assert callable(view_func)

    @functools.wraps(view_func)
    def wrapper(*args, **kwargs):
        try_auto_login()

        if 'login_user_id' in session:
            return view_func(*args, **kwargs)
        else:
            return flask.jsonify(success=False, reason="NO_LOGIN")

    return wrapper


@blueprint.route("/register", methods=["POST"])
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


@blueprint.route("/login", methods=["POST"])
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


@blueprint.route("/is_login", methods=["POST"])
@logined_validation
def is_login():
    if 'login_user_id' in session:
        return flask.jsonify(is_login=True, login_id=session["login_user_id"])
    else:
        return flask.jsonify(is_login=False)


def try_auto_login():
    default_user_id = NO_LOGIN_USER_ID
    if request.args.get('no_login', "") == NO_LOGIN_PASSWORD:
        user = User.query.get(default_user_id)
        if user is None:
            user = User('default', '88888888')
            user.id = default_user_id
            db.session.add(user)
            db.session.commit()
        session['login_user_id'] = default_user_id
