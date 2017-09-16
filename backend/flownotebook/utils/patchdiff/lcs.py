def LCS(A, B):
    table = (len(A) + 1) * [None]

    for i in range(len(A), -1, -1):
        for j in range(len(B), -1, -1):
            if i >= len(A) or j >= len(B):
                if table[i] is None:
                    table[i] = (len(B) + 1) * [None]
                table[i][j] = ([], [])
            elif A[i] == B[j]:
                resultA, resultB = table[i + 1][j + 1]
                table[i][j] = ([i] + resultA,
                               [j] + resultB)
                table[i + 1][j + 1] = None
            else:
                table[i][j] = max(table[i + 1][j], table[i][j + 1],
                                  key=lambda item: len(item[0]))

    return table[0][0]
