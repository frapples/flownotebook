from flownotebook import models
from flownotebook.config import NO_LOGIN_USER_ID


def create_test_data(app):
    with app.app_context():
        top_category = ["计算机", "经济学", "物理学"]


        for name in top_category:
            top_c = models.Category(name=name, level=1,
                                    user_id=NO_LOGIN_USER_ID)
            models.db.session.add(top_c)
            models.db.session.commit()

            second_category = ["test1", "test2", "test3"]
            for s_name in second_category:
                s_name = name[0] + s_name
                second_c = models.Category(name=s_name, level=2,
                                           user_id=NO_LOGIN_USER_ID)
                second_c.parent_id = top_c.id
                models.db.session.add(second_c)
                models.db.session.commit()

                third_category = ['group1', 'group2', 'group3']
                for t_name in third_category:
                    third_c = models.Category(name=t_name, level=3,
                                            user_id=NO_LOGIN_USER_ID)
                    third_c.parent_id = second_c.id
                    models.db.session.add(third_c)
                    models.db.session.commit()

                    notes = ['笔记1', '笔记1', '笔记2']
                    for title in notes:
                        title = name + title
                        note = models.Note("markdown",
                                           title, "# " + title + "\ntestTESTtest")
                        note.category = third_c
                        models.db.session.add(note)

        models.db.session.commit()
