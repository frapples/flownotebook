from .db import db
from sqlalchemy import orm
import enum
import os.path
from ..config import DATA_ROOT


class Category(db.Model):
    __tablename__ = "category"

    id = db.Column(db.Integer, primary_key=True, nullable=False)
    name = db.Column(db.String(10), nullable=False)
    level = db.Column(db.SmallInteger, nullable=False)

    children = db.relationship('Category')
    notes = db.relationship('Note')
    parent_id = db.Column(db.Integer, db.ForeignKey('category.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

    def __repr__(self):
        return '<Category id=%d name=%s user=%s>' % (self.id,
                                                     self.name, self.user.id)

    @classmethod
    def get_belongs_user(cls, id, user_id):
        c = cls.query.get(id)
        if c and c.user_id == user_id:
            return c
        else:
            return None


class NoteType(enum.Enum):
    markdown = 1
    scraps = 2
    codesnippet = 3


tags_mark = db.Table(
    'tags_mark',
    db.Column('tag_id', db.Integer, db.ForeignKey('tag.id')),
    db.Column('note_id', db.Integer, db.ForeignKey('note.id'))
)


class Note(db.Model):
    __tablename__ = "note"

    id = db.Column(db.Integer, primary_key=True, nullable=False)
    note_type = db.Column(db.Enum(NoteType), nullable=False)
    title = db.Column(db.String, nullable=False)
    is_trash = db.Column(db.Boolean, default=False, nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'))

    tags = db.relationship('Tag', secondary=tags_mark)
    media = db.relationship('MediaReference', lazy='dynamic')

    @property
    def content(self):
        with open(self.filepath(), "r", encoding="utf8", newline="\r\n") as f:
            return f.read()

    @content.setter
    def set_content(self, content):
        with open(self.filepath(), "w", encoding="utf8", newline="\r\n") as f:
            f.write(content)

    def filepath(self):
        dir_ = os.path.join(DATA_ROOT, str(self.category.user.id))
        os.makedirs(dir_, exist_ok=True)
        return os.path.join(dir_, str(self.id) + ".md")


class Tag(db.Model):
    __tablename__ = "tag"

    id = db.Column(db.Integer, primary_key=True, nullable=False)
    name = db.Column(db.String(10), unique=True, nullable=False)


class MediaReference(db.Model):
    __tablename__ = 'media_reference'

    hash = db.Column(db.String(32), primary_key=True, nullable=False)

    note_id = db.Column(db.Integer, db.ForeignKey('note.id'))

    def __init__(self, tmp_file):
        raise NotImplemented

    @orm.reconstructor
    def init_on_load(self):
        self.filepath = ""
        raise NotImplemented
