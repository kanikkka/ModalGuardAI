import pandas as pd


class DuplicateDetector:

    def run(self, dataframe):

        duplicates = dataframe.duplicated().sum()

        total = len(dataframe)

        percentage = round(

            duplicates / total * 100,

            2

        )

        return {

            "test_name": "Duplicate Detection",

            "duplicate_rows": int(duplicates),

            "duplicate_percentage": percentage,

            "status": "PASS"

            if percentage < 5

            else "FAIL"

        }


def run_duplicate_detection(dataframe):

    detector = DuplicateDetector()

    return detector.run(dataframe)