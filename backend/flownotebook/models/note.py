from .db import db
from sqlalchemy import orm, event
import enum
import os.path
from ..config import DATA_ROOT


class Category(db.Model):
    __tablename__ = "category"

    id = db.Column(db.Integer, primary_key=True, nullable=False)
    name = db.Column(db.String(10), nullable=False)
    level = db.Column(db.SmallInteger, nullable=False)

    children = db.relationship('Category')
    notes = db.relationship('Note', backref="category")
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
    snippet = 3


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

    def __init__(self, note_type, title, content=""):
        self.note_type = note_type
        self.title = title
        self.content = content

    @orm.reconstructor
    def init_on_load(self):
        with open(self.filepath(), "r", encoding="utf8", newline="\r\n") as f:
            self.content = f.read()

    def write_content(self):
        with open(self.filepath(), "w", encoding="utf8", newline="\r\n") as f:
            f.write(self.content)

    def filepath(self):

        assert self.id

        dir_ = os.path.join(DATA_ROOT, str(self.category.user_id))
        os.makedirs(dir_, exist_ok=True)
        return os.path.join(dir_, str(self.id) + ".md")


@event.listens_for(Note, "after_insert")
def before_insert(mapper, connection, target):
    target.write_content()


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
