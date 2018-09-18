# -*- coding:utf-8 -*-
from __future__ import unicode_literals

from decimal import Decimal

from django.contrib.auth.models import User
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models import Sum

from model_utils.models import TimeStampedModel
from jsonfield import JSONField


PAPER_CREATE_TYPE = (
    ('fixed', 'fixed'),
    ('random', 'random')
)

PROBLEM_TYPE = (
    ('multiplechoiceresponse', 'single_choice'),
    ('choiceresponse', 'multi_choice'),
    ('stringresponse', 'fill_in'),
)

TASK_STATE = (
    ('pending', 'pending'),
    ('started', 'started'),
    ('finished', 'finished'),
)

EXAM_RESULT = (
    ('pass', 'pass'),
    ('flunk', 'flunk'),
    ('pending', 'pending'),
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
    sequence = models.CharField(max_length=16, default='01')
    problem_id = models.CharField(max_length=255, db_index=True)
    problem_type = models.CharField(max_length=16, choices=PROBLEM_TYPE)
    grade = models.DecimalField(max_digits=5, decimal_places=2,
                                validators=[
                                    MinValueValidator(Decimal((0, (0, 0, 1), -2))),
                                    MaxValueValidator(Decimal(100))])
    content = JSONField()


class ExamPaperCreateRule(TimeStampedModel):

    exam_paper = models.ForeignKey(ExamPaper, related_name='rules', null=True)
    problem_section_id = models.CharField(max_length=255, null=True, blank=True)
    section_name = models.CharField(max_length=255)
    problem_type = models.CharField(max_length=16, choices=PROBLEM_TYPE)
    problem_num = models.IntegerField(default=0)
    grade = models.DecimalField(max_digits=5, decimal_places=2, default=1.00,
                                validators=[
                                    MinValueValidator(Decimal((0, (0, 0, 1), -2))),
                                    MaxValueValidator(Decimal(100))])


class ExamTask(TimeStampedModel):

    exampaper_name = models.CharField(max_length=50)
    exampaper_description = models.CharField(max_length=500, blank=True)
    exampaper_create_type = models.CharField(max_length=16, choices=PAPER_CREATE_TYPE)
    exampaper_passing_ratio = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(100)])
    creator = models.ForeignKey(User, db_index=True)
    task_state = models.CharField(max_length=16, choices=TASK_STATE, default='pending')
    period_start = models.DateTimeField()
    period_end = models.DateTimeField()
    exam_time_limit = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(1440)])
    problem_order = models.BooleanField(default=False)
    show_answer = models.BooleanField(default=False)


class ExamParticipant(TimeStampedModel):

    exam_task = models.ForeignKey(ExamTask, related_name='participant')
    participant = models.ForeignKey(User)
    exam_result = models.CharField(max_length=16, choices=EXAM_RESULT)
    participate_time = models.DateTimeField()
    hand_in_time = models.DateTimeField()

    @property
    def total_grade(self):
        result = self.answer.aggregate(total_grade=Sum('grade'))
        return result and result.get('total_grade') or 0


class ExamParticipantAnswer(TimeStampedModel):

    participant = models.ForeignKey(ExamParticipant, related_name='answer')
    problem_id = models.CharField(max_length=255, db_index=True)
    answer = models.TextField()
    grade = models.DecimalField(max_digits=5, decimal_places=2,
                                validators=[
                                    MinValueValidator(Decimal((0, (0, 0, 1), -2))),
                                    MaxValueValidator(Decimal(100))])


class ExamPaperProblemsSnapShot(TimeStampedModel):
    exam_paper = models.ForeignKey(ExamTask, related_name='problems', null=True)
    sequence = models.CharField(max_length=16, default='01')
    problem_id = models.CharField(max_length=255, db_index=True)
    problem_type = models.CharField(max_length=16, choices=PROBLEM_TYPE)
    grade = models.DecimalField(max_digits=5, decimal_places=2,
                                validators=[
                                    MinValueValidator(Decimal((0, (0, 0, 1), -2))),
                                    MaxValueValidator(Decimal(100))])
    content = JSONField()
