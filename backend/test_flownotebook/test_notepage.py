import sys
sys.path.append("..")
import flownotebook


class Test:
    def setup(self):
        app = flownotebook.app
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.app = flownotebook.app.test_client()

    def test_index(self):
        rv = self.app.get('/')
        assert rv.status_code == 200
        assert len(rv.data) > 0

    def teardown(self):
        pass
