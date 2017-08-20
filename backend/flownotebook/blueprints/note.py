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
                data = [dict(title=n.title, note_type=n.note_type.name, id=n.id)
                        for n in data]
    else:
        data = Category.query.filter_by(user_id=user_id, parent_id=None)
        data = [dict(name=c.name, id=c.id) for c in data]

    return jsonify(success=True, data=data)


@blueprint.route("/category_tree", methods=["POST"])
@jsonapi_logined_validation
def category_tree():
    user_id = session['login_user_id']

    def get_category(id, deep):
        if deep < 3:
            categorys = Category.query.filter_by(user_id=user_id, parent_id=id)
            categorys = [dict(name=c.name, id=c.id) for c in categorys]

            for item in categorys:
                item['children'] = get_category(item['id'], deep + 1)
            return categorys
        elif deep == 3:
            notes = Note.query.filter_by(category_id=id)
            notes = [dict(title=n.title, note_type=n.note_type.name, id=n.id)
                     for n in notes]
            return notes

    return jsonify(success=True, data=get_category(None, 0))


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
    id = int(request.form["id"])
    user_id = session['login_user_id']
    category = Category.get_belongs_user(id, user_id)
    if category is None:
        return jsonify(success=False, reason="NOT EXISTS")

    def del_(node):
        if node.level < 3:
            for n in node.children:
                del_(n)
            db.session.delete(node)
        else:
            for n in node.notes:
                db.session.delete(n)
        db.session.delete(node)

    del_(category)
    db.session.commit()
    return jsonify(success=True)


@blueprint.route("/category_move", methods=["POST"])
@jsonapi_logined_validation
def category_move():
    new_parent_id = int(request.form["new_parent_id"])
    id = int(request.form["id"])
    user_id = session['login_user_id']

    category = Category.get_belongs_user(id, user_id)
    new_parent = Category.get_belongs_user(new_parent_id, user_id)
    if category is None or new_parent is None:
        return jsonify(success=False, reason="NOT EXISTS")

    if new_parent.level + 1 == category.level:
        category.parent_id = new_parent_id
    elif new_parent.level + 1 < category.level:
        raise NotImplemented
    elif new_parent.level + 1 > category.level:
        raise NotImplemented

    db.session.commit()
    return jsonify(success=True)


@blueprint.route("/note_get", methods=["POST"])
@jsonapi_logined_validation
def get_note():
    note_id = int(request.form["id"])
    user_id = session['login_user_id']

    note_ = Note.query.get(note_id)
    if note_ and note_.category.user_id == user_id:
        tags = [t.name for t in note_.tags]
        return jsonify(success=True,
                       data=dict(content=note_.content,
                                 tags=tags,
                                 draft=note_.draft))
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


@blueprint.route("/note_save_draft", methods=["POST"])
@jsonapi_logined_validation
def note_save_draft():
    note_id = int(request.form["id"])
    draft = request.form["draft"]
    user_id = session['login_user_id']
    note_ = Note.query.get(note_id)
    if note_ and note_.category.user_id == user_id:
        note_.draft = draft
        db.session.commit()
        return jsonify(success=True)
    else:
        return jsonify(success=False, reason="NOT_EXISTS")
