import pandas as pd


class ClassImbalanceTester:

    def run(self, y):

        counts = y.value_counts()

        majority = counts.max()

        minority = counts.min()

        ratio = round(minority / majority, 2)

        if ratio >= 0.80:
            status = "Excellent"

        elif ratio >= 0.60:
            status = "Good"

        elif ratio >= 0.40:
            status = "Moderate"

        else:
            status = "Poor"

        return {

            "test_name": "Class Imbalance Test",

            "majority_class": int(majority),

            "minority_class": int(minority),

            "balance_ratio": ratio,

            "status": status

        }


def run_class_imbalance_test(y):

    tester = ClassImbalanceTester()

    return tester.run(y)