# -*- coding:utf-8 -*-
from __future__ import unicode_literals

from django.contrib.auth.models import User
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models import Sum
from model_utils.models import TimeStampedModel


PAPER_CREATE_TYPE = (
    ('fixed', 'fixed'),
    ('random', 'random')
)

PROBLEM_TYPE = (
    ('sc', 'single_choice'),
    ('mc', 'multi_choice'),
    ('fi', 'fill_in'),
    ('tof', 'true_or_false'),
)


class ExamPaper(TimeStampedModel):

    name = models.CharField(max_length=50)
    description = models.CharField(max_length=500, blank=True)
    create_type = models.CharField(max_length=16, choices=PAPER_CREATE_TYPE, default='fixed')
    passing_ratio = models.IntegerField(default=60,
                                        validators=[MinValueValidator(1), MaxValueValidator(100)])
    creator = models.ForeignKey(User, db_index=True)

    @property
    def total_problem_num(self):
        return self.problems.count()

    @property
    def total_grade(self):
        result = self.problems.aggregate(total_grade=Sum('grade'))
        return result and result.get('total_grade') or 0


class ExamPaperProblems(TimeStampedModel):

    exam_paper = models.ForeignKey(ExamPaper, related_name='problems', null=True)
    sequence = models.IntegerField(default=1)
    problem_id = models.CharField(max_length=255, db_index=True)
    grade = models.DecimalField(max_digits=5, decimal_places=2,
                                validators=[MinValueValidator(0.01), MaxValueValidator(100.00)])


class ExamPaperCreateRule(TimeStampedModel):

    exam_paper = models.ForeignKey(ExamPaper, related_name='rules', null=True)
    problem_section_id = models.CharField(max_length=255, null=True, blank=True)
    problem_type = models.CharField(max_length=16, choices=PROBLEM_TYPE)
    problem_num = models.IntegerField(default=0)
    grade = models.DecimalField(max_digits=5, decimal_places=2, default=1.00,
                                validators=[MinValueValidator(0.01), MaxValueValidator(100.00)])

