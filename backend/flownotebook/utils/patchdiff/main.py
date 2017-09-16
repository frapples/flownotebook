from .linepatchdiff import patch, diff


def main():
    old = """
    int main(void) {
        int sum = 0;
        for (int i = 0; i < 10; i++)
        {
            sum += i;
        }
        return 0;
    }
    """

    new = """
    int main(void) {
        int sum = 0;
        for (int i = 0; i < 10; i++)
            sum += i;
        printf("%d", sum);
        return 0;
    }
    """

    diff_ = diff(old, new)
    print(diff_)

    assert patch(old, diff_) == new


if __name__ == "__main__":
    main()
