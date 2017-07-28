import sys
import json
sys.path.append("..")
from flownotebook import app


class TestUser:
    def setup(self):
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        print('setup>>>')
        self.app = app.test_client(use_cookies=True)

    def test_user(self):
        self.user_register(self.app)
        self.user_login(self.app)
        self.is_login(self.app)

    @staticmethod
    def user_register(app):
        url = '/json_api/user/register'
        post_data = {'username': 'testname', 'password': "12345678"}
        rv = app.post(url, data=post_data)
        result = json.loads(rv.data.decode())

        assert result['success']

        rv = app.post(url, data=post_data)
        result = json.loads(rv.data.decode())
        assert not result['success'] and result['reason'] == "USERNAME_EXISTED"

    @staticmethod
    def user_login(app):
        url = '/json_api/user/login'

        rv = app.post(url, data={'username': 'testname',
                                 'password': '12345678'})
        result = json.loads(rv.data.decode())
        assert result['success']

        rv = app.post(url, data={'username': 'testname',
                                 'password': '12345688'})
        result = json.loads(rv.data.decode())
        assert not result['success']

    @staticmethod
    def is_login(app):
        rv = app.post("/json_api/user/is_login")
        result = json.loads(rv.data.decode())
        assert result['is_login']

    def teardown(self):
        pass


class TestNote:
    def setup(self):
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        print('setup>>>')
        self.app = app.test_client(use_cookies=True)

        TestUser.user_login(self.app)

    def test_note(self):
        categories = {
            'A': {
                'AA': {
                    'AAA': {
                    },
                    'BBB': {
                    },
                    'CCC': {
                    }
                },
                'BB': {
                },
                'CC': {
                }
            },
            'B': {
            },
            'C': {
            }
        }

        def cmp(a, b):
            if len(a) != len(b):
                return False
            for k in a:
                if k not in b:
                    return False
                if not cmp(a[k], b[k]):
                    return False
            return True

        self.add_categories(self.app, categories)
        assert cmp(categories, self.get_all_categories(self.app))

    @staticmethod
    def add_categories(app, categories):

        def add(category, pid):
            for name in category:
                url = '/json_api/note/category_add'
                rv = app.post(url, data={'parent_id': pid, 'name': name})
                result = json.loads(rv.data.decode())
                print(result)
                assert result['success']
                add(category[name], pid=result['id'])

        add(categories, -1)

    @staticmethod
    def get_all_categories(app):
        def fetch(id):
            url = '/json_api/note/category_children'
            rv = app.post(url, data={'id': id})
            result = json.loads(rv.data.decode())
            assert result['success']
            return result['data']

        def get(id):
            result = dict()

            nodes = fetch(id)
            for n in nodes:
                result[n['name']] = get(n['id'])
            return result

        return get(-1)
