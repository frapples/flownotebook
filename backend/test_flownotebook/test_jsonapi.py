import sys
sys.path.append("..")
import flownotebook


class Test:
    def setup(self):
        app = flownotebook.app
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.app = flownotebook.app.test_client()

    def teardown(self):
        pass
