from flownotebook import models


def create_test_data(app):
    with app.app_context():
        models.db.session.add(models.Category(name="计算机", level=1))
        models.db.session.add(models.Category(name="经济学", level=1))
        models.db.session.add(models.Category(name="物理学", level=1))
