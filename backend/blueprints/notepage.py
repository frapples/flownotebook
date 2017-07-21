import flask
from .. import models

blueprint = flask.Blueprint('note_page', __name__)


@blueprint.route('/')
@blueprint.route('/index')
def index():
    return flask.render_template("index.html")
