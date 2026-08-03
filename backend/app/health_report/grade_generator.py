"""
ModelGuard AI

Health Grade Generator
"""


class GradeGenerator:

    def generate(self, score):

        if score >= 98:

            return "A+"

        elif score >= 95:

            return "A"

        elif score >= 90:

            return "A-"

        elif score >= 85:

            return "B+"

        elif score >= 80:

            return "B"

        elif score >= 70:

            return "C"

        else:

            return "F"


def generate_grade(score):

    generator = GradeGenerator()

    return generator.generate(score)