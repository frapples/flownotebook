# LCS的递归思路
# def LCS(A, B):
#     if len(A) == 0 or len(B) == 0:
#         return 0
#     elif A[0] == B[0]:
#         return LCS(A.sub(1), B.sub(1)) + 1
#     else:
#         return max(LCS(A.sub(1), B), LCS(A, B.sub(1)))


def LCS_imp(A, A_start, B, B_start):
    if A_start >= len(A) or B_start >= len(B):
        return [], []
    elif A[A_start] == B[B_start]:
        resultA, resultB = LCS_imp(A, A_start + 1, B, B_start + 1)
        return [A_start] + resultA, [B_start] + resultB
    else:
        return max(LCS_imp(A, A_start + 1, B, B_start),
                   LCS_imp(A, A_start, B, B_start + 1),
                   key=lambda item: len(item[0]))


def LCS(A, B):
    return LCS_imp(A, 0, B, 0)
