import flask
from .. import models
from .user import logined_validation

blueprint = flask.Blueprint('note_page', __name__)


@blueprint.route('/')
@blueprint.route('/index')
@logined_validation
def index():
    return flask.render_template("index.html")
