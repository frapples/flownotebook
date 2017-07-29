#! /usr/bin/env python3

from flownotebook import app
from create_test_data import create_test_data


def main():
    create_test_data(app)
    app.run()


if __name__ == '__main__':
    main()
