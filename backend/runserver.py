#! /usr/bin/env python3

from flownotebook import create_app


def main():
    app = create_app()
    app.run(debug=True, use_reloader=False)


if __name__ == '__main__':
    main()
