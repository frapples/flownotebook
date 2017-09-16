import unittest
from linepatchdiff import patch, diff


class TestLineDiffPath(unittest.TestCase):

    def test_normal(self):
        old = "\n".join("a b c d e a f e 2 2 g".split(" "))
        new = "\n".join("a b c 1 1 1 d d e d f g".split(" "))
        diff_ = diff(old, new)
        self.assertEqual(patch(old, diff_), new)

    def test_empty(self):
        old = "\n"
        new = "\n"
        diff_ = diff(old, new)
        self.assertEqual(patch(old, diff_), new)

    def test_empty1(self):
        old = "\n"
        new = "\n".join("a b c 1 1 1 d d e d f g".split(" "))
        diff_ = diff(old, new)
        self.assertEqual(patch(old, diff_), new)

    def test_empty2(self):
        old = ""
        new = "\n".join("a b c 1 1 1 d d e d f g".split(" "))
        diff_ = diff(old, new)
        self.assertEqual(patch(old, diff_), new)


if __name__ == '__main__':
    unittest.main()
