import re
import patchdiff


def diff(old, new):
    old = old.split("\n")
    new = new.split("\n")
    diff_result = patchdiff.diff(old, new)

    result = []
    for i, c in diff_result.deled:
        result.append(str(i) + "- " + c + "\n")

    for i, c in diff_result.added:
        result.append(str(i) + "+ " + c + "\n")
    return "".join(result)


def patch(old, diff):
    old = old.split("\n")
    diff_result = patchdiff.Diff([], [])
    for line in diff.split("\n"):
        res = re.findall(r"(\d+)([+-]) (.*)", line)
        if res:
            number, op, content = res[0]
            number = int(number)
            if op == '-':
                diff_result.deled.append(patchdiff.DiffItem(number, content))
            elif op == '+':
                diff_result.added.append(patchdiff.DiffItem(number, content))

    return "\n".join(patchdiff.patch(old, diff_result))
