import collections
# from lcs_nodp import LCS
from lcs import LCS


Diff = collections.namedtuple('Diff', ['deled', 'added'])
DiffItem = collections.namedtuple('DiffItem', ['index', 'content'])


def diff(old, new):
    resultA, resultB = LCS(old, new)
    deled = not_included_range(convert(resultA), len(old))
    added = not_included_range(convert(resultB), len(new))

    diff_result = Diff([], [])

    for start, end in deled:
        for i in range(start, end):
            diff_result.deled.append(DiffItem(i, old[i]))

    for start, end in added:
        for i in range(start, end):
            diff_result.added.append(DiffItem(i, new[i]))

    return diff_result


def patch(old, diff_):
    for i, c in diff_.deled:
        old[i] = None
    deled_result = (c for c in old if c is not None)

    result = []
    result_index = 0
    add = diff_.added
    for c in deled_result:
        while add and add[0].index == result_index:
            result.append(add[0].content)
            result_index += 1
            add.pop(0)

        result.append(c)
        result_index += 1
    else:
        while add and add[0].index == result_index:
            result.append(add[0].content)
            result_index += 1
            add.pop(0)

    return result


def convert(common):
    # [start, end]
    if not common:
        return []

    result = []
    start = common[0]
    for cur, next in zip(common, common[1:] + [None]):
        if next is None:
            result.append((start, cur))
        elif cur + 1 != next:
            result.append((start, cur))
            start = next
    return result


def not_included_range(ranges, end):
    # [start, end)
    if not ranges:
        return [(0, end)]

    result = []
    if ranges[0][0] != 0:
        result.append((0, ranges[0][0]))
    for cur, next in zip(ranges, ranges[1:]):
        result.append((cur[1] + 1, next[0]))

    end_range = ranges[len(ranges) - 1]
    if end_range[1] != end - 1:
        result.append((end_range + 1, end))

    return result
