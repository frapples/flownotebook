import sys
sys.path.append("..")
from flownotebook import app


class Test:
    def setup(self):
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.app = app.test_client()

    def test_index(self):
        rv = self.app.get('/')
        assert rv.status_code == 200
        assert len(rv.data) > 0

    def teardown(self):
        pass
