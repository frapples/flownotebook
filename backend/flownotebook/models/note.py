from .db import db
import enum


class Category(db.Model):
    __tablename__ = "category"

    id = db.Column(db.Integer, primary_key=True, nullable=False)
    name = db.Column(db.String(10), nullable=False)
    level = db.Column(db.SmallInteger, nullable=False)

    parent = db.relationship('Category')
    parent_id = db.Column(db.Integer, db.ForeignKey('category.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

    def __repr__(self):
        return '<Category id=%d name=%s user=%s>' % (self.id,
                                                     self.name, self.user.id)


class NoteType(enum.Enum):
    markdown = 1
    scraps = 2


tags_mark = db.Table(
    'tags_mark',
    db.Column('tag_id', db.Integer, db.ForeignKey('tag.id')),
    db.Column('note_id', db.Integer, db.ForeignKey('note.id'))
)


class Note(db.Model):
    __tablename__ = "note"

    id = db.Column(db.Integer, primary_key=True, nullable=False)
    note_type = db.Column(db.Enum(NoteType), nullable=False)
    title = db.Column(db.String(30), nullable=False)
    is_trash = db.Column(db.Boolean, default=False, nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'))

    tags = db.relationship('Tag', secondary=tags_mark)
    media = db.relationship('MediaReference', lazy='dynamic')


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

    def filepath(self):
        raise NotImplemented
