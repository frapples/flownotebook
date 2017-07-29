from flownotebook import models
from flownotebook.config import NO_LOGIN_USER_ID


def create_test_data(app):
    with app.app_context():
        top_category = ["计算机", "经济学", "物理学"]

        for name in top_category:
            models.db.session.add(models.Category(name=name, level=1,
                                                  user_id=NO_LOGIN_USER_ID))
        models.db.session.commit()
