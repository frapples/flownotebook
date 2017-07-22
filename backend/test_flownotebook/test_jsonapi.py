import sys
import json
sys.path.append("..")
from flownotebook import app


class Test:
    def setup(self):
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        print('setup>>>')
        self.app = app.test_client(use_cookies=True)

    def test_user(self):
        self.user_register()
        self.user_login()
        self.is_login()

    def user_register(self):
        url = '/json_api/user/register'
        post_data = {'username': 'testname', 'password': "12345678"}
        rv = self.app.post(url, data=post_data)
        result = json.loads(rv.data.decode())

        assert result['success']

        rv = self.app.post(url, data=post_data)
        result = json.loads(rv.data.decode())
        assert not result['success'] and result['reason'] == "USERNAME_EXISTED"

    def user_login(self):
        url = '/json_api/user/login'

        rv = self.app.post(url, data={'username': 'testname',
                                      'password': '12345678'})
        result = json.loads(rv.data.decode())
        assert result['success']

        rv = self.app.post(url, data={'username': 'testname',
                                      'password': '12345688'})
        result = json.loads(rv.data.decode())
        assert not result['success']

    def is_login(self):
        rv = self.app.post("/json_api/user/is_login")
        result = json.loads(rv.data.decode())
        assert result['is_login']

    def teardown(self):
        pass
