import flask
from flask import request, session, jsonify
import sqlalchemy
from ..models import Category, Note, db

from .user import jsonapi_logined_validation


blueprint = flask.Blueprint('api_note', __name__)


@blueprint.route("/category_children", methods=["POST"])
@jsonapi_logined_validation
def category_children():
    id = int(request.form["id"])
    user_id = session['login_user_id']

    if id > 0:
        category = Category.get_belongs_user(id, user_id)
        if not category:
            return jsonify(success=False, reason="NOT_EXISTS")
        else:
            if category.level < 3:
                data = category.children
                data = [dict(name=c.name, id=c.id) for c in data]
            else:
                data = category.notes
                data = [dict(title=n.title, note_type=n.note_type, id=n.id)
                        for n in data]
    else:
        data = Category.query.filter_by(user_id=user_id, parent_id=None)
        data = [dict(name=c.name, id=c.id) for c in data]

    return jsonify(success=True, data=data)


@blueprint.route("/category_add", methods=["POST"])
@jsonapi_logined_validation
def category_add():
    parent_id = int(request.form["parent_id"])
    user_id = session['login_user_id']
    category_name = request.form['name']
    if parent_id > 0:
        parent = Category.get_belongs_user(parent_id, user_id)
        if parent and parent.level < 3:
            category = Category(name=category_name,
                                level=parent.level + 1,
                                parent_id=parent_id,
                                user_id=user_id)
        else:
            return jsonify(success=False, reason="LEVEL_ERROR")

    else:
        category = Category(name=category_name, level=1, user_id=user_id)

    db.session.add(category)
    db.session.commit()
    return jsonify(success=True, id=category.id)


@blueprint.route("/category_del", methods=["POST"])
@jsonapi_logined_validation
def category_del():
    raise NotImplemented


@blueprint.route("/note_get", methods=["POST"])
@jsonapi_logined_validation
def get_note():
    note_id = int(request.form["id"])
    user_id = session['login_user_id']

    note_ = Note.query.get(note_id)
    if note_ and note_.category.user_id == user_id:
        tags = [t.name for t in note_.tags]
        return jsonify(success=True,
                       data=dict(content=note_.content, tags=tags))
    else:
        return jsonify(success=False, reason="NOT EXISTS")


@blueprint.route("/note_add", methods=["POST"])
@jsonapi_logined_validation
def note_add():
    category_id = int(request.form["category_id"])
    user_id = session['login_user_id']
    note_content = request.form['content']
    type_ = request.form["type"]
    category = Category.get_belongs_user(category_id, user_id)

    if category and category.level == 3:
        note = Note(title="TEST", note_type=type_, content=note_content)
        note.category = category
        db.session.add(note)
        db.session.commit()
        return jsonify(success=True, id=note.id)
    else:
        return jsonify(success=False, reason="CATEGORY_LEVEL_ERROR")


@blueprint.route("/note_del", methods=["POST"])
@jsonapi_logined_validation
def note_del():
    note_id = int(request.form["id"])
    user_id = session['login_user_id']
    note_ = Note.query.get(note_id)
    if note_ and note_.category.user_id == user_id:
        db.session.delete(note_)
        db.session.commit()
        return jsonify(success=True)
    else:
        return jsonify(success=False, reason="NOT_EXISTS")