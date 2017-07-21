#! /usr/bin/env python3

from flownotebook import app


def main():
    app.run(debug=True, use_reloader=False)


if __name__ == '__main__':
    main()
